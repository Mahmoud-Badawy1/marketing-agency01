# Abqary Performance Audit Report

**Date:** March 1, 2026  
**URL:** https://abqaryarqam.vercel.app  
**Framework:** React 18 + Vite 7 + Tailwind CSS 3 + Framer Motion  

---

## Current Metrics

| Metric | Value | Status |
|--------|-------|--------|
| **LCP** (Largest Contentful Paint) | **2.84s** | ⚠️ Needs Improvement (target: < 2.5s) |
| **CLS** (Cumulative Layout Shift) | **0.00** | ✅ Good |
| **INP** (Interaction to Next Paint) | **312ms** | ⚠️ Needs Improvement (target: < 200ms) |
| **LCP Element** | `img.w-full.h-full.object-cover` | Hero video/image |

---

## Executive Summary

The site suffers from **three root causes**:

1. **Massive unoptimized assets** — 15.4 MB of hero videos loaded eagerly, a 4.3 MB SVG in public/, and 4 Google Fonts loaded synchronously
2. **Framer Motion overuse** — 21 files import framer-motion, creating ~45+ IntersectionObservers, ~6 infinite animations, and heavy JavaScript on every interaction
3. **Zero code splitting** — All 8 pages and 47 UI components are eagerly loaded in a single bundle

---

## Issue #1: LCP — 2.84s (Critical)

### 1A. Hero Videos Are Huge (15.4 MB total)

The HeroSection imports 3 video files via static Vite imports:

```tsx
import heroVideo1 from "@assets/videos/hero-slide-1.mp4?url";  // 4.07 MB
import heroVideo2 from "@assets/videos/hero-slide-2.mp4?url";  // 2.79 MB
import heroVideo3 from "@assets/videos/hero-slide-3.mp4?url";  // 8.75 MB
```

**Impact:** The browser must download at least the first video (4 MB) before LCP can fire. On a 4G connection (~1.6 MB/s), that's ~2.5s just for the video download.

**Fix:**
- Compress videos to ≤1 MB each (reduce resolution to 720p, use H.265/VP9, lower bitrate)
- Add a static poster image (WebP, <50KB) as `poster` attribute on `<video>`
- Use `preload="none"` on non-current slides (only preload the first video)
- Consider hosting videos on a CDN with adaptive bitrate streaming

### 1B. Google Fonts Block Rendering (4 Font Families)

```html
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200..1000&family=Tajawal:wght@200;300;400;500;700;800;900&family=Poppins:wght@300;400;500;600;700;800;900&family=Inter:wght@300..900&display=swap" rel="stylesheet">
```

**Impact:** This loads **4 complete font families** with many weight variants. Even with `display=swap`, the CSS file itself is render-blocking. Cairo + Tajawal are Arabic fonts that include large character sets (~200-400 KB each).

**Fix:**
- Remove unused fonts (Inter and Poppins may not be needed if Cairo/Tajawal are the primary fonts)
- Subset the weights — use only 400, 600, 700 instead of full range 200-1000
- Use `<link rel="preload">` for the most critical font file
- Self-host fonts with `font-display: swap` for better caching
- Or: add `media="print" onload="this.media='all'"` to make it non-blocking

### 1C. ramadan1.svg Is 4.3 MB

```
ramadan1.svg — 4,380 KB (in both attached_assets/ AND client/public/)
```

**Impact:** This SVG is used in the `SeasonalDecor` component's `<img>` tag. At 4.3 MB, it's outrageously large for an SVG — likely contains embedded raster data or excessive path detail.

**Fix:**
- Optimize with SVGO or re-export at lower quality — target <50KB
- Convert to a simpler WebP/PNG if the SVG complexity can't be reduced
- Lazy-load it since it's a decorative element (not LCP-critical)

### 1D. No Image Lazy Loading

All images in sections below the fold (`SkillsSection`, `GallerySection`, `InstructorSection`, `TestimonialsSection`) are loaded eagerly:

```tsx
<img src={eventFallback1} className="w-full h-full object-cover" />  // No loading="lazy"
```

**Fix:** Add `loading="lazy"` to all images not in the viewport on initial load. Keep the hero/navbar images eager.

---

## Issue #2: INP — 312ms (Critical)

### 2A. Framer Motion Creates Massive JS Overhead

**21 files** import framer-motion. The library itself is ~30-50KB gzipped, but the real cost is runtime:

- `<motion.div>` wraps elements in a proxy that intercepts style updates
- `whileInView` creates an IntersectionObserver per element
- `AnimatePresence` maintains virtual DOM copies for exit animations
- `whileHover` / `whileTap` add event listeners to every element

**Estimated IntersectionObserver count on the Home page:**

| Section | Observers |
|---------|-----------|
| HeroSection | 3 |
| StatsSection | 2 |
| WhySection | 2 |
| DemoSection | 3 |
| SkillsSection | 5 |
| ProgramsSection | 4 |
| EmpowerSection | 2 |
| PricingSection | 6+ (per feature item!) |
| InstructorSection | 4 |
| GallerySection | 6 |
| TestimonialsSection | 2 |
| ContactSection | 10+ (per form field!) |
| Footer | 5 |
| Navbar | 2 |
| WhatsAppFloat | 2 |
| **Total** | **~55+** |

