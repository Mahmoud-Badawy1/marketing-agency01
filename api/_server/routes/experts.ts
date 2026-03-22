import { Router } from "express";
import { z, ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { storage } from "../storage.js";
import { insertExpertApplicationSchema } from "../../_shared/schema.js";
import { getOrCreateUser, adminAuth, adminApiRateLimit, uploadCV, uploadToCloudinary } from "./common.js";

const router = Router();

// Public
router.post("/expert-applications", uploadCV.single("cv"), async (req, res) => {
  try {
    const applicationData = insertExpertApplicationSchema.parse({
      ...req.body,
      age: parseInt(req.body.age),
      experienceYears: parseInt(req.body.experienceYears),
      hasAgencyExperience: req.body.hasAgencyExperience === "true" || req.body.hasAgencyExperience === true,
    });

    let cvUrl = undefined;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "agency/cvs", "raw");
      cvUrl = result.secure_url;
    }

    const userId = await getOrCreateUser(applicationData.email, applicationData.fullName, applicationData.phone, "applicant");

    const application = await storage.createExpertApplication({
      ...applicationData,
      cvUrl,
      userId
    });

    res.status(201).json(application);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: fromZodError(error).message });
    } else {
      res.status(500).json({ message: "خطأ في إرسال الطلب" });
    }
  }
});

// Admin
router.get("/admin/expert-applications", adminAuth, adminApiRateLimit, async (_req, res) => {
  try {
    const applications = await storage.getExpertApplications();
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: "خطأ في جلب طلبات الانضمام" });
  }
});

router.put("/admin/expert-applications/:id/status", adminAuth, adminApiRateLimit, async (req, res) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const updated = await storage.updateExpertApplicationStatus(id, status);
    if (!updated) return res.status(404).json({ message: "الطلب غير موجود" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "خطأ في تحديث حالة الطلب" });
  }
});

router.put("/admin/expert-applications/:id/notes", adminAuth, adminApiRateLimit, async (req, res) => {
  try {
    const id = req.params.id as string;
    const { notes } = req.body;
    const updated = await storage.updateExpertApplicationNotes(id, notes);
    if (!updated) return res.status(404).json({ message: "الطلب غير موجود" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "خطأ في حفظ الملاحظات" });
  }
});

router.delete("/admin/expert-applications/:id", adminAuth, adminApiRateLimit, async (req, res) => {
  try {
    const id = req.params.id as string;
    const deleted = await storage.deleteExpertApplication(id);
    if (!deleted) return res.status(404).json({ message: "الطلب غير موجود" });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "خطأ في حذف الطلب" });
  }
});

export default router;
