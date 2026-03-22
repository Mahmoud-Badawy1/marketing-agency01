import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import "./server/db.js";
import { ZodError, z } from "zod";
import { registerRoutes } from "./server/routes.js";
import { createServer } from "http";
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

// ── Register Routes from routes.ts ──
const httpServer = createServer(app);
// registerRoutes is async, but we can't top-level await easily in some environments
// However, since it doesn't actually have any internal awaits, we can just call it
registerRoutes(httpServer, app).catch(err => {
  console.error("Failed to register routes:", err);
});

// Error handler (MUST be last)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Server error:", err);
  if (!res.headersSent) {
    res.status(err.status || 500).json({
      message: err.message || "Internal Server Error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

export default app;

