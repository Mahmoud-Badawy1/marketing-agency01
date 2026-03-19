/**
 * Cloudinary image optimization utility
 * Adds transformation parameters to Cloudinary URLs for responsive image serving
 */

interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: string;
  format?: string;
  aspectRatio?: string;
  fill?: "pad" | "fill" | "crop" | "thumb";
}

/**
 * Optimize a Cloudinary image URL with transformations
 * Automatically inserts transformation parameters before the file name
 * 
 * @param url - The Cloudinary image URL
 * @param options - Optional transformation parameters
 * @returns Optimized Cloudinary URL with transformations
 * 
 * @example
 * // Input: https://res.cloudinary.com/abqary/image/upload/v123/abqary-mascot.jpg
 * // Output: https://res.cloudinary.com/abqary/image/upload/w_1920,h_1080,q_auto,f_auto/v123/abqary-mascot.jpg
 */
export function optimizeCloudinaryUrl(url: string, options?: ImageTransformOptions): string {
  // Return original if not a Cloudinary URL
  if (!url || !url.includes("res.cloudinary.com")) {
    return url;
  }

  // Default options
  const opts = {
    quality: options?.quality || "auto",
    format: options?.format || "auto",
    width: options?.width,
    height: options?.height,
    aspectRatio: options?.aspectRatio,
    fill: options?.fill || "fill",
  };

  // Build transformation string
  const transforms: string[] = [];

  if (opts.width) transforms.push(`w_${opts.width}`);
  if (opts.height) transforms.push(`h_${opts.height}`);
  if (opts.aspectRatio) transforms.push(`ar_${opts.aspectRatio}`);
  if (opts.fill) transforms.push(`c_${opts.fill}`);
  
  transforms.push(`q_${opts.quality}`);
  transforms.push(`f_${opts.format}`);

  // Split URL to insert transformations
  // Format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{version}/{public_id}
  const uploadIndex = url.indexOf("/upload/");
  if (uploadIndex === -1) return url;

  const beforeUpload = url.slice(0, uploadIndex + "/upload/".length);
  const afterUpload = url.slice(uploadIndex + "/upload/".length);

  // Check if transformations already exist (non-v versioning)
  const versionMatch = afterUpload.match(/^v\d+\//);
  if (versionMatch) {
    // URL has version: /upload/v123/filename
    const versionPart = versionMatch[0];
    const filePart = afterUpload.slice(versionPart.length);
    return `${beforeUpload}${versionPart}${transforms.join(",")}/${filePart}`;
  } else {
    // URL without version: /upload/filename
    return `${beforeUpload}${transforms.join(",")}/${afterUpload}`;
  }
}

/**
 * Generate a responsive image URL for a given screen width
 * 
 * @param url - The Cloudinary image URL
 * @param screenWidth - Target screen width in pixels
 * @returns Optimized URL for the specified width
 */
export function getResponsiveImageUrl(url: string, screenWidth: number): string {
  return optimizeCloudinaryUrl(url, { width: screenWidth });
}

/**
 * Generate a thumbnail URL with fixed dimensions
 * 
 * @param url - The Cloudinary image URL
 * @param width - Thumbnail width
 * @param height - Thumbnail height
 * @returns Thumbnail URL
 */
export function getThumbnailUrl(url: string, width: number = 400, height: number = 300): string {
  return optimizeCloudinaryUrl(url, { width, height, fill: "crop" });
}

/**
 * Generate a hero image URL optimized for full-width display
 * 
 * @param url - The Cloudinary image URL
 * @returns Optimized hero image URL
 */
export function getHeroImageUrl(url: string): string {
  return optimizeCloudinaryUrl(url, { width: 1920, height: 1080, fill: "fill" });
}

/**
 * Generate a card background image URL
 * 
 * @param url - The Cloudinary image URL
 * @returns Optimized card background image URL
 */
export function getCardImageUrl(url: string): string {
  return optimizeCloudinaryUrl(url, { width: 800, height: 600, fill: "crop" });
}

/**
 * Generate a gallery image URL with aspect ratio preservation
 * 
 * @param url - The Cloudinary image URL
 * @returns Optimized gallery image URL
 */
export function getGalleryImageUrl(url: string): string {
  return optimizeCloudinaryUrl(url, { width: 600, height: 600, fill: "crop" });
}
