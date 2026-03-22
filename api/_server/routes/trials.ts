import { Router } from "express";
import { z, ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { storage } from "../storage.js";
import { insertTrialBookingSchema, TrialBooking } from "../../_shared/schema.js";
import { getOrCreateUser, adminAuth, adminApiRateLimit } from "./common.js";
import { userAuth } from "../auth.js";
import { hubspot } from "../hubspot.js";

const router = Router();

// Public
router.post("/trial-bookings", async (req, res) => {
  try {
    const booking = insertTrialBookingSchema.parse(req.body);
    const userId = await getOrCreateUser(booking.email, booking.clientName, booking.phone);
    
    if (booking.scheduledSlotId) {
      await storage.incrementSlotBooking(booking.scheduledSlotId);
      
      // Automatically set scheduledTime from the slot if not provided
      if (!booking.scheduledTime) {
        const slot = await storage.getAvailabilitySlot(booking.scheduledSlotId);
        if (slot) {
          const [hours, minutes] = slot.startTime.split(':');
          const d = new Date(slot.date);
          d.setHours(parseInt(hours), parseInt(minutes));
          (booking as any).scheduledTime = d;
        }
      }
    }
    
    const newBooking = await storage.createTrialBooking({ ...booking, userId });
    
    // Background sync to HubSpot
    hubspot.syncTrialBooking(newBooking as any).catch(e => console.error("HubSpot Trial Sync Error:", e));
    
    res.json(newBooking);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: fromZodError(error).message });
    } else {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  }
});

// Helper to ensure scheduledTime is set if scheduledSlotId exists
async function repairBookingTime(booking: any) {
  if (!booking.scheduledTime && booking.scheduledSlotId) {
    try {
      const slot = await storage.getAvailabilitySlot(booking.scheduledSlotId);
      if (slot) {
        const [hours, minutes] = slot.startTime.split(':');
        const d = new Date(slot.date);
        d.setHours(parseInt(hours), parseInt(minutes));
        
        await storage.updateTrialBooking(booking._id.toString(), { scheduledTime: d });
        return { ...booking, scheduledTime: d };
      }
    } catch (e) {
      console.error(`Failed to repair booking ${booking._id}:`, e);
    }
  }
  return booking;
}

// User
router.get("/user/trials", userAuth, async (req, res) => {
  try {
    const trials = await storage.getUserTrialBookings((req as any).userAuth?.id || "");
    const repairedTrials = await Promise.all(trials.map(repairBookingTime));
    res.json(repairedTrials);
  } catch (error) {
    res.status(500).json({ message: "خطأ في جلب الحجوزات" });
  }
});

router.put("/user/trials/:id/cancel", userAuth, async (req, res) => {
  try {
    const id = req.params.id as string;
    const { reason } = req.body;
    const userId = (req as any).userAuth?.id;

    // Verify ownership
    const trials = await storage.getUserTrialBookings(userId);
    const booking = trials.find(t => t._id.toString() === id);
    
    if (!booking) {
      return res.status(404).json({ message: "الحجز غير موجود أو غير تابع لك" });
    }

    const updated = await storage.cancelTrialBooking(id, reason as string);
    res.json(updated);
  } catch (error) {
    console.error("Error cancelling trial:", error);
    res.status(500).json({ message: "خطأ في إلغاء الحجز" });
  }
});

router.put("/user/trials/:id", userAuth, async (req, res) => {
  try {
    const id = req.params.id as string;
    const userId = (req as any).userAuth?.id;
    const data = insertTrialBookingSchema.partial().parse(req.body);

    // Verify ownership
    const trials = await storage.getUserTrialBookings(userId);
    const booking = trials.find(t => t._id.toString() === id);
    
    if (!booking) {
      return res.status(404).json({ message: "الحجز غير موجود أو غير تابع لك" });
    }

    // Check rescheduling deadline against existing booking time
    if (data.scheduledSlotId || data.scheduledTime) {
      if (booking.scheduledTime) {
        const now = new Date();
        const startTime = new Date(booking.scheduledTime as any);
        const diffHours = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        const resSettings = await storage.getSetting("booking_policies");
        const policies = resSettings?.value || {};
        const deadline = policies.cancelDeadlineHours || 48;

        if (diffHours < deadline) {
          return res.status(400).json({ message: `لا يمكن التعديل قبل الموعد بـ ${deadline} ساعة` });
        }
      }
    }

    // If scheduledSlotId is provided, derive scheduledTime from the slot
    const updateData: any = { ...data };
    if (data.scheduledSlotId) {
      const slot = await storage.getAvailabilitySlot(data.scheduledSlotId);
      if (!slot) {
        return res.status(400).json({ message: "الموعد المختار غير متاح" });
      }
      const [hours, minutes] = slot.startTime.split(':');
      const d = new Date(slot.date);
      d.setHours(parseInt(hours), parseInt(minutes));
      updateData.scheduledTime = d;

      // Increment the new slot booking count
      await storage.incrementSlotBooking(data.scheduledSlotId);
    }

    const updated = await storage.updateTrialBooking(id, updateData);
    res.json(updated);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: fromZodError(error).message });
    } else {
      res.status(500).json({ message: "خطأ في تحديث الحجز" });
    }
  }
});

// Admin
router.get("/admin/trial-bookings", adminAuth, adminApiRateLimit, async (_req, res) => {
  try {
    const bookings = await storage.getTrialBookings();
    const repairedBookings = await Promise.all(bookings.map(repairBookingTime));
    res.json(repairedBookings);
  } catch (error) {
    res.status(500).json({ message: "خطأ في جلب حجوزات التجربة" });
  }
});

router.put("/admin/trial-bookings/:id/status", adminAuth, adminApiRateLimit, async (req, res) => {
  try {
    const id = req.params.id as string;
    const status = req.body.status as string;
    const booking = await storage.updateTrialStatus(id, status);
    if (!booking) return res.status(404).json({ message: "الحجز غير موجود" });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "خطأ في تحديث الحالة" });
  }
});

router.put("/admin/trial-bookings/:id", adminAuth, adminApiRateLimit, async (req, res) => {
  try {
    const id = req.params.id as string;
    const data = insertTrialBookingSchema.partial().parse(req.body);
    const updated = await storage.updateTrialBooking(id, data);
    if (!updated) return res.status(404).json({ message: "الحجز غير موجود" });
    res.json(updated);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: fromZodError(error).message });
    } else {
      res.status(500).json({ message: "خطأ في تحديث بيانات الحجز" });
    }
  }
});

// Admin cancel trial
router.put("/admin/trial-bookings/:id/cancel", adminAuth, adminApiRateLimit, async (req, res) => {
  try {
    const id = req.params.id as string;
    const reason = req.body.reason || "تم الإلغاء بواسطة المسؤول";
    const updated = await storage.cancelTrialBooking(id, reason);
    if (!updated) return res.status(404).json({ message: "الحجز غير موجود" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "خطأ في إلغاء الحجز" });
  }
});

// Admin delete trial
router.delete("/admin/trial-bookings/:id", adminAuth, adminApiRateLimit, async (req, res) => {
  try {
    const id = req.params.id as string;
    const deleted = await storage.deleteTrialBooking(id);
    if (!deleted) return res.status(404).json({ message: "الحجز غير موجود" });
    res.json({ success: true, message: "تم حذف الحجز بنجاح" });
  } catch (error) {
    res.status(500).json({ message: "خطأ في حذف الحجز" });
  }
});

export default router;