**Impact:** Every pointer interaction (click, tap) must process through framer-motion's animation scheduler, which delays paint. The 312ms INP means the main thread is blocked for 312ms after a user click before the next frame is painted.

**Fix:**
- Remove `whileInView` from individual list items (PricingSection features, ContactSection form fields). Use a single parent container animation instead.
- Replace `whileHover`/`whileTap` with CSS `:hover`/`:active` transitions where possible
- Use CSS `@keyframes` for simple animations (fade-in, slide-up) instead of framer-motion
- Consider removing framer-motion from components that only use basic animations

### 2B. Infinite Animations Never Stop

6 infinite animations run constantly, even when off-screen:

| Component | Animation | Impact |
|-----------|-----------|--------|
| WhatsAppFloat | `scale: [1, 1.2, 1]` every 2s | Always visible, always animating |
| WhatsAppFloat | Pulse ring `scale: [1, 1.5]` + fade | Always visible, always animating |
| EmpowerSection | `scale: [1, 1.15, 1]` every 2.5s | Never pauses off-screen |
| EmpowerSection | `rotate: 360°` over 15s | Never pauses off-screen |
| GallerySection | Shimmer `x: [-100%, 100%]` over 5s | Never pauses off-screen |
| ContactSection | WhatsApp icon pulse | Never pauses off-screen |

**Impact:** These constantly trigger layout/paint cycles, stealing CPU time from interaction handlers.

**Fix:** Pause animations when off-screen using `useInView`, or replace with CSS animations that the browser can optimize.

### 2C. setInterval Timers Run Unthrottled

| Component | Timer | Impact |
|-----------|-------|--------|
| StatsSection | `setInterval(16ms)` × 3 counters | 60fps re-renders for 1.5s |
| DemoSection | `setInterval(350ms)` | Continuous re-renders for equation animation |
| TestimonialsSection | `setInterval(5000ms)` | Runs even when section is off-screen |
| HeroSection | `setTimeout(7000ms)` | Slide auto-advance (acceptable) |

**Fix:**
- Use `requestAnimationFrame` instead of `setInterval(16ms)` for counters
- Pause all timers when section is not in viewport
- Use `useEffect` cleanup properly

---

## Issue #3: Bundle Size & Build Time (High)

### 3A. Zero Code Splitting

All 8 pages are eagerly imported in `App.tsx`:

```tsx
import Home from "@/pages/Home";
import FAQ from "@/pages/FAQ";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Checkout from "@/pages/Checkout";
import JoinTeam from "@/pages/JoinTeam";       // 661 lines!
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
```

**Impact:** A user visiting the home page downloads code for AdminDashboard, Checkout, JoinTeam, FAQ, Privacy, Terms — pages they may never visit. AdminDashboard alone imports 6 tab components + recharts + many UI components.

**Fix:** Use `React.lazy()` + `Suspense` for all routes except Home:

```tsx
const FAQ = React.lazy(() => import("@/pages/FAQ"));
const AdminDashboard = React.lazy(() => import("@/pages/AdminDashboard"));
// etc.
```

### 3B. 47 UI Components Loaded (Many Unused)

The `components/ui/` folder contains **47 shadcn/ui components**. Many are only used in the admin dashboard (sidebar, chart, calendar, command, context-menu, hover-card, menubar, resizable, etc.) but are pulled into the main bundle.

**Impact:** Each component imports its Radix UI primitive (avg ~5-15KB each). Total Radix UI bundle could be 200-400KB uncompressed.

**Fix:** Code splitting via lazy routes will naturally tree-shake these. Vite's tree-shaking should handle unused components if they're not imported on the Home page path.

### 3C. Heavy Dependencies

| Package | Size (gzipped) | Used By |
|---------|---------------|---------|
| framer-motion | ~33KB | 21 files |
| recharts | ~50KB | Admin only |
| react-icons | ~varies | 3 files (could use lucide instead) |
| date-fns | ~6KB | Minimal use |
| embla-carousel-react | ~7KB | Only carousel UI component |
| react-day-picker | ~10KB | Admin calendar only |
| cmdk | ~4KB | Command palette only |
| react-resizable-panels | ~8KB | Admin only |
| react-helmet-async | ~3KB | All pages |

**Fix:** 
- Code splitting will isolate recharts, react-day-picker, cmdk, react-resizable-panels to admin route
- Consider a lighter alternative to framer-motion for simple animations (CSS or a micro-library)
- Replace `react-icons/si` imports with lucide-react equivalents (already used everywhere else)

### 3D. Replit Plugins in Production Config

```typescript
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
// ...
runtimeErrorOverlay(), // Always included, even in production!
```

**Impact:** The Replit runtime error overlay is always included in the bundle. The cartographer and dev-banner are conditionally excluded, but `runtimeErrorOverlay` runs unconditionally.

**Fix:** Wrap it in the same `NODE_ENV !== "production"` check.

---

## Issue #4: Network & Caching (Medium)

### 4A. No Static Asset Cache Headers in vercel.json

