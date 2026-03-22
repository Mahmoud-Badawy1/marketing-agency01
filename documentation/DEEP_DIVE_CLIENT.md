# Client-Side Deep Dive: Marketer Pro Frontend

This guide is designed for senior frontend engineers and UI/UX developers working on the Marketer Pro client. It details the component architecture, state management, and localization patterns.

## 1. Component Architecture: Atomic & Sectional

The project follows a hybrid pattern tailored for high-conversion landing pages.

### Base Components (`client/src/components/ui/`)
- **Shadcn UI**: We use Shadcn UI (Radix-based) for low-level primitive components (Buttons, Dialogs, Inputs).
- **Styling**: Components are styled directly with Tailwind classes. We avoid custom CSS files and instead use full utility-class support for easier maintenance.

### Sectional Components (`client/src/components/sections/`)
- **Isolation**: Each landing page section (Hero, Pricing, etc.) is a standalone component.
- **Dynamic Content**: Sections pull their textual content from `client/src/lib/constants.ts` to allow for rapid content updates and future A/B testing without code redeploys.

## 2. Global State & Data Fetching

### React Query (TanStack Query)
- **Server State**: All API interactions are managed through React Query.
- **Caching**: Data like `site_settings` and `public_plans` are cached globally to ensure minimal network overhead during page navigation.

### Custom Hooks
- **`useLeadForm`**: Encapsulates the logic for lead submission, including validation and success/error state handling.
- **Admin Hooks**: Use the shared `adminFetch` utility from `client/src/lib/admin.ts` to handle token management and authorization headers automatically.

## 3. Bilingualism & RTL (Arabic-First)

### The `dir="rtl"` Principle
- The root `html` or `body` tag should have `dir="rtl"`.
- **Tailwind Logical Properties**: We use logical properties (`ps-4`, `me-4`) instead of physical ones (`pl-4`, `mr-4`). This ensures the layout correctly flips when switching between Arabic and English.

### Constants-Based Localization
All text is stored in `client/src/lib/constants.ts` as bilingual objects:
```typescript
const HERO_TEXT = {
  ar: "خدمات تسويق احترافية",
  en: "Professional Marketing Services"
};
```
To render: `{t(HERO_TEXT)}`. This helper function handles the current locale selection.

## 4. Performance & Asset Management

### Vite Bundling
Vite is configured to optimize the build by chunking large libraries (like Framer Motion).

### Image Optimization
- **Cloudinary Integration**: Most administrative images are served via Cloudinary's CDN.
- **Lazy Loading**: Native `loading="lazy"` is used for all off-screen gallery images to improve Largest Contentful Paint (LCP).

## 5. Animation Strategy (Framer Motion)
We use Framer Motion for micro-interactions and scroll-reveals.
- **`initial={{ opacity: 0, y: 20 }}`**: Standard fade-in-up pattern.
- **`whileInView={{ opacity: 1, y: 0 }}`**: Used for section transitions to create a premium, alive feel.
