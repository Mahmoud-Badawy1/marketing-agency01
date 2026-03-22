import { Router } from "express";
import { storage } from "../storage.js";
import { adminAuth, adminApiRateLimit } from "./common.js";
import { hubspot } from "../hubspot.js";

const router = Router();

/**
 * Admin: Get Sync Preview (Counts)
 */
router.get("/admin/hubspot/preview", adminAuth, adminApiRateLimit, async (_req, res) => {
  try {
    const leadsCount = await storage.getLeads().then(l => l.length);
    const trialsCount = await storage.getTrialBookings().then(t => t.length);
    const ordersCount = await storage.getOrders().then(o => o.length);

    res.json({
      leads: leadsCount,
      trials: trialsCount,
      orders: ordersCount
    });
  } catch (error) {
    console.error("[HubSpot Admin] Error in sync preview:", error);
    res.status(500).json({ message: "خطأ في جلب بيانات المعاينة" });
  }
});

/**
 * Admin: Bulk Sync All Data to HubSpot
 */
router.post("/admin/hubspot/sync-all", adminAuth, adminApiRateLimit, async (_req, res) => {
  try {
    // 1. Fetch all records
    const leads = await storage.getLeads();
    const trials = await storage.getTrialBookings();
    const orders = await storage.getOrders();

    console.log(`[HubSpot Bulk Sync] Starting sync for ${leads.length} leads, ${trials.length} trials, ${orders.length} orders.`);

    // 2. Sync in background (non-blocking)
    const syncProcess = async () => {
      for (const lead of leads) {
        await hubspot.syncLead(lead as any);
      }
      for (const trial of trials) {
        await hubspot.syncTrialBooking(trial as any);
      }
      for (const order of orders) {
        await hubspot.syncOrder(order as any);
      }
      console.log("[HubSpot Bulk Sync] Completed all background sync tasks.");
    };

    syncProcess().catch(err => console.error("[HubSpot Bulk Sync] Process failed:", err));

    res.json({ 
      message: "بدأت عملية المزامنة الشاملة في الخلفية. قد يستغرق الأمر بضع دقائق حتى تظهر جميع البيانات في HubSpot.",
      stats: { leads: leads.length, trials: trials.length, orders: orders.length }
    });
  } catch (error) {
    console.error("[HubSpot Admin] Error in bulk sync:", error);
    res.status(500).json({ message: "خطأ في بدء عملية المزامنة" });
  }
});

export default router;
