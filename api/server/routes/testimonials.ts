import { Router } from "express";
import { z, ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { storage } from "../storage.js";
import { insertTestimonialSchema } from "../../shared/schema.js";
import { adminAuth, adminApiRateLimit } from "./common.js";

const router = Router();

// Public
router.get("/testimonials", async (_req, res) => {
  try {
    const testimonials = await storage.getTestimonials(true);
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: "خطأ في جلب آراء العملاء", error: error instanceof Error ? error.message : String(error) });
  }
});

// Admin
router.get("/admin/testimonials", adminAuth, adminApiRateLimit, async (_req, res) => {
  try {
    const testimonials = await storage.getTestimonials(false);
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: "خطأ في جلب آراء العملاء" });
  }
});

router.post("/admin/testimonials", adminAuth, adminApiRateLimit, async (req, res) => {
  try {
    const data = insertTestimonialSchema.parse(req.body);
    const created = await storage.createTestimonial(data);
    res.status(201).json(created);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: fromZodError(error).message });
    } else {
      res.status(500).json({ message: "خطأ في إضافة رأي العميل" });
    }
  }
});

router.put("/admin/testimonials/:id", adminAuth, adminApiRateLimit, async (req, res) => {
  try {
    const id = req.params.id as string;
    const data = insertTestimonialSchema.partial().parse(req.body);
    const updated = await storage.updateTestimonial(id, data);
    if (!updated) return res.status(404).json({ message: "غير موجود" });
    res.json(updated);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: fromZodError(error).message });
    } else {
      res.status(500).json({ message: "خطأ في تحديث رأي العميل" });
    }
  }
});

router.delete("/admin/testimonials/:id", adminAuth, adminApiRateLimit, async (req, res) => {
  try {
    const id = req.params.id as string;
    const deleted = await storage.deleteTestimonial(id);
    if (!deleted) return res.status(404).json({ message: "غير موجود" });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "خطأ في حذف رأي العميل" });
  }
});

export default router;
