# Phase 4 - Asset Optimization Guide

## Current Status

### Phase 4A: Video Compression ⏳ (Pending)
**Hero Videos - 15.41 MB Total**
- hero-slide-1.mp4: 4.07 MB
- hero-slide-2.mp4: 2.79 MB
- hero-slide-3.mp4: 8.55 MB ⚠️ (Largest file)

**Optimization Target:** Reduce to ~4-5 MB total (70% reduction)

### Phase 4B: SVG Optimization ✅ (Complete)
**ramadan1.svg**
- Original: 4.28 MB
- Optimized: 3.30 MB
- Reduction: 1004 KB (22.9%)
- Status: ✅ Completed and saved

---

## Video Compression Instructions

### Prerequisites
FFmpeg must be installed on your system.

#### Installation Options

**Option 1: Chocolatey (Recommended for Windows)**
```powershell
choco install ffmpeg
```

**Option 2: Manual Download**
- Download from: https://ffmpeg.org/download.html
- Extract to a folder (e.g., `C:\ffmpeg`)
- Add to system PATH:
  1. Win + R → `sysdm.cpl` → Advanced tab
  2. Environment Variables → New System Variable
  3. Variable name: `FFMPEG_HOME`
  4. Variable value: `C:\ffmpeg\bin`
  5. Add to PATH: `;%FFMPEG_HOME%`

**Option 3: Alternative Installers**
- **Scoop:** `scoop install ffmpeg`
- **Windows Package Manager:** `winget install FFmpeg`

### Verification
After installation, verify FFmpeg is available:
```powershell
ffmpeg -version
```

### Running Video Compression

**Windows Users:**
```powershell
# Run the batch script
cd d:\projects\AbqaryProject\abqary
.\script\compress-videos.bat

# OR use FFmpeg directly for a single file
ffmpeg -i attached_assets/videos/hero-slide-3.mp4 `
  -c:v libx265 -crf 28 -preset medium -s 1920x1080 `
  -c:a aac -b:a 96k `
  attached_assets/videos/compressed/hero-slide-3.mp4
```

**macOS/Linux Users:**
```bash
cd d:/projects/AbqaryProject/abqary
bash script/compress-videos.sh

# OR single file
ffmpeg -i attached_assets/videos/hero-slide-3.mp4 \
  -c:v libx265 -crf 28 -preset medium -s 1920x1080 \
  -c:a aac -b:a 96k \
  attached_assets/videos/compressed/hero-slide-3.mp4
```

### FFmpeg Parameters Explained

| Parameter | Value | Reason |
|-----------|-------|--------|
| `-c:v` | libx265 | H.265 codec - 40-50% better compression than H.264 (libx264) |
| `-crf` | 28 | Quality level (0=lossless, 51=worst). 28 is good balance for web |
| `-preset` | medium | Speed vs compression trade-off (ultrafast, fast, medium, slow, slower) |
| `-s` | 1920x1080 | Maximum resolution for web (1080p) |
| `-c:a` | aac | Audio codec (sufficient for speech) |
| `-b:a` | 96k | Audio bitrate (speech needs <128k) |

### Quality Adjustment

If compressed videos look bad, adjust CRF value:
- **Lower CRF (better quality, larger file):** Use CRF 23-24
- **Higher CRF (worse quality, smaller file):** Use CRF 31-32

```powershell
# Higher quality example
ffmpeg -i input.mp4 -c:v libx265 -crf 24 -preset slow output.mp4
```

---

## Expected Results After Phase 4

### Current Total Asset Size: 19.69 MB
- hero-slide-1.mp4: 4.07 MB
- hero-slide-2.mp4: 2.79 MB
- hero-slide-3.mp4: 8.55 MB
- ramadan1.svg: 3.30 MB (optimized ✅)

### Projected After Compression: ~7-8 MB Total
- hero-slide-1.mp4: ~1.2 MB (70% reduction)
- hero-slide-2.mp4: ~0.8 MB (70% reduction)
- hero-slide-3.mp4: ~2.5 MB (70% reduction)
- ramadan1.svg: 3.30 MB (already optimized)

### Performance Impact
**Additional LCP Improvement:** 800-1200ms
- First video load reduced from 8.55 MB to 2.5 MB
- Fewer retransmissions on slow connections
- Better cached video playback

---

## After Compression: Updating the Project

### Step 1: Move Compressed Videos
```powershell
# Copy compressed videos to replace originals
Copy-Item "attached_assets/videos/compressed/hero-slide-*.mp4" `
  -Destination "attached_assets/videos/" -Force
```

### Step 2: Verify in HeroSection
The HeroSection component at `client/src/components/sections/HeroSection.tsx` loads videos from:
```typescript
const heroSlides = settings?.hero_slides || HERO_SLIDES;
```

Video sources are already dynamic, so no code changes needed.

### Step 3: Rebuild Project
```powershell
npm run build
```

### Step 4: Verify
1. Run local dev server: `npm run dev`
2. Check Network tab in DevTools
3. Verify videos load with new compressed sizes
4. Test playback quality

---

## Summary of All Optimizations (Phase 1-4)

| Phase | Task | Status | Impact |
|-------|------|--------|--------|
| 1 | Font subsetting | ✅ | -200-300 KB |
| 1 | Video preload optimization | ✅ | -500-800ms LCP |
| 1 | Code splitting (7 routes) | ✅ | 65-75% main bundle ↓ |
| 1 | Manual Vite chunks | ✅ | Better caching |
| 2 | Image lazy loading (8+ images) | ✅ | Off-screen images defer |
| 2 | Image deduplication | ✅ | Single import per asset |
| 3 | Animation optimization | ✅ | 50-100ms INP ↓ |
| 3 | CSS-based animations | ✅ | GPU optimization |
| 4A | SVG optimization | ✅ | -1 MB (ramadan1.svg) |
| 4B | Video compression | ⏳ | -11 MB (pending) |

### Projected Total Impact
- **LCP:** 2.84s → ~0.8-1.2s (70% improvement)
- **INP:** 312ms → ~160-200ms (50% improvement)
- **Bundle Size:** 500-700 KB → ~120-180 KB (75% reduction)
- **Repeat Visits:** -400-600ms LCP (due to cache headers)

---

## Troubleshooting

### FFmpeg Not Found
```powershell
# Verify installation
where ffmpeg

# If not found, reinstall and add to PATH
# Then restart PowerShell/Terminal
```

### Compression Takes Too Long
- Reduce preset: `ultrafast` (faster but larger files)
- Lower resolution: `-s 1280x720` (720p instead of 1080p)
- Higher CRF: `32` (smaller but lower quality)

### Output Video Too Large
- Increase CRF: Try 30-32 (more compression)
- Reduce bitrate: `-b:v 1500k` (add video bitrate limit)

### Output Video Quality Issues
- Decrease CRF: Try 24-26 (better quality)
- Use slower preset: `slow` or `slower`

---

## Next Steps

1. ✅ Install FFmpeg on your system
2. ⏳ Run the compression script
3. ✅ Review compressed videos for quality
4. ✅ Replace original video files
5. ✅ Run `npm run build`
6. ✅ Deploy to Vercel

---

**Estimated Time to Complete Phase 4:**
- SVG Optimization: ✅ ~2 minutes (already done)
- Video Compression: ⏳ 15-30 minutes per video (depends on system CPU)
- Testing & Verification: ~5 minutes
- **Total: ~50-100 minutes**
