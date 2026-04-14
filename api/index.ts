import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import "./_server/db.js";
import { ZodError, z } from "zod";
import { registerRoutes } from "./_server/routes.js";
import { createServer } from "http";
import prerender from "prerender-node";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
    }
  }
}

// Removed duplicated Cloudinary, multer, and adminAuth configurations.
// These are managed centrally in _server/routes/common.ts

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

