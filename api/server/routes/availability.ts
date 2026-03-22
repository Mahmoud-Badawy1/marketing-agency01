import { Router } from "express";
import { z, ZodError } from "zod";
import crypto from "crypto";
import { fromZodError } from "zod-validation-error";
import { storage } from "../storage.js";
import { insertAvailabilitySlotSchema } from "../../shared/schema.js";
import { adminAuth, adminApiRateLimit } from "./common.js";

function getNoonUTCDate(dateInput: string | Date): Date {
  if (typeof dateInput === 'string' && !dateInput.includes('T')) {
    return new Date(`${dateInput}T12:00:00Z`);
  }
  const d = new Date(dateInput);
  return new Date(`${d.toISOString().split('T')[0]}T12:00:00Z`);
}

const router = Router();

// Public
router.get("/availability/active", async (req, res) => {
  try {
    const { date } = req.query;
    const slots = await storage.getAvailabilitySlots(date as string);
    const activeSlots = slots.filter(s => s.isActive && s.totalBooked < s.capacity);
    res.json(activeSlots);
  } catch (error) {
    res.status(500).json({ message: "خطأ في جلب المواعيد المتاحة" });
  }
});

// Admin
router.get("/admin/availability", adminAuth, adminApiRateLimit, async (req, res) => {
  try {
    const { date } = req.query;
    const slots = await storage.getAvailabilitySlots(date as string);
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: "خطأ في جلب المواعيد" });
  }
});

router.post("/admin/availability-bulk", adminAuth, adminApiRateLimit, async (req, res) => {
  try {
    const { slots: baseTimeSlots, startDate, endDate, daysOfWeek } = z.object({
      slots: z.array(z.object({
        startTime: z.string(),
        endTime: z.string(),
        capacity: z.number().min(1).default(1),
        label: z.string().optional()
      })),
      startDate: z.string(),
      endDate: z.string(),
      daysOfWeek: z.array(z.number().min(0).max(6))
    }).parse(req.body);

    const allSlotsToCreate = [];
    
    // Using UTC strictly
    const nowLocalStr = new Date().toISOString().split('T')[0];
    const nowUTC = new Date(`${nowLocalStr}T12:00:00Z`);

    const start = getNoonUTCDate(startDate);
    const end = getNoonUTCDate(endDate);

    if (end < start) {
      return res.status(400).json({ message: "تاريخ النهاية يجب أن يكون بعد تاريخ البداية" });
    }

    const recurrenceId = crypto.randomUUID();
    
    const current = new Date(start);
    while (current <= end) {
      if (current >= nowUTC && daysOfWeek.includes(current.getUTCDay())) {
        for (const slot of baseTimeSlots) {
          allSlotsToCreate.push({
            ...slot,
            date: new Date(current),
            recurrenceId,
            recurrenceType: 'none' as const,
            isActive: true
          });
        }
      }
      current.setUTCDate(current.getUTCDate() + 1);
    }

    if (allSlotsToCreate.length === 0) {
      return res.status(400).json({ message: "لا توجد أيام مطابقة في النطاق المحدد أو أن التاريخ في الماضي" });
    }

    const createdSlots = await storage.createAvailabilitySlots(allSlotsToCreate);
    res.json(createdSlots);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: fromZodError(error).message });
    } else {
      res.status(500).json({ message: "خطأ في حفظ المواعيد" });
    }
  }
});

router.delete("/admin/availability-bulk", adminAuth, adminApiRateLimit, async (req, res) => {
  try {
    const { ids } = z.object({ ids: z.array(z.string()) }).parse(req.body);
    const success = await storage.deleteAvailabilitySlots(ids);
    res.json({ success });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: fromZodError(error).message });
    } else {
      res.status(500).json({ message: "خطأ في حذف المواعيد" });
    }
  }
});

router.post("/admin/availability", adminAuth, adminApiRateLimit, async (req, res) => {
  try {
    const slotData = insertAvailabilitySlotSchema.parse(req.body);
    if (req.body.date) {
      slotData.date = getNoonUTCDate(req.body.date);
    }
    const slot = await storage.createAvailabilitySlot(slotData);
    res.json(slot);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: fromZodError(error).message });
    } else {
      res.status(500).json({ message: "خطأ في حفظ الموعد" });
    }
  }
});

router.patch("/admin/availability-item/:id", adminAuth, adminApiRateLimit, async (req, res) => {
  try {
    const data = insertAvailabilitySlotSchema.partial().parse(req.body);
    if (req.body.date) {
      data.date = getNoonUTCDate(req.body.date);
    }
    const slot = await storage.updateAvailabilitySlot(req.params.id as string, data);
    if (!slot) return res.status(404).json({ message: "الموعد غير موجود" });
    res.json(slot);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: fromZodError(error).message });
    } else {
      res.status(500).json({ message: "خطأ في تحديث الموعد" });
    }
  }
});

router.delete("/admin/availability-item/:id", adminAuth, adminApiRateLimit, async (req, res) => {
  try {
    const success = await storage.deleteAvailabilitySlot(req.params.id as string);
    if (!success) return res.status(404).json({ message: "الموعد غير موجود" });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "خطأ في حذف الموعد" });
  }
});

