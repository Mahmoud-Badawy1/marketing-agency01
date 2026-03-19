import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import "./server/db.js";
import { storage } from "./server/storage.js";
import {
  insertLeadSchema,
  insertOrderSchema,
  insertTrialBookingSchema,
  insertTeacherApplicationSchema,
  insertSettingSchema,
  insertTestimonialSchema,
} from "./shared/schema.js";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import prerender from "prerender-node";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
    }
  }
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req: any, file: any, cb: any) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(file.originalname.toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext && mime);
  },
});

// Configure multer for CV uploads (PDF files)
const uploadCV = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req: any, file: any, cb: any) => {
    const isPdf = file.mimetype === 'application/pdf';
    cb(null, isPdf);
  },
});

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "abqary2026";

function adminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "غير مصرح" });
  }
  const token = authHeader.split(" ")[1];
  if (token !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: "كلمة المرور غير صحيحة" });
  }
  next();
}

// Helper to upload buffer to Cloudinary
function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  resourceType: "image" | "raw" = "image"
): Promise<{ secure_url: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) reject(error);
        else resolve(result as { secure_url: string });
      }
    );
    stream.end(buffer);
  });
}

const app = express();

// Disable ETag to prevent 304 responses for dynamic API data
app.set("etag", false);

// Parse body BEFORE prerender middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Disable caching for all API routes to prevent 304 stale responses on Vercel
app.use("/api", (_req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.set("Surrogate-Control", "no-store");
  next();
});

// Prerender.io middleware for SEO - must come AFTER body parsing
if (process.env.Prerender_API_TOKEN) {
  app.use(
    prerender
      .set("prerenderToken", process.env.Prerender_API_TOKEN)
      .set("protocol", "https")
      .set("host", "service.prerender.io")
  );
}

// ── SEO routes ──
app.get("/robots.txt", (_req, res) => {
  res.type("text/plain").send(
    `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /checkout\n\nSitemap: https://abqaryarqam.vercel.app/sitemap.xml`
  );
});

app.get("/sitemap.xml", (_req, res) => {
  const urls = [
    { loc: "https://abqaryarqam.vercel.app/", priority: "1.0", changefreq: "weekly" },
    { loc: "https://abqaryarqam.vercel.app/faq", priority: "0.8", changefreq: "monthly" },
    { loc: "https://abqaryarqam.vercel.app/join-us", priority: "0.8", changefreq: "monthly" },
    { loc: "https://abqaryarqam.vercel.app/privacy", priority: "0.3", changefreq: "yearly" },
    { loc: "https://abqaryarqam.vercel.app/terms", priority: "0.3", changefreq: "yearly" },
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;
  res.type("application/xml").send(xml);
});

// ── Public API routes ──
app.post("/api/leads", async (req, res) => {
  try {
    const lead = insertLeadSchema.parse(req.body);
    const created = await storage.createLead(lead);
    res.status(201).json(created);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: fromZodError(error).message });
    } else {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const order = insertOrderSchema.parse(req.body);
    const created = await storage.createOrder(order);
    res.status(201).json(created);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: fromZodError(error).message });
    } else {
      res.status(500).json({ message: "خطأ في إنشاء الطلب" });
    }
  }
});

app.post("/api/orders/:id/upload", upload.single("image"), async (req, res) => {
  try {
    const id = req.params.id as string;
    if (!req.file) {
      return res.status(400).json({ message: "لم يتم رفع صورة" });
    }
    const result = await uploadToCloudinary(req.file.buffer, "abqary/transfers");
    const updated = await storage.updateOrderImage(id, result.secure_url);
    if (!updated) {
      return res.status(404).json({ message: "الطلب غير موجود" });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "خطأ في رفع الصورة" });
  }
});

app.post("/api/trial-bookings", async (req, res) => {
  try {
    const booking = insertTrialBookingSchema.parse(req.body);
    const created = await storage.createTrialBooking(booking);
    res.status(201).json(created);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: fromZodError(error).message });
    } else {
      res.status(500).json({ message: "خطأ في حجز الحصة التجريبية" });
    }
  }
});

app.post("/api/teacher-applications", uploadCV.single("cv"), async (req, res) => {
  try {
    const applicationData = insertTeacherApplicationSchema.parse({
      ...req.body,
      age: parseInt(req.body.age),
      experienceYears: parseInt(req.body.experienceYears),
      hasAbacusExperience: req.body.hasAbacusExperience === "true" || req.body.hasAbacusExperience === true,
    });

    // Upload CV to Cloudinary if provided
    let cvUrl = undefined;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "abqary/cvs", "raw");
      cvUrl = result.secure_url;
    }

    const application = await storage.createTeacherApplication({
      ...applicationData,
      cvUrl,
    });

    res.status(201).json(application);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: fromZodError(error).message });
    } else {
      console.error("Teacher application error:", error);
      res.status(500).json({ message: "خطأ في إرسال الطلب" });
    }
  }
});

