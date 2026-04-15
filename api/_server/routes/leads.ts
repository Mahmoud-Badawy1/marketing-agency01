import { Router } from "express";
import { z, ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { storage } from "../storage.js";
import { insertLeadSchema } from "../../_shared/schema.js";
import { getOrCreateUser, adminAuth, adminApiRateLimit } from "./common.js";
import { hubspot } from "../hubspot.js";

const router = Router();

// Public
router.post("/leads", async (req, res) => {
  try {
    const lead = insertLeadSchema.parse(req.body);
    const userId = await getOrCreateUser(lead.email, lead.clientName, lead.phone);
    const newLead = await storage.createLead({ ...lead, userId });
    
    // Background sync to HubSpot
    hubspot.syncLead(newLead as any).catch(e => console.error("HubSpot Lead Sync Error:", e));
    
    res.json(newLead);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: fromZodError(error).message });
    } else {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  }
});

// Admin
router.get("/admin/leads", adminAuth, adminApiRateLimit, async (_req, res) => {
  try {
    const leads = await storage.getLeads();
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: "خطأ في جلب العملاء المحتملين" });
  }
});

router.put("/admin/leads/:id/status", adminAuth, adminApiRateLimit, async (req, res) => {
  try {
    const id = req.params.id as string;
    const status = req.body.status as string;
    const lead = await storage.updateLeadStatus(id, status);
    if (!lead) {
      return res.status(404).json({ message: "العميل المحتمل غير موجود" });
    }
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: "خطأ في تحديث الحالة" });
  }
});

router.delete("/admin/leads/:id", adminAuth, adminApiRateLimit, async (req, res) => {
  try {
    const id = req.params.id as string;
    const success = await storage.deleteLead(id);
    if (!success) {
      return res.status(404).json({ message: "العميل المحتمل غير موجود" });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "خطأ في حذف العميل المحتمل" });
  }
});

export default router;