router.patch("/admin/availability-series/:recurrenceId", adminAuth, adminApiRateLimit, async (req, res) => {
  try {
    const { updateData, originalStartTime } = z.object({
      updateData: insertAvailabilitySlotSchema.partial(),
      originalStartTime: z.string().optional()
    }).parse(req.body);
    
    if (updateData.date) {
      updateData.date = getNoonUTCDate(updateData.date);
    }

    if (!originalStartTime) {
      return res.status(400).json({ message: "يجب تحديد وقت البداية الأصلي لتحديث السلسلة بشكل صحيح" });
    }

    console.log(`[Series Update] ID: ${req.params.recurrenceId}, OriginalTime: ${originalStartTime}, NewData:`, updateData);

    const updated = await storage.updateAvailabilitySlotsByRecurrence(req.params.recurrenceId as string, updateData, originalStartTime);
    res.json({ success: updated });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: fromZodError(error).message });
    } else {
      res.status(500).json({ message: "خطأ في تحديث السلسلة" });
    }
  }
});

router.patch("/admin/availability-bulk", adminAuth, adminApiRateLimit, async (req, res) => {
  try {
    const { ids, data } = z.object({
      ids: z.array(z.string()).min(1),
      data: insertAvailabilitySlotSchema.partial()
    }).parse(req.body);

    const result = await Promise.all(
      ids.map(id => storage.updateAvailabilitySlot(id, data))
    );
    
    res.json({ success: true, count: result.length });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: fromZodError(error).message });
    } else {
      res.status(500).json({ message: "خطأ في التحديث الجماعي" });
    }
  }
});

router.post("/admin/availability-restructure", adminAuth, adminApiRateLimit, async (req, res) => {
  try {
    const { ids, startTime: newBaseStartTime, endTime: newBaseEndTime, duration, capacity } = z.object({
      ids: z.array(z.string()).min(1),
      startTime: z.string(),
      endTime: z.string(),
      duration: z.number().min(5),
      capacity: z.number().min(1)
    }).parse(req.body);

    const allSlots = await storage.getAvailabilitySlots();
    const targetSlots = allSlots.filter(s => ids.includes(s._id.toString()));
    
    if (targetSlots.length === 0) {
      return res.status(400).json({ message: "لم يتم العثور على المواعيد المحددة" });
    }

    const label = targetSlots[0].label;
    const targetDates = Array.from(new Set(targetSlots.map(s => 
      new Date(s.date).toISOString().split('T')[0]
    )));
    
    let totalUpdated = 0;
    let totalCreated = 0;
    let totalDeleted = 0;

    for (const dateStr of targetDates) {
      // 1. Get existing slots for this day + label, sorted by time
      const daySlots = allSlots.filter(s => 
        new Date(s.date).toISOString().split('T')[0] === dateStr && s.label === label
      ).sort((a, b) => a.startTime.localeCompare(b.startTime));

      const originalDate = daySlots[0]?.date || targetSlots.find(s => 
        new Date(s.date).toISOString().split('T')[0] === dateStr
      )?.date;

      if (!originalDate) continue;

      // 2. Generate desired timing sequence
      const desiredTimings: { startTime: string; endTime: string }[] = [];
      let currentStart = newBaseStartTime;
      while (currentStart < newBaseEndTime) {
        const [hours, minutes] = currentStart.split(":").map(Number);
        const dummyDate = new Date();
        dummyDate.setHours(hours, minutes, 0, 0);
        dummyDate.setMinutes(dummyDate.getMinutes() + duration);
        
        const endH = dummyDate.getHours().toString().padStart(2, '0');
        const endM = dummyDate.getMinutes().toString().padStart(2, '0');
        const currentEnd = `${endH}:${endM}`;
        
        if (currentEnd > newBaseEndTime) break;
        desiredTimings.push({ startTime: currentStart, endTime: currentEnd });
        currentStart = currentEnd;
      }

      // 3. Smart Update / Sync by Index
      const maxLen = Math.max(daySlots.length, desiredTimings.length);
      const recurrenceId = daySlots[0]?.recurrenceId || crypto.randomUUID();

      for (let i = 0; i < maxLen; i++) {
        const existingSlot = daySlots[i];
        const newTiming = desiredTimings[i];

        if (existingSlot && newTiming) {
          // UPDATE
          await storage.updateAvailabilitySlot(existingSlot._id, {
            startTime: newTiming.startTime,
            endTime: newTiming.endTime,
            capacity,
            // Keep label, recurrenceId, date, totalBooked (implicitly)
          });
          totalUpdated++;
        } else if (!existingSlot && newTiming) {
          // CREATE
          await storage.createAvailabilitySlot({
            date: originalDate,
            startTime: newTiming.startTime,
            endTime: newTiming.endTime,
            capacity,
            label,
            recurrenceId,
            isActive: true,
            recurrenceType: 'none' as const
          });
          totalCreated++;
        } else if (existingSlot && !newTiming) {
          // DELETE excess
          if (existingSlot.totalBooked > 0) {
            // Safety: If an excess slot is booked, maybe we shouldn't kill it?
            // For now, let's keep the booked ones and only delete empty ones.
            continue; 
          }
          await storage.deleteAvailabilitySlot(existingSlot._id);
          totalDeleted++;
        }
      }
    }

    res.json({ 
      success: true, 
      message: `تم تحديث ${totalUpdated} مواعيد، إنشاء ${totalCreated} جديد، وحذف ${totalDeleted} زائدة.` 
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: fromZodError(error).message });
    } else {
      res.status(500).json({ message: "خطأ في إعادة الهيكلة الذكية" });
    }
  }
});

router.delete("/admin/availability-series/:recurrenceId", adminAuth, adminApiRateLimit, async (req, res) => {
  try {
    const success = await storage.deleteAvailabilitySlotsByRecurrence(req.params.recurrenceId as string);
    res.json({ success });
  } catch (error) {
    res.status(500).json({ message: "خطأ في حذف السلسلة" });
  }
});

export default router;
