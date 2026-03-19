import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import "./db.js"; // Initialize MongoDB connection
import { registerRoutes } from "./routes.js";
import { serveStatic } from "./static.js";
import { createServer } from "http";
import prerender from "prerender-node";

const app = express();
const httpServer = createServer(app);

// Remove server fingerprint
app.disable("x-powered-by");

// Security headers
app.use((_req, res, next) => {
  res.set("X-Content-Type-Options", "nosniff");
  res.set("X-Frame-Options", "DENY");
  res.set("X-XSS-Protection", "1; mode=block");
  res.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.set("X-DNS-Prefetch-Control", "off");
  res.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});

// Public API rate limiting (per IP)
const publicApiLimits = new Map<string, { count: number; resetAt: number }>();
const PUBLIC_API_LIMIT = 60; // 60 requests per minute
const PUBLIC_API_WINDOW = 60 * 1000;

app.use("/api", (req, res, next) => {
  // Skip admin routes (they have their own limiter)
  if (req.path.startsWith("/admin")) return next();

  const forwarded = req.headers["x-forwarded-for"];
  const ip = typeof forwarded === "string" ? forwarded.split(",")[0].trim() : (req.ip || "unknown");
  const now = Date.now();
  const limit = publicApiLimits.get(ip);

  if (!limit || now > limit.resetAt) {
    publicApiLimits.set(ip, { count: 1, resetAt: now + PUBLIC_API_WINDOW });
    return next();
  }

  limit.count++;
  if (limit.count > PUBLIC_API_LIMIT) {
    return res.status(429).json({ message: "كثرة الطلبات. حاول لاحقاً" });
  }
  next();
});

// Disable ETag to prevent 304 responses for dynamic API data
app.set("etag", false);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// Parse body BEFORE prerender middleware
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// Disable caching for all API routes to prevent 304 stale responses on Vercel
app.use("/api", (_req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.set("Surrogate-Control", "no-store");
  next();
});

// Prerender.io middleware — serves pre-rendered HTML to search engine bots for SEO
// Must come AFTER body parsing middleware
if (process.env.Prerender_API_TOKEN) {
  app.use(
    prerender
      .set("prerenderToken", process.env.Prerender_API_TOKEN)
      .set("protocol", "https")
      .set("host", "service.prerender.io")
  );
  console.log("✓ Prerender.io middleware enabled");
} else {
  console.warn("⚠ Prerender.io token not found - SEO rendering disabled");
}

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      // Don't log response body to avoid leaking tokens/data
      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 3000 if not specified.
  // this serves both the API and the client.
  const port = parseInt(process.env.PORT || "3000", 10);
  httpServer.listen(
    {
      port,
      host: "localhost",
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
