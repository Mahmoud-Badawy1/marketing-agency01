import { Router } from "express";
import { z, ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { storage } from "../storage.js";
import { insertCouponSchema } from "../../shared/schema.js";
import { adminAuth, adminApiRateLimit } from "./common.js";

const router = Router();

// Admin
router.get("/admin/coupons", adminAuth, adminApiRateLimit, async (_req, res) => {
  try {
    const coupons = await storage.getCoupons();
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: "خطأ في جلب الكوبونات" });
  }
});

router.post("/admin/coupons", adminAuth, adminApiRateLimit, async (req, res) => {
  try {
    const data = insertCouponSchema.parse(req.body);
    const created = await storage.createCoupon(data);
    res.status(201).json(created);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: fromZodError(error).message });
    } else {
      const mongoErr = error as any;
      if (mongoErr.code === 11000) {
        res.status(400).json({ message: "كود الخصم موجود بالفعل" });
      } else {
        res.status(500).json({ message: "خطأ في إنشاء الكوبون" });
      }
    }
  }
});

router.put("/admin/coupons/:id", adminAuth, adminApiRateLimit, async (req, res) => {
  try {
    const id = req.params.id as string;
    const data = insertCouponSchema.partial().parse(req.body);
    const updated = await storage.updateCoupon(id, data);
    if (!updated) return res.status(404).json({ message: "الكوبون غير موجود" });
    res.json(updated);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: fromZodError(error).message });
    } else {
      res.status(500).json({ message: "خطأ في تحديث الكوبون" });
    }
  }
});

router.delete("/admin/coupons/:id", adminAuth, adminApiRateLimit, async (req, res) => {
  try {
    const id = req.params.id as string;
    const deleted = await storage.deleteCoupon(id);
    if (!deleted) return res.status(404).json({ message: "الكوبون غير موجود" });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "خطأ في حذف الكوبون" });
  }
});

export default router;
