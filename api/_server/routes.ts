import type { Express, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import compression from 'compression';
import { type Server } from "http";

// Import modular routers
import authRoutes from "./routes/auth.js";
import leadsRoutes from "./routes/leads.js";
import ordersRoutes from "./routes/orders.js";
import trialsRoutes from "./routes/trials.js";
import expertsRoutes from "./routes/experts.js";
import testimonialsRoutes from "./routes/testimonials.js";
import settingsRoutes from "./routes/settings.js";
import couponsRoutes from "./routes/coupons.js";
import availabilityRoutes from "./routes/availability.js";
import uploadsRoutes from "./routes/uploads.js";
import hubspotAdminRoutes from "./routes/hubspot_admin.js";

// Extend Express Request type to include file property globally (just in case)
declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
    }
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<void> {
  console.log("DEBUG: registerRoutes called");

  // 🛡️ Middleware to check database connection readiness
  const dbCheck = (req: Request, res: Response, next: NextFunction) => {
    if (mongoose.connection.readyState !== 1) {
      console.error(`[DB_ERROR] Request ${req.method} ${req.path} failed: Database not connected (readyState: ${mongoose.connection.readyState})`);
      return res.status(503).json({ 
        message: "قاعدة البيانات غير متصلة حالياً. يرجى التأكد من إضافة عنوان IP الخاص بالخادم إلى 'IP Access List' في MongoDB Atlas.",
        error: "Database Connection Error"
      });
    }
    next();
  };

  // ✅ Enable response compression for faster content delivery
  app.use(compression());

  // Apply DB check to all API routes
  app.use("/api", dbCheck);

  // SEO: Serve robots.txt
  app.get("/robots.txt", (_req, res) => {
    res.type("text/plain").send(
      `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /checkout\n\nSitemap: https://marketerpro.com/sitemap.xml`
    );
  });

  // SEO: Serve sitemap.xml
  app.get("/sitemap.xml", (_req, res) => {
    const urls = [
      { loc: "https://marketerpro.com/", priority: "1.0", changefreq: "weekly" },
      { loc: "https://marketerpro.com/faq", priority: "0.8", changefreq: "monthly" },
      { loc: "https://marketerpro.com/privacy", priority: "0.3", changefreq: "yearly" },
      { loc: "https://marketerpro.com/terms", priority: "0.3", changefreq: "yearly" },
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

  // Mount API Routers
  app.use("/api", authRoutes);
  app.use("/api", leadsRoutes);
  app.use("/api", ordersRoutes);
  app.use("/api", trialsRoutes);
  app.use("/api", expertsRoutes);
  app.use("/api", testimonialsRoutes);
  app.use("/api", settingsRoutes);
  app.use("/api", couponsRoutes);
  app.use("/api", availabilityRoutes);
  app.use("/api", hubspotAdminRoutes);
  
  // Uploads are strictly admin
  app.use("/api/admin", uploadsRoutes);
}