import { Router } from "express";
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import { adminAuth, adminApiRateLimit, upload, uploadMedia, PUBLIC_ID_MAP } from "./common.js";

const router = Router();

router.post("/upload", adminAuth, adminApiRateLimit, upload.single("image"), async (req, res) => {
  try {
    const file = req.file;
    const imageKey = req.body.imageKey as string | undefined;

    if (!file) {
      return res.status(400).json({ message: "لم يتم رفع ملف" });
    }

    const publicId = imageKey && PUBLIC_ID_MAP[imageKey]
      ? PUBLIC_ID_MAP[imageKey]
      : `upload-${Date.now()}`;

    let compressedBuffer: Buffer;
    try {
      compressedBuffer = await sharp(file.buffer)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
    } catch {
      compressedBuffer = file.buffer;
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "abqary-uploads",
          public_id: publicId,
          overwrite: true,
          invalidate: true,
          transformation: [
            { quality: "auto", fetch_format: "auto" }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(compressedBuffer);
    });

    const imageUrl = (result as any).secure_url;
    res.json({ path: imageUrl });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "خطأ في رفع الصورة" });
  }
});

router.post("/upload-media", adminAuth, adminApiRateLimit, uploadMedia.single("media"), async (req, res) => {
  try {
    const file = req.file;
    const mediaKey = req.body.mediaKey as string | undefined;

    if (!file) {
      return res.status(400).json({ message: "لم يتم رفع ملف" });
    }

    const publicId = mediaKey && PUBLIC_ID_MAP[mediaKey]
      ? PUBLIC_ID_MAP[mediaKey]
      : `media-${Date.now()}`;

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          folder: "abqary-media",
          public_id: publicId,
          overwrite: true,
          invalidate: true,
          ...(file.mimetype.includes('video') && {
            eager: [
              { format: "mp4", video_codec: "h265", quality: "auto:good" },
              { format: "webm", video_codec: "vp9", quality: "auto:good" }
            ],
            eager_async: true
          })
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(file.buffer);
    });

    const mediaUrl = (result as any).secure_url;
    res.json({ path: mediaUrl });
  } catch (error) {
    console.error("Media upload error:", error);
    res.status(500).json({ message: "خطأ في رفع الملف" });
  }
});

export default router;