The `vercel.json` only sets cache headers for `/api/` routes (no-cache). Static assets (JS, CSS, images, fonts) get Vercel's default caching, but explicit long-term caching would help:

```json
{
  "source": "/assets/(.*)",
  "headers": [
    { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
  ]
}
```

### 4B. No Preloading of Critical Resources

The `index.html` has no `<link rel="preload">` hints for:
- The first hero video (LCP element)
- The mascot image (Navbar)
- Critical CSS/JS chunks

**Fix:** Add preload hints for LCP-critical resources.

### 4C. Vite Build Lacks Optimization Config

The Vite config has no `build.rollupOptions` for manual chunk splitting:

```typescript
build: {
  outDir: path.resolve(import.meta.dirname, "dist/public"),
  emptyOutDir: true,
  // No rollupOptions, no manualChunks, no minification settings
}
```

**Fix:** Add manual chunks to separate vendor code:

```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom'],
        'vendor-motion': ['framer-motion'],
        'vendor-radix': [/* radix packages */],
      }
    }
  }
}
```

---

## Issue #5: Component-Level Issues (Medium)

### 5A. SeasonalDecor (445 lines) — Always Mounted

Even when `decorationEnabled` is false, the component is imported and its module (including framer-motion animations) is parsed. It creates 8 `HangingItem` components, each with:
- Its own `useAnimation()` controller
- Click handlers with sound via Web Audio API
- Infinite sway animations
- SVG filter effects

**Fix:** Lazy-load SeasonalDecor only when decoration is enabled.

### 5B. ContactSection (379 lines) — Too Many Observers

The contact form has **7 individual whileInView animations** for form fields, plus section-level animations, plus AnimatePresence for form/success state, plus 2 infinite animations.

**Fix:** Use a single `staggerChildren` on the parent container instead of per-field observers.

### 5C. HeroSection Videos — All 3 Videos Reference Set in DOM

```tsx
<video
  ref={(el) => { videoRefs.current[current] = el; }}
  src={slides[current].video}
/>
```

The component only renders 1 video at a time (good), but the `AnimatePresence` with `mode="popLayout"` keeps the exiting video in the DOM during transitions, meaning 2 videos can be playing simultaneously during slide changes.

**Fix:** Use `mode="wait"` instead of `mode="popLayout"` to ensure only one video is in the DOM at a time, or pause the exiting video.

---

## Priority Action Plan

### Phase 1 — Quick Wins (Expected LCP improvement: ~1s, INP: ~50ms)
1. ✅ Add `poster` image to hero videos + `preload="metadata"` 
2. ✅ Add `loading="lazy"` to all below-fold images
3. ✅ Optimize `ramadan1.svg` (4.3 MB → <50KB) or convert to PNG/WebP
4. ✅ Subset Google Fonts (remove Inter/Poppins if unused, limit weights)
5. ✅ Remove Replit runtime overlay from production build

### Phase 2 — Code Splitting (Expected bundle size reduction: ~40-60%)
6. ✅ Lazy-load all routes except Home in App.tsx
7. ✅ Lazy-load SeasonalDecor conditionally
8. ✅ Add Vite manual chunks configuration

### Phase 3 — Animation Optimization (Expected INP improvement: ~100ms)
9. ✅ Replace framer-motion `whileInView` on individual items with parent `staggerChildren`
10. ✅ Pause infinite animations when off-screen (or replace with CSS `@keyframes`)
11. ✅ Replace framer-motion `whileHover`/`whileTap` with CSS where possible
12. ✅ Use `requestAnimationFrame` for counter animations

### Phase 4 — Advanced (Expected: further 200-500ms improvement)
13. ✅ Compress hero videos to <1 MB each
14. ✅ Add static cache headers for versioned assets
15. ✅ Add `<link rel="preload">` for critical resources
16. ✅ Consider replacing framer-motion with CSS animations for simple use cases

---

## Expected Results After All Optimizations

| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| **LCP** | 2.84s | < 1.8s | ~1s saved |
| **INP** | 312ms | < 150ms | ~160ms saved |
| **Bundle Size** | ~500-700KB (est.) | ~200-300KB | ~50% reduction |
| **Build Time** | Slow | Faster | Smaller bundle = faster build |

---

## Files Affected

| File | Changes Needed |
|------|---------------|
| `client/index.html` | Font optimization, preload hints |
| `client/src/App.tsx` | React.lazy() for routes |
| `client/src/pages/Home.tsx` | Lazy SeasonalDecor |
| `client/src/components/sections/HeroSection.tsx` | Video poster, preload, AnimatePresence mode |
| `client/src/components/sections/*.tsx` | Image lazy loading, reduce whileInView |
| `client/src/components/layout/SeasonalDecor.tsx` | Lazy load, optimize SVG |
| `client/src/components/layout/WhatsAppFloat.tsx` | CSS animations instead of FM |
| `client/src/components/layout/Footer.tsx` | Reduce motion usage |
| `client/public/ramadan1.svg` | Optimize or replace (4.3 MB → <50KB) |
| `vite.config.ts` | Remove replit overlay in prod, add manual chunks |
| `vercel.json` | Add cache headers for static assets |
