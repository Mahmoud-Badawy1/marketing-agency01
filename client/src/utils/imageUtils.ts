/**
 * Cloudinary image optimization utilities
 */

interface ImageTransformOptions {
  width?: number; height?: number; quality?: string; format?: string;
  aspectRatio?: string; fill?: "pad" | "fill" | "crop" | "thumb";
}

export function optimizeCloudinaryUrl(url: string, options?: ImageTransformOptions): string {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  const opts = { quality: options?.quality || "auto", format: options?.format || "auto", width: options?.width, height: options?.height, aspectRatio: options?.aspectRatio, fill: options?.fill || "fill" };
  const transforms: string[] = [];
  if (opts.width) transforms.push(`w_${opts.width}`);
  if (opts.height) transforms.push(`h_${opts.height}`);
  if (opts.aspectRatio) transforms.push(`ar_${opts.aspectRatio}`);
  if (opts.fill) transforms.push(`c_${opts.fill}`);
  transforms.push(`q_${opts.quality}`, `f_${opts.format}`);
  const uploadIndex = url.indexOf("/upload/");
  if (uploadIndex === -1) return url;
  const beforeUpload = url.slice(0, uploadIndex + "/upload/".length);
  const afterUpload = url.slice(uploadIndex + "/upload/".length);
  const versionMatch = afterUpload.match(/^v\d+\//);
  if (versionMatch) {
    const versionPart = versionMatch[0];
    return `${beforeUpload}${versionPart}${transforms.join(",")}/${afterUpload.slice(versionPart.length)}`;
  }
  return `${beforeUpload}${transforms.join(",")}/${afterUpload}`;
}

export function getResponsiveImageUrl(url: string, screenWidth: number): string { return optimizeCloudinaryUrl(url, { width: screenWidth }); }
export function getThumbnailUrl(url: string, width = 400, height = 300): string { return optimizeCloudinaryUrl(url, { width, height, fill: "crop" }); }
export function getHeroImageUrl(url: string): string { return optimizeCloudinaryUrl(url, { width: 1920, height: 1080, fill: "fill" }); }
export function getCardImageUrl(url: string): string { return optimizeCloudinaryUrl(url, { width: 800, height: 600, fill: "crop" }); }
export function getGalleryImageUrl(url: string): string { return optimizeCloudinaryUrl(url, { width: 600, height: 600, fill: "crop" }); }
