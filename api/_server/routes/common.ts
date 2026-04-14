import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { storage } from "../storage.js";
import { AdminSession, LoginAttempt } from "../../_shared/schema.js";
import sharp from 'sharp';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req: any, file: any, cb: any) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(file.originalname.toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext && mime);
  },
});

export const uploadCV = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req: any, file: any, cb: any) => {
    const isPdf = file.mimetype === 'application/pdf';
    cb(null, isPdf);
  },
});

export const uploadMedia = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req: any, file: any, cb: any) => {
    const allowed = /video|image|gif|webp|webm|mp4|avi|mov|quicktime/;
    const mime = allowed.test(file.mimetype);
    cb(null, mime);
  },
});

export const PUBLIC_ID_MAP: Record<string, string> = {
  hero: 'abqary-hero',
  about: 'abqary-about',
  contact: 'abqary-contact',
  why_us: 'abqary-why-us',
  gallery1: 'abqary-gallery1',
  gallery2: 'abqary-gallery2',
  gallery3: 'abqary-gallery3',
  gallery4: 'abqary-gallery4',
  upcoming_event_bg: 'abqary-upcoming-event-bg',
};

export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  console.error("FATAL ERROR: ADMIN_PASSWORD environment variable is not set.");
  process.exit(1);
}

// In-memory maps deprecated: using MongoDB with TTL indexes for serverless compatibility.
// export const sessions = new Map<string, { createdAt: number; ip: string }>();

export async function generateSessionToken(ip: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  await AdminSession.create({ token, ip });
  return token;
}

export function cleanupSessions(): void {
  // No-op: MongoDB TTL indexes handle cleanup automatically
}

export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION = 15 * 60 * 1000;
export const ATTEMPT_WINDOW = 15 * 60 * 1000;

export const apiRateLimit = new Map<string, { count: number; resetAt: number }>();
export const API_RATE_LIMIT = 120; // per minute
export const API_RATE_WINDOW = 60 * 1000;

export function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.ip || req.socket?.remoteAddress || "unknown";
}

export async function isLoginRateLimited(ip: string): Promise<{ limited: boolean; retryAfter?: number }> {
  const now = Date.now();
  const attemptResult = await LoginAttempt.findOne({ ip }).lean() as any;
  if (!attemptResult) return { limited: false };

  if (attemptResult.lockedUntil && new Date(attemptResult.lockedUntil).getTime() > now) {
    return { limited: true, retryAfter: Math.ceil((new Date(attemptResult.lockedUntil).getTime() - now) / 1000) };
  }

  return { limited: false };
}

export async function recordFailedAttempt(ip: string): Promise<number> {
  const now = Date.now();
  
  const attempt = await LoginAttempt.findOne({ ip });
  
  if (!attempt) {
    await LoginAttempt.create({ ip, count: 1 });
    return MAX_LOGIN_ATTEMPTS - 1;
  }

  attempt.count += 1;
  
  if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
    attempt.lockedUntil = new Date(now + LOCKOUT_DURATION);
    await attempt.save();
    return 0;
  }

  await attempt.save();
  return MAX_LOGIN_ATTEMPTS - attempt.count;
}

export async function clearLoginAttempts(ip: string): Promise<void> {
  await LoginAttempt.deleteOne({ ip });
}

export function safeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, "utf8");
    const bufB = Buffer.from(b, "utf8");
    if (bufA.length !== bufB.length) {
      crypto.timingSafeEqual(bufA, Buffer.alloc(bufA.length));
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "غير مصرح - الرجاء تسجيل الدخول" });
  }

  const token = authHeader.split(" ")[1];
  
  const session = await AdminSession.findOne({ token });
  if (!session) {
    return res.status(401).json({ message: "الجلسة منتهية، يرجى تسجيل الدخول مجدداً" });
  }

  (req as any).adminSessionId = token;
  next();
};

export const adminLogout = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      await AdminSession.deleteOne({ token });
    }
    res.json({ message: "تم تسجيل الخروج بنجاح" });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء تسجيل الخروج" });
  }
};

export function adminApiRateLimit(req: Request, res: Response, next: NextFunction) {
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

export async function getOrCreateUser(email?: string, name?: string, phone?: string, role: 'client'|'applicant' = 'client') {
  if (!email || email.trim() === '') return undefined;
  let user = await storage.getUserAccountByEmail(email);
  if (!user) {
    user = await storage.createUserAccount({ email, name: name || "User", phone: phone || "", role, isActive: true });
  }
  return user._id;
}

export function uploadToCloudinary(
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
