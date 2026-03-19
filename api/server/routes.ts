import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { type Server } from "http";
import crypto from "crypto";
import { storage } from "./storage.js";
import { insertLeadSchema, insertOrderSchema, insertTrialBookingSchema, insertTeacherApplicationSchema, insertSettingSchema, insertTestimonialSchema, insertCouponSchema, validateCouponSchema } from "../shared/schema.js";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import sharp from 'sharp';
import compression from 'compression';

// Extend Express Request type to include file property
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

// Configure multer for memory storage (files will be uploaded to Cloudinary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
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

// Configure multer for media uploads (video, gif, image)
const uploadMedia = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (_req: any, file: any, cb: any) => {
    const allowed = /video|image|gif|webp|webm|mp4|avi|mov|quicktime/;
    const mime = allowed.test(file.mimetype);
    cb(null, mime);
  },
});

// Mapping of image keys to Cloudinary public_ids
const PUBLIC_ID_MAP: Record<string, string> = {
  mascot: 'abqary-mascot',
  instructor: 'abqary-instructor',
  gallery1: 'abqary-gallery1',
  gallery2: 'abqary-gallery2',
  gallery3: 'abqary-gallery3',
  gallery4: 'abqary-gallery4',
  upcoming_event_bg: 'abqary-upcoming-event-bg',
  hero_slide_1: 'abqary-hero-slide-1',
  hero_slide_2: 'abqary-hero-slide-2',
  hero_slide_3: 'abqary-hero-slide-3',
};

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "abqary2026";

// ────────── Session Management ──────────
const sessions = new Map<string, { createdAt: number; ip: string }>();
const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function cleanupSessions(): void {
  const now = Date.now();
  sessions.forEach((session, token) => {
    if (now - session.createdAt > SESSION_DURATION) {
      sessions.delete(token);
    }
  });
}

// ────────── Rate Limiting ──────────
const loginAttempts = new Map<string, { count: number; firstAttempt: number; lockedUntil: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW = 15 * 60 * 1000;

const apiRateLimit = new Map<string, { count: number; resetAt: number }>();
const API_RATE_LIMIT = 120; // per minute
const API_RATE_WINDOW = 60 * 1000;

function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.ip || req.socket?.remoteAddress || "unknown";
}

function isLoginRateLimited(ip: string): { limited: boolean; retryAfter?: number } {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);
  if (!attempts) return { limited: false };

  if (attempts.lockedUntil > now) {
    return { limited: true, retryAfter: Math.ceil((attempts.lockedUntil - now) / 1000) };
  }

  if (now - attempts.firstAttempt > ATTEMPT_WINDOW) {
    loginAttempts.delete(ip);
    return { limited: false };
  }

  return { limited: false };
}

function recordFailedAttempt(ip: string): number {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);

  if (!attempts || now - attempts.firstAttempt > ATTEMPT_WINDOW) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now, lockedUntil: 0 });
    return MAX_LOGIN_ATTEMPTS - 1;
  }

  attempts.count++;
  if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
    attempts.lockedUntil = now + LOCKOUT_DURATION;
    return 0;
  }

  return MAX_LOGIN_ATTEMPTS - attempts.count;
}

function safeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, "utf8");
    const bufB = Buffer.from(b, "utf8");
    if (bufA.length !== bufB.length) {
      // Constant-time: still run comparison to prevent timing leak
      crypto.timingSafeEqual(bufA, Buffer.alloc(bufA.length));
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

// ────────── Auth Middleware ──────────
function adminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "غير مصرح" });
  }
  const token = authHeader.split(" ")[1];

  const session = sessions.get(token);
  if (!session) {
    return res.status(401).json({ message: "جلسة غير صالحة. سجّل الدخول مجدداً" });
  }

  if (Date.now() - session.createdAt > SESSION_DURATION) {
    sessions.delete(token);
    return res.status(401).json({ message: "انتهت صلاحية الجلسة" });
  }

  next();
}

