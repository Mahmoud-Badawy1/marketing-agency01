import "dotenv/config";
import mongoose from "./api/server/db.js";
import { storage } from "./api/server/storage.js";

async function diag() {
  console.log("Starting diagnostics...");
  try {
    console.log("Connecting to MongoDB...");
    // Wait for connection
    await new Promise((resolve, reject) => {
      if (mongoose.connection.readyState === 1) return resolve(true);
      mongoose.connection.once('connected', () => resolve(true));
      mongoose.connection.once('error', (err) => reject(err));
      // Timeout after 10s
      setTimeout(() => reject(new Error("Connection timeout")), 10000);
    });
    console.log("Connected successfully!");

    console.log("Fetching testimonials...");
    const testimonials = await storage.getTestimonials(true);
    console.log("Testimonials count:", testimonials.length);
    process.exit(0);
  } catch (err) {
    console.error("DIAGNOSTIC FAILURE:", err);
    process.exit(1);
  }
}

diag();
