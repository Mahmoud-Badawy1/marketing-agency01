import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Optimizes SVG files by removing unnecessary attributes and whitespace
 * This is a basic optimization without external dependencies
 */
function optimizeSVG(filePath: string): void {
  try {
    let content = fs.readFileSync(filePath, "utf-8");
    const originalSize = Buffer.byteLength(content, "utf-8");

    // Remove comments
    content = content.replace(/<!--[\s\S]*?-->/g, "");

    // Remove extra whitespace and newlines
    content = content.replace(/>\s+</g, "><");
    content = content.replace(/\s{2,}/g, " ");

    // Remove unused namespace declarations
    content = content.replace(/xmlns:[a-z]+="[^"]*"/g, "");

    // Remove empty attributes
    content = content.replace(/\s+\w+=""/g, "");

    // Minimize decimal precision in paths (keep 2 decimals)
    content = content.replace(/(\d+\.\d{3,})/g, (match: string) => {
      return parseFloat(match).toFixed(2);
    });

    // Remove xlink namespace if not used
    if (!content.includes("xlink:")) {
      content = content.replace(/xmlns:xlink="[^"]*"\s*/g, "");
    }

    const optimizedSize = Buffer.byteLength(content, "utf-8");
    const reduction = originalSize - optimizedSize;
    const percentage = ((reduction / originalSize) * 100).toFixed(1);

    fs.writeFileSync(filePath, content, "utf-8");

    console.log(`\n✓ Optimized: ${path.basename(filePath)}`);
    console.log(`  Original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Optimized: ${(optimizedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Reduction: ${(reduction / 1024).toFixed(0)} KB (${percentage}%)`);
  } catch (error) {
    console.error(`Error optimizing SVG: ${error}`);
  }
}

/**
 * Analyzes video files and provides compression recommendations
 */
function analyzeVideo(filePath: string): void {
  try {
    const stats = fs.statSync(filePath);
    const sizeInMB = stats.size / 1024 / 1024;

    console.log(`\n📹 Video: ${path.basename(filePath)}`);
    console.log(`   Current size: ${sizeInMB.toFixed(2)} MB`);

    if (sizeInMB > 5) {
      console.log(`   ⚠️  Requires compression`);
      console.log(`   Recommended: FFmpeg H.265 codec, CRF 28, 1080p max`);
      console.log(`   Expected output: ~${(sizeInMB * 0.3).toFixed(2)} MB (70% reduction)`);
    }
  } catch (error) {
    console.error(`Error analyzing video: ${error}`);
  }
}

// Main execution
const publicDir = path.resolve(__dirname, "../client/public");
const attachedDir = path.resolve(__dirname, "../attached_assets");

console.log("🚀 Asset Optimization Script\n");

// Optimize SVG
const svgPath = path.join(publicDir, "ramadan1.svg");
if (fs.existsSync(svgPath)) {
  optimizeSVG(svgPath);
} else {
  console.log(`SVG not found at: ${svgPath}`);
}

// Analyze videos
const videoPaths = [
  `${attachedDir}/videos/hero-slide-1.mp4`,
  `${attachedDir}/videos/hero-slide-2.mp4`,
  `${attachedDir}/videos/hero-slide-3.mp4`,
];

console.log("\n📊 Video Analysis:");
videoPaths.forEach((videoPath) => {
  if (fs.existsSync(videoPath)) {
    analyzeVideo(videoPath);
  }
});

console.log("\n📝 Notes:");
console.log("   • SVG optimization completed (basic)");
console.log("   • For video compression, install FFmpeg:");
console.log('     Windows: choco install ffmpeg');
console.log("     OR download from https://ffmpeg.org/download.html");
console.log(
  "   • After FFmpeg installation, run video compression commands in Phase 4A"
);
