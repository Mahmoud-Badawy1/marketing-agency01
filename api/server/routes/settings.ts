import { Router } from "express";
import { z, ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { storage } from "../storage.js";
import { insertSettingSchema } from "../../shared/schema.js";
import { adminAuth, adminApiRateLimit } from "./common.js";

const router = Router();

// Public
router.get("/settings", async (_req, res) => {
  try {
    const settings = await storage.getSettings();
    const settingsObj = settings.reduce((acc: any, setting: any) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as any);
    res.json(settingsObj);
  } catch (error) {
    res.status(500).json({ message: "خطأ في جلب الإعدادات", error: error instanceof Error ? error.message : String(error) });
  }
});

// Admin
router.get("/admin/settings", adminAuth, adminApiRateLimit, async (_req, res) => {
  try {
    const settings = await storage.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "خطأ في جلب الإعدادات" });
  }
});

router.put("/admin/settings", adminAuth, adminApiRateLimit, async (req, res) => {
  try {
    const { key, value } = insertSettingSchema.parse(req.body);
    const setting = await storage.upsertSetting(key, value);
    res.json(setting);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: fromZodError(error).message });
    } else {
      res.status(500).json({ message: "خطأ في حفظ الإعداد", error: error instanceof Error ? error.message : String(error) });
    }
  }
});

export default router;