function adminApiRateLimit(req: Request, res: Response, next: NextFunction) {
  const ip = getClientIp(req);
  const now = Date.now();
  const limit = apiRateLimit.get(ip);

  if (!limit || now > limit.resetAt) {
    apiRateLimit.set(ip, { count: 1, resetAt: now + API_RATE_WINDOW });
    return next();
  }

  limit.count++;
  if (limit.count > API_RATE_LIMIT) {
    return res.status(429).json({ message: "كثرة الطلبات. حاول لاحقاً" });
  }

  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<void> {
  // ✅ Enable response compression for faster content delivery
  app.use(compression());

  // SEO: Serve robots.txt
  app.get("/robots.txt", (_req, res) => {
    res.type("text/plain").send(
      `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /checkout\n\nSitemap: https://abqary.com/sitemap.xml`
    );
  });

  // SEO: Serve sitemap.xml
  app.get("/sitemap.xml", (_req, res) => {
    const urls = [
      { loc: "https://abqary.com/", priority: "1.0", changefreq: "weekly" },
      { loc: "https://abqary.com/faq", priority: "0.8", changefreq: "monthly" },
      { loc: "https://abqary.com/privacy", priority: "0.3", changefreq: "yearly" },
      { loc: "https://abqary.com/terms", priority: "0.3", changefreq: "yearly" },
    ];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join("\n")}
</urlset>`;
    res.type("application/xml").send(xml);
  });

  // Public routes
  app.post("/api/leads", async (req, res) => {
    try {
      const lead = insertLeadSchema.parse(req.body);
      const newLead = await storage.createLead(lead);
      res.json(newLead);
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

      // If coupon code provided, validate and apply server-side
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
            const childrenCount = order.children?.length || 1;
            if (coupon.discountType === 'percentage') {
              couponDiscount = Math.round(originalAmount * (coupon.discountValue / 100));
            } else {
              couponDiscount = coupon.discountValue * childrenCount;
            }
            couponDiscount = Math.min(couponDiscount, originalAmount);
            couponId = coupon._id;
          }
        }
      }

      const finalAmount = originalAmount - couponDiscount;

      const newOrder = await storage.createOrder({
        ...order,
        amount: finalAmount,
      });

      // Record coupon usage if applied
      if (couponId && couponDiscount > 0) {
        await storage.incrementCouponUsage(couponId, order.phone, (newOrder as any)._id.toString(), order.children?.length || 1);
      }

      res.json(newOrder);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: "خطأ في الخادم" });
      }
    }
  });

  // Upload route with Cloudinary
  app.post("/api/orders/:id/upload", upload.single("transferImage"), async (req, res) => {
    try {
      const id = req.params.id as string;
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "لم يتم رفع ملف" });
      }

      // Upload to Cloudinary
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

      if (!order) {
        return res.status(404).json({ message: "الطلب غير موجود" });
      }

      res.json(order);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "خطأ في رفع الصورة" });
    }
  });

  app.post("/api/trial-bookings", async (req, res) => {
    try {
      const booking = insertTrialBookingSchema.parse(req.body);
      const newBooking = await storage.createTrialBooking(booking);
      res.json(newBooking);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: "خطأ في الخادم" });
      }
    }
  });

  // Helper to upload CV to Cloudinary
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

  // ────────── Public Coupon Validation ──────────
  app.post("/api/coupons/validate", async (req, res) => {
    try {
      const input = validateCouponSchema.parse(req.body);
      const coupon = await storage.getCouponByCode(input.code);

      if (!coupon) {
        return res.status(404).json({ valid: false, message: "كود الخصم غير موجود" });
      }

      if (!coupon.isActive) {
        return res.status(400).json({ valid: false, message: "كود الخصم غير مفعّل" });
      }

      const now = new Date();
      if (coupon.startDate && new Date(coupon.startDate) > now) {
        return res.status(400).json({ valid: false, message: "كود الخصم لم يبدأ بعد" });
      }
      if (coupon.endDate && new Date(coupon.endDate) < now) {
        return res.status(400).json({ valid: false, message: "كود الخصم منتهي الصلاحية" });
      }

      if (coupon.maxTotalUses > 0 && coupon.currentUses >= coupon.maxTotalUses) {
        return res.status(400).json({ valid: false, message: "تم استنفاد عدد مرات استخدام كود الخصم" });
      }

      if (coupon.maxUsesPerCustomer > 0 && input.phone) {
        const customerUses = coupon.usageLog.filter(u => u.phone === input.phone).length;
        if (customerUses >= coupon.maxUsesPerCustomer) {
          return res.status(400).json({ valid: false, message: "لقد استخدمت هذا الكود الحد الأقصى من المرات" });
        }
      }

      if (coupon.maxSeats > 0 && input.childrenCount > coupon.maxSeats) {
        return res.status(400).json({ valid: false, message: `كود الخصم صالح لحد أقصى ${coupon.maxSeats} أطفال` });
      }

      if (coupon.applicablePlans.length > 0 && !coupon.applicablePlans.includes(input.planId)) {
        return res.status(400).json({ valid: false, message: "كود الخصم غير صالح لهذه الباقة" });
      }

      res.json({
        valid: true,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description,
        code: coupon.code,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ valid: false, message: fromZodError(error).message });
      } else {
        res.status(500).json({ valid: false, message: "خطأ في التحقق من كود الخصم" });
      }
    }
  });

  // ────────── Admin Auth Routes ──────────
  app.post("/api/admin/login", (req, res) => {
    const ip = getClientIp(req);

    // Rate limit check
    const rateLimitCheck = isLoginRateLimited(ip);
    if (rateLimitCheck.limited) {
      return res.status(429).json({
        message: `تم تجاوز عدد المحاولات. حاول بعد ${rateLimitCheck.retryAfter} ثانية`,
        retryAfter: rateLimitCheck.retryAfter,
      });
    }

    const { password } = req.body;
    if (!password || typeof password !== "string") {
      return res.status(400).json({ message: "كلمة المرور مطلوبة" });
    }

    if (safeCompare(password, ADMIN_PASSWORD)) {
      cleanupSessions();
      loginAttempts.delete(ip);

      const token = generateSessionToken();
      sessions.set(token, { createdAt: Date.now(), ip });

      res.json({ success: true, token, expiresIn: SESSION_DURATION });
    } else {
      const remaining = recordFailedAttempt(ip);
      console.warn(`[SECURITY] Failed admin login from IP: ${ip}`);

      res.status(401).json({
        message:
          remaining > 0
            ? `كلمة المرور غير صحيحة. متبقي ${remaining} محاولات`
            : "تم قفل الحساب مؤقتاً بسبب كثرة المحاولات الخاطئة",
      });
    }
  });

  // Session verification
  app.get("/api/admin/verify", adminAuth, (_req, res) => {
    res.json({ valid: true });
  });

  // Logout — invalidate session
  app.post("/api/admin/logout", adminAuth, (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) sessions.delete(token);
    res.json({ success: true });
  });

  app.get("/api/admin/leads", adminAuth, adminApiRateLimit, async (_req, res) => {
    try {
      const leads = await storage.getLeads();
      res.json(leads);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب العملاء المحتملين" });
    }
  });

  app.put("/api/admin/leads/:id/status", adminAuth, adminApiRateLimit, async (req, res) => {
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

  app.get("/api/admin/orders", adminAuth, adminApiRateLimit, async (_req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب الطلبات" });
    }
  });

  app.put("/api/admin/orders/:id/status", adminAuth, adminApiRateLimit, async (req, res) => {
    try {
      const id = req.params.id as string;
      const status = req.body.status as string;
      const order = await storage.updateOrderStatus(id, status);
      if (!order) {
        return res.status(404).json({ message: "الطلب غير موجود" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "خطأ في تحديث الحالة" });
    }
  });

  app.get("/api/admin/trial-bookings", adminAuth, adminApiRateLimit, async (_req, res) => {
    try {
      const bookings = await storage.getTrialBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب حجوزات التجربة" });
    }
  });

  app.put("/api/admin/trial-bookings/:id/status", adminAuth, adminApiRateLimit, async (req, res) => {
    try {
      const id = req.params.id as string;
      const status = req.body.status as string;
      const booking = await storage.updateTrialStatus(id, status);
      if (!booking) {
        return res.status(404).json({ message: "الحجز غير موجود" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "خطأ في تحديث الحالة" });
    }
  });

  app.get("/api/admin/settings", adminAuth, adminApiRateLimit, async (_req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب الإعدادات" });
    }
  });

  app.put("/api/admin/settings", adminAuth, adminApiRateLimit, async (req, res) => {
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

  // Admin upload route with Cloudinary
  app.post("/api/admin/upload", adminAuth, adminApiRateLimit, upload.single("image"), async (req, res) => {
    try {
      const file = req.file;
      const imageKey = req.body.imageKey as string | undefined;

      if (!file) {
        return res.status(400).json({ message: "لم يتم رفع ملف" });
      }

      // Get public_id from mapping, or generate from imageKey
      const publicId = imageKey && PUBLIC_ID_MAP[imageKey]
        ? PUBLIC_ID_MAP[imageKey]
        : `upload-${Date.now()}`;

      // Compress image using sharp
      let compressedBuffer: Buffer;
      try {
        compressedBuffer = await sharp(file.buffer)
          .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 85 })
          .toBuffer();
      } catch {
        // If sharp fails, use original buffer
        compressedBuffer = file.buffer;
      }

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: "image",
            folder: "abqary-uploads",
            public_id: publicId,
            overwrite: true,          // ✅ Replace old file
            invalidate: true,         // ✅ Clear CDN cache
            transformation: [
              { quality: "auto", fetch_format: "auto" }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(compressedBuffer);
      });

      const imageUrl = (result as any).secure_url;
      res.json({ path: imageUrl });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "خطأ في رفع الصورة" });
    }
  });

  // Admin upload media route (video/gif) with Cloudinary
  app.post("/api/admin/upload-media", adminAuth, adminApiRateLimit, uploadMedia.single("media"), async (req, res) => {
    try {
      const file = req.file;
      const mediaKey = req.body.mediaKey as string | undefined;

      if (!file) {
        return res.status(400).json({ message: "لم يتم رفع ملف" });
      }

      // Get public_id from mapping
      const publicId = mediaKey && PUBLIC_ID_MAP[mediaKey]
        ? PUBLIC_ID_MAP[mediaKey]
        : `media-${Date.now()}`;

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: "auto",
            folder: "abqary-media",
            public_id: publicId,
            overwrite: true,
            invalidate: true,
            ...(file.mimetype.includes('video') && {
              eager: [
                { format: "mp4", video_codec: "h265", quality: "auto:good" },
                { format: "webm", video_codec: "vp9", quality: "auto:good" }
              ],
              eager_async: true
            })
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(file.buffer);
      });

      const mediaUrl = (result as any).secure_url;
      res.json({ path: mediaUrl });
    } catch (error) {
      console.error("Media upload error:", error);
      res.status(500).json({ message: "خطأ في رفع الملف" });
    }
  });

  // Teacher application admin routes
  app.get("/api/admin/teacher-applications", adminAuth, adminApiRateLimit, async (_req, res) => {
    try {
      const applications = await storage.getTeacherApplications();
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب طلبات المدربين" });
    }
  });

  app.put("/api/admin/teacher-applications/:id/status", adminAuth, adminApiRateLimit, async (req, res) => {
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

  app.put("/api/admin/teacher-applications/:id/notes", adminAuth, adminApiRateLimit, async (req, res) => {
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

  app.delete("/api/admin/teacher-applications/:id", adminAuth, adminApiRateLimit, async (req, res) => {
    try {
      const id = req.params.id as string;
      const deleted = await storage.deleteTeacherApplication(id);
      if (!deleted) return res.status(404).json({ message: "الطلب غير موجود" });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "خطأ في حذف الطلب" });
    }
  });

  // Admin testimonials routes
  app.get("/api/admin/testimonials", adminAuth, adminApiRateLimit, async (_req, res) => {
    try {
      const testimonials = await storage.getTestimonials(false);
      res.json(testimonials);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب آراء العملاء" });
    }
  });

  app.post("/api/admin/testimonials", adminAuth, adminApiRateLimit, async (req, res) => {
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

  app.put("/api/admin/testimonials/:id", adminAuth, adminApiRateLimit, async (req, res) => {
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

  app.delete("/api/admin/testimonials/:id", adminAuth, adminApiRateLimit, async (req, res) => {
    try {
      const id = req.params.id as string;
      const deleted = await storage.deleteTestimonial(id);
      if (!deleted) return res.status(404).json({ message: "غير موجود" });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "خطأ في حذف رأي العميل" });
    }
  });

  // ────────── Admin Coupon Routes ──────────
  app.get("/api/admin/coupons", adminAuth, adminApiRateLimit, async (_req, res) => {
    try {
      const coupons = await storage.getCoupons();
      res.json(coupons);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب الكوبونات" });
    }
  });

  app.post("/api/admin/coupons", adminAuth, adminApiRateLimit, async (req, res) => {
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

  app.put("/api/admin/coupons/:id", adminAuth, adminApiRateLimit, async (req, res) => {
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

  app.delete("/api/admin/coupons/:id", adminAuth, adminApiRateLimit, async (req, res) => {
    try {
      const id = req.params.id as string;
      const deleted = await storage.deleteCoupon(id);
      if (!deleted) return res.status(404).json({ message: "الكوبون غير موجود" });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "خطأ في حذف الكوبون" });
    }
  });
}