app.get("/api/settings", async (_req, res) => {
  try {
    const settings = await storage.getSettings();
    const settingsObj = settings.reduce((acc: any, setting: any) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as any);
    res.json(settingsObj);
  } catch (error) {
    res.status(500).json({ message: "خطأ في جلب الإعدادات" });
  }
});

// Public testimonials route
app.get("/api/testimonials", async (_req, res) => {
  try {
    const testimonials = await storage.getTestimonials(true);
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: "خطأ في جلب آراء العملاء" });
  }
});

// ── Admin routes ──
app.post("/api/admin/login", async (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, token: ADMIN_PASSWORD });
  } else {
    res.status(401).json({ message: "كلمة المرور غير صحيحة" });
  }
});

app.get("/api/admin/leads", adminAuth, async (_req, res) => {
  try {
    const leads = await storage.getLeads();
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: "خطأ في جلب العملاء المحتملين" });
  }
});

app.put("/api/admin/leads/:id/status", adminAuth, async (req, res) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const updated = await storage.updateLeadStatus(id, status);
    if (!updated) return res.status(404).json({ message: "غير موجود" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "خطأ في تحديث الحالة" });
  }
});

app.get("/api/admin/orders", adminAuth, async (_req, res) => {
  try {
    const orders = await storage.getOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "خطأ في جلب الطلبات" });
  }
});

app.put("/api/admin/orders/:id/status", adminAuth, async (req, res) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const updated = await storage.updateOrderStatus(id, status);
    if (!updated) return res.status(404).json({ message: "الطلب غير موجود" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "خطأ في تحديث حالة الطلب" });
  }
});

app.get("/api/admin/trial-bookings", adminAuth, async (_req, res) => {
  try {
    const bookings = await storage.getTrialBookings();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "خطأ في جلب الحجوزات" });
  }
});

app.put("/api/admin/trial-bookings/:id/status", adminAuth, async (req, res) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const updated = await storage.updateTrialStatus(id, status);
    if (!updated) return res.status(404).json({ message: "الحجز غير موجود" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "خطأ في تحديث حالة الحجز" });
  }
});

app.get("/api/admin/settings", adminAuth, async (_req, res) => {
  try {
    const settings = await storage.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "خطأ في جلب الإعدادات" });
  }
});

app.put("/api/admin/settings", adminAuth, async (req, res) => {
  try {
    const { key, value } = insertSettingSchema.parse(req.body);
    const setting = await storage.upsertSetting(key, value);
    res.json(setting);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: fromZodError(error).message });
    } else {
      res.status(500).json({ message: "خطأ في حفظ الإعداد" });
    }
  }
});

app.post("/api/admin/upload", adminAuth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "لم يتم رفع صورة" });
    }
    const result = await uploadToCloudinary(req.file.buffer, "abqary/site");
    res.json({ path: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: "خطأ في رفع الصورة" });
  }
});

// Teacher application admin routes
app.get("/api/admin/teacher-applications", adminAuth, async (_req, res) => {
  try {
    const applications = await storage.getTeacherApplications();
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: "خطأ في جلب طلبات المدربين" });
  }
});

app.put("/api/admin/teacher-applications/:id/status", adminAuth, async (req, res) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const updated = await storage.updateTeacherApplicationStatus(id, status);
    if (!updated) return res.status(404).json({ message: "الطلب غير موجود" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "خطأ في تحديث حالة الطلب" });
  }
});

app.put("/api/admin/teacher-applications/:id/notes", adminAuth, async (req, res) => {
  try {
    const id = req.params.id as string;
    const { notes } = req.body;
    const updated = await storage.updateTeacherApplicationNotes(id, notes);
    if (!updated) return res.status(404).json({ message: "الطلب غير موجود" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "خطأ في حفظ الملاحظات" });
  }
});

app.delete("/api/admin/teacher-applications/:id", adminAuth, async (req, res) => {
  try {
    const id = req.params.id as string;
    const deleted = await storage.deleteTeacherApplication(id);
    if (!deleted) return res.status(404).json({ message: "الطلب غير موجود" });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "خطأ في حذف الطلب" });
  }
});

// Admin image upload route (generic)
app.post("/api/admin/upload", adminAuth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "لم يتم رفع أي صورة" });
    }
    const result = await uploadToCloudinary(req.file.buffer, "abqary/testimonials");
    res.json({ url: result.secure_url });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "خطأ في رفع الصورة" });
  }
});

// Testimonial admin routes
app.get("/api/admin/testimonials", adminAuth, async (_req, res) => {
  try {
    const testimonials = await storage.getTestimonials(false);
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: "خطأ في جلب آراء العملاء" });
  }
});

app.post("/api/admin/testimonials", adminAuth, async (req, res) => {
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

app.put("/api/admin/testimonials/:id", adminAuth, async (req, res) => {
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

app.delete("/api/admin/testimonials/:id", adminAuth, async (req, res) => {
  try {
    const id = req.params.id as string;
    const deleted = await storage.deleteTestimonial(id);
    if (!deleted) return res.status(404).json({ message: "غير موجود" });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "خطأ في حذف رأي العميل" });
  }
});

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Server error:", err);
  if (!res.headersSent) {
    res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
  }
});

export default app;

