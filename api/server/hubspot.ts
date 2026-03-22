import { LeadType, TrialBookingType, OrderType } from "../shared/schema.js";
import { storage } from "./storage.js";

const BASE_URL = "https://api.hubapi.com/crm/v3/objects";

/**
 * Robust HubSpot Synchronization Service
 */
export const hubspot = {
  _cachedToken: null as string | null,
  _tokenTimestamp: 0,

  async _getAccessToken(): Promise<string | null> {
    const now = Date.now();
    // Cache token for 1 minute to avoid DB spam during bulk sync
    if (this._cachedToken && (now - this._tokenTimestamp < 60000)) {
      return this._cachedToken;
    }

    try {
      const settings = await storage.getSettings();
      const hubspotToken = settings.find(s => s.key === "HUBSPOT_ACCESS_TOKEN")?.value;

      this._cachedToken = hubspotToken || process.env.HUBSPOT_ACCESS_TOKEN || null;
      this._tokenTimestamp = now;
      return this._cachedToken;
    } catch (error) {
      console.error("[HubSpot] Error fetching token from DB:", error);
      return process.env.HUBSPOT_ACCESS_TOKEN || null;
    }
  },

  /**
   * Sync a lead (Contact Form submission)
   */
  async syncLead(lead: LeadType) {
    const token = await this._getAccessToken();
    if (!token) return;

    try {
      const properties = {
        email: lead.email || undefined,
        phone: lead.phone,
        fullname: lead.clientName,
        monthly_budget: lead.monthlyBudget.toString(),
        service_interest: lead.serviceInterest || "",
        company: lead.companyName || "",
        message: lead.message || "",
        lifecyclestage: "lead"
      };

      const result = await this._upsertContact(properties, token);
      if (result) {
        console.log(`[HubSpot] Successfully synced agency lead: ${lead.email || lead.phone}`);
      } else {
        console.warn(`[HubSpot] Failed to sync agency lead: ${lead.email || lead.phone}`);
      }
    } catch (error) {
      console.error("[HubSpot] Error syncing agency lead:", error);
    }
  },

  /**
   * Sync a trial booking (Strategy Call)
   */
  async syncTrialBooking(booking: TrialBookingType) {
    const token = await this._getAccessToken();
    if (!token) return;

    try {
      const properties = {
        email: booking.email || undefined,
        phone: booking.phone,
        fullname: booking.clientName,
        company: booking.companyName || "",
        service_interest: booking.serviceInterest || "",
        trial_status: booking.status || "pending",
        lifecyclestage: "opportunity"
      };

      const result = await this._upsertContact(properties, token);
      if (result) {
        console.log(`[HubSpot] Successfully synced strategy call: ${booking.email || booking.phone}`);
      } else {
        console.warn(`[HubSpot] Failed to sync strategy call: ${booking.email || booking.phone}`);
      }
    } catch (error) {
      console.error("[HubSpot] Error syncing strategy call:", error);
    }
  },

  /**
   * Sync a subscription order (Service Plan)
   */
  async syncOrder(order: OrderType) {
    const token = await this._getAccessToken();
    if (!token) return;

    try {
      const companyName = order.companyName || order.projectName || "";
      // 1. Sync the Contact
      const contactProps = {
        email: order.email || undefined,
        phone: order.phone,
        fullname: order.clientName,
        company: companyName,
        monthly_budget: order.monthlyBudget.toString(),
        lifecyclestage: "customer"
      };
      const contact = await this._upsertContact(contactProps, token);

      // 2. Create a Deal
      const dealProps = {
        dealname: `Agency Plan: ${order.plan} - ${order.clientName}`,
        amount: order.amount.toString(),
        company: companyName,
        dealstage: order.status === "pending" ? "appointmentscheduled" : "closedwon",
        pipeline: "default"
      };

      const deal = await this._createObject("deals", dealProps, token);

      // 3. Associate Deal with Contact if we have IDs
      if (contact && deal && (contact as any).id && (deal as any).id) {
        await this._associateObjects("deals", (deal as any).id, "contacts", (contact as any).id, 3, token);
      }

      console.log(`[HubSpot] Successfully synced agency order and deal for: ${order.email || order.phone}`);
    } catch (error) {
      console.error("[HubSpot] Error syncing agency order:", error);
    }
  },

  // Internal Helpers
  async _upsertContact(properties: any, token: string) {
    if (!properties.email && !properties.id) return null;

    // Attempt to search by email first to avoid duplicates
    let existingId = null;
    if (properties.email) {
      const searchRes = await fetch(`${BASE_URL}/contacts/search`, {
        method: "POST",
        headers: this._headers(token),
        body: JSON.stringify({
          filterGroups: [{ filters: [{ propertyName: "email", operator: "EQ", value: properties.email }] }]
        })
      });
      if (searchRes.ok) {
        const data = await searchRes.json();
        if ((data as any).total > 0) {
          existingId = (data as any).results[0].id;
        }
      } else {
        const err = await searchRes.text();
        console.error(`[HubSpot] Search failed (checking for email ${properties.email}):`, err);
        // If search fails with auth error, don't even try the upsert
        if (searchRes.status === 401) return null;
      }
    }

    const method = existingId ? "PATCH" : "POST";
    const url = existingId ? `${BASE_URL}/contacts/${existingId}` : `${BASE_URL}/contacts`;

    const res = await fetch(url, {
      method,
      headers: this._headers(token),
      body: JSON.stringify({ properties })
    });

    if (!res.ok) {
      const err = await res.text();
      console.warn(`[HubSpot] Upsert failed for email ${properties.email}:`, err);
      // Fallback: If it's just a property mismatch, try syncing basics
      if (err.includes("Property values were not valid")) {
        console.log("[HubSpot] Retrying with basic properties only...");
        return this._upsertBasicContact(properties, existingId, token);
      }
      return null;
    }
    return await res.json();
  },

  async _upsertBasicContact(fullProps: any, existingId: string | null, token: string) {
    const basicProps = {
      email: fullProps.email,
      phone: fullProps.phone,
      fullname: fullProps.fullname
    };
    const url = existingId ? `${BASE_URL}/contacts/${existingId}` : `${BASE_URL}/contacts`;
    const res = await fetch(url, {
      method: existingId ? "PATCH" : "POST",
      headers: this._headers(token),
      body: JSON.stringify({ properties: basicProps })
    });
    return res.ok ? await res.json() : null;
  },

  async _createObject(objectType: string, properties: any, token: string) {
    const res = await fetch(`${BASE_URL}/${objectType}`, {
      method: "POST",
      headers: this._headers(token),
      body: JSON.stringify({ properties })
    });
    return res.ok ? await res.json() : null;
  },

  async _associateObjects(fromType: string, fromId: string, toType: string, toId: string, associationTypeId: number, token: string) {
    const url = `https://api.hubapi.com/crm/v3/associations/${fromType}/${toType}/batch/create`;
    await fetch(url, {
      method: "POST",
      headers: this._headers(token),
      body: JSON.stringify({
        inputs: [{
          from: { id: fromId },
          to: { id: toId },
          type: associationTypeId.toString()
        }]
      })
    });
  },

  _headers(token: string) {
    // Sanitize token: remove 'Bearer ' if user accidentally included it in the UI
    const cleanToken = token.trim().startsWith("Bearer ") 
      ? token.trim().substring(7) 
      : token.trim();

    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${cleanToken}`
    };
  }
};
