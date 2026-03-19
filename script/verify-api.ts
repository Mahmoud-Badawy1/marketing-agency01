#!/usr/bin/env tsx
/**
 * Verify that API imports are resolvable before deployment
 * This catches ESM module resolution errors locally
 */

console.log("🔍 Verifying API imports...\n");

try {
  // Test that all imports can be resolved
  await import("../api/index.js");
  
  console.log("✅ All API imports resolved successfully!");
  console.log("✅ Ready to deploy to Vercel\n");
  process.exit(0);
} catch (error: any) {
  console.error("❌ Import verification failed:\n");
  console.error(error);
  console.error("\n🚨 Fix these errors before deploying to Vercel!");
  process.exit(1);
}
