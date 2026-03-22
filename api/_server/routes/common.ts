import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { storage } from "../storage.js";
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

export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "abqary2026";

export const sessions = new Map<string, { createdAt: number; ip: string }>();
export const SESSION_DURATION = 8 * 60 * 60 * 1000;

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function cleanupSessions(): void {
  const now = Date.now();
  sessions.forEach((session, token) => {
    if (now - session.createdAt > SESSION_DURATION) {
      sessions.delete(token);
    }
  });
}

export const loginAttempts = new Map<string, { count: number; firstAttempt: number; lockedUntil: number }>();
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

export function isLoginRateLimited(ip: string): { limited: boolean; retryAfter?: number } {
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

export function recordFailedAttempt(ip: string): number {
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

export function adminAuth(req: Request, res: Response, next: NextFunction) {
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
