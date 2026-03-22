import { Router } from "express";
import { z, ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { storage } from "../storage.js";
import { insertOrderSchema } from "../../shared/schema.js";
import { getOrCreateUser, adminAuth, adminApiRateLimit, upload } from "./common.js";
import { userAuth } from "../auth.js";
import { v2 as cloudinary } from 'cloudinary';
import { hubspot } from "../hubspot.js";

const router = Router();

// Public
router.post("/orders", async (req, res) => {
  try {
    const order = insertOrderSchema.parse(req.body);
    let couponDiscount = 0;
    let originalAmount = order.amount;
    let couponId: string | null = null;

    if (order.couponCode) {
      const coupon = await storage.getCouponByCode(order.couponCode);
      if (coupon && coupon.isActive) {
        const now = new Date();
        const validDate = (!coupon.startDate || new Date(coupon.startDate) <= now) &&
          (!coupon.endDate || new Date(coupon.endDate) >= now);
        const validUses = coupon.maxTotalUses === 0 || coupon.currentUses < coupon.maxTotalUses;
        const validPlan = coupon.applicablePlans.length === 0 || coupon.applicablePlans.includes(order.plan);

        if (validDate && validUses && validPlan) {
          const servicesCount = 1; // Basic count for coupons in agency context
          if (coupon.discountType === 'percentage') {
            couponDiscount = Math.round(originalAmount * (coupon.discountValue / 100));
          } else {
            couponDiscount = coupon.discountValue * servicesCount;
          }
          couponDiscount = Math.min(couponDiscount, originalAmount);
          couponId = coupon._id;
        }
      }
    }

    const finalAmount = originalAmount - couponDiscount;
    const userId = await getOrCreateUser(order.email, order.clientName, order.phone);

    const newOrder = await storage.createOrder({
      ...order,
      amount: finalAmount,
      userId
    });

    if (couponId && couponDiscount > 0) {
      await storage.incrementCouponUsage(couponId, order.phone, (newOrder as any)._id.toString(), 1);
    }

    // Background sync to HubSpot
    hubspot.syncOrder(newOrder as any).catch(e => console.error("HubSpot Order Sync Error:", e));

    res.json(newOrder);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: fromZodError(error).message });
    } else {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  }
});

router.post("/orders/:id/upload", upload.single("transferImage"), async (req, res) => {
  try {
    const id = req.params.id as string;
    const file = req.file;
    if (!file) return res.status(400).json({ message: "لم يتم رفع ملف" });

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "abqary-transfers",
          public_id: `transfer-${id}-${Date.now()}`,
          transformation: [
            { quality: "auto", fetch_format: "auto" },
            { width: 800, height: 800, crop: "limit" }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(file.buffer);
    });

    const imageUrl = (result as any).secure_url;
    const order = await storage.updateOrderImage(id, imageUrl);
    if (!order) return res.status(404).json({ message: "الطلب غير موجود" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "خطأ في رفع الصورة" });
  }
});

// User
router.get("/user/orders", userAuth, async (req, res) => {
  try {
    const orders = await storage.getUserOrders((req as any).userAuth?.id || "");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "خطأ في جلب الطلبات" });
  }
});

router.put("/user/orders/:id/cancel", userAuth, async (req, res) => {
  try {
    const id = req.params.id as string;
    const { reason } = req.body;
    const order = await storage.cancelOrder(id, reason);
    if (!order) return res.status(404).json({ message: "الطلب غير موجود" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "خطأ في إلغاء الطلب" });
  }
});

// Admin
router.get("/admin/orders", adminAuth, adminApiRateLimit, async (_req, res) => {
  try {
    const orders = await storage.getOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "خطأ في جلب الطلبات" });
  }
});

router.put("/admin/orders/:id/status", adminAuth, adminApiRateLimit, async (req, res) => {
  try {
    const id = req.params.id as string;
    const status = req.body.status as string;
    const order = await storage.updateOrderStatus(id, status);
    if (!order) return res.status(404).json({ message: "الطلب غير موجود" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "خطأ في تحديث الحالة" });
  }
});

router.put("/admin/orders/:id/plan", adminAuth, adminApiRateLimit, async (req, res) => {
  try {
    const id = req.params.id as string;
    const { plan, amount } = req.body;
    const order = await storage.updateOrderPlan(id, plan, amount);
    if (!order) return res.status(404).json({ message: "الطلب غير موجود" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "خطأ في تحديث الباقة" });
  }
});

router.put("/admin/orders/:id/cancel", adminAuth, adminApiRateLimit, async (req, res) => {
  try {
    const id = req.params.id as string;
    const { reason } = req.body;
    const order = await storage.cancelOrder(id, reason);
    if (!order) return res.status(404).json({ message: "الطلب غير موجود" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "خطأ في إلغاء الطلب" });
  }
});

export default router;
