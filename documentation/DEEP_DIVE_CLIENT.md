# Client-Side Deep Dive: Marketer Pro Frontend

This guide is designed for senior frontend engineers working on the Marketer Pro client. It details the component architecture, feature structure, state management, and localization patterns.

## 1. Component Architecture: Atomic Design + Feature-Based Modules

The project uses a hybrid architecture that combines atomic design for shared UI with feature-based encapsulation for business logic.

### Atomic Design (`client/src/components/`)
Reusable, generic UI building blocks that are **not** tied to any specific business domain:

| Layer | Path | Contents |
| :--- | :--- | :--- |
| **Atoms** | `components/atoms/` | `Button`, `Input`, `Badge`, `Label`, `Switch`, `Textarea`, `Checkbox` |
| **Molecules** | `components/molecules/` | `AdminSearchBar`, `ExportButton`, `StatusBadge`, `FAQAccordion`, `LegalSectionsList` |
| **Organisms** | `components/organisms/` | `Navbar`, `Footer`, `WhatsAppFloat`, `SeasonalDecor` |
| **Templates** | `components/templates/` | `AdminLayout`, `PublicLayout`, `DashboardLayout`, `AuthLayout` |
| **UI Primitives** | `components/ui/` | Shadcn/Radix-based primitives (Dialog, Accordion, Card, etc.) |

> [!IMPORTANT]
> **The Canonical Rule**: Any component used in more than one feature **must** live in `components/`. Feature-specific components must **import** from `components/`, never the reverse.

### Feature-Based Modules (`client/src/features/`)
Each feature is a self-contained vertical slice of the application:

| Feature | Description |
| :--- | :--- |
| `admin/` | Complete admin dashboard: tabs for Leads, Orders, Trials, Coupons, Experts, Testimonials, Calendar, Settings |
| `auth/` | OTP sign-up, password login, and profile management |
| `checkout/` | Multi-step checkout: service selection → payment info → success |
| `contact/` | Public contact/inquiry form |
| `dashboard/` | Authenticated user dashboard (view bookings, orders, profile) |
| `join-team/` | Multi-step expert recruitment application form |
| `landing/` | All landing page sections: Hero, Pricing, Instructor, Gallery, FAQ, Stats, Testimonials |
| `layout/` | Header, Footer, and shared page layout components |
| `testimonials/` | Public-facing testimonials slider with Keen Slider |

## 2. Global State & Data Fetching

### React Query (TanStack Query v5)
All server state is managed through React Query. Key patterns:

```typescript
// Shared query key: all admin data uses the same prefix for easy invalidation
const { data } = useQuery({
  queryKey: ["/api/admin/orders"],
  queryFn: async () => {
    const res = await adminFetch("/api/admin/orders");
    if (!res.ok) throw new Error("Failed");
    return res.json();
  }
});

// After any mutation, invalidate to refetch automatically:
queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
```

### Public Settings Cache (`usePublicSettings`)
The hook at `hooks/use-public-settings.ts` fetches `/api/settings` once and caches all CMS content (pricing, hero text, FAQ, gallery, etc.) globally. Components should call this hook to read site content rather than maintaining local state.

### Admin Data Hooks
Each admin tab has a dedicated `use[Feature]Data.ts` hook that:
1. Fetches data with `useQuery`
2. Exposes mutations (`useMutation`) for all CRUD operations
3. Manages local UI state (dialogs, forms, search queries)
4. Uses the `adminFetch` utility from `lib/admin.ts` to inject the admin session token automatically

## 3. Bilingualism & RTL (Arabic-First)

### The `useLanguage` Hook
```typescript
const { t, language, setLanguage } = useLanguage();

// t() accepts a translation key or a bilingual { ar, en } object
t("hero.title")           // returns Arabic or English string from i18n JSON
t({ ar: "مرحبا", en: "Hello" })  // inline bilingual object
```

### Resolving Bilingual CMS Data
CMS settings from the database can be either a plain `string` or a `{ ar: string; en: string }` object. Use the pattern below to safely extract a typed string before passing to child components:

```typescript
const resolveStr = (val: any, fallback: string): string => {
  if (!val) return fallback;
  if (typeof val === "string") return val;
  if (typeof val === "object") return val.ar || val.en || fallback;
  return fallback;
};
```

### Tailwind Logical Properties
Use logical CSS properties to ensure RTL/LTR layouts flip correctly without custom overrides:

| ❌ Physical (avoid) | ✅ Logical (use) |
| :--- | :--- |
| `pl-4`, `pr-4` | `ps-4`, `pe-4` |
| `ml-4`, `mr-4` | `ms-4`, `me-4` |
| `text-left` | `text-start` |

## 4. Routing

All routes are defined in `components/layout/Router.tsx` using React Router v6. Route categories:
- **Public routes**: Landing page sections, Contact, Checkout, Join Team, Auth pages
- **Protected user routes**: `/dashboard/*` — requires valid user JWT
- **Protected admin routes**: `/admin/*` — requires valid admin session token

## 5. Performance & Asset Management

### Vite Bundling
Vite is configured with manual chunk splitting for large libraries (Framer Motion, React Router) to optimize initial load and caching behavior.

### Image Optimization
- **Cloudinary CDN**: Administrative uploaded images are served via Cloudinary with automatic format optimization.
- **Lazy Loading**: All off-screen images use `loading="lazy"` to improve LCP scores.
- **Fallback Images**: A `fallbackImages.ts` map provides static asset fallbacks when CMS images are not yet configured.

## 6. Animation Strategy (Framer Motion)

All animation presets are centralized in `lib/animations.ts`:

```typescript
// Standard scroll-reveal pattern
<motion.div
  initial="hidden"
  whileInView="visible"
  viewport={viewportConfig}  // { once: true, amount: 0.2 }
  variants={fadeInUp}
/>
```

Available presets: `fadeInUp`, `fadeInLeft`, `fadeInRight`, `scaleIn`, `staggerContainer`.

## 7. Smart Search (`useSmartSearch`)

The `hooks/use-smart-search.ts` hook provides instant client-side full-text filtering for all admin data tables. It accepts an array of data, a list of searchable field keys, and the current query string.

## 8. Excel Export (`useExcelExport`)

All admin tabs support exporting filtered data to Excel via `hooks/use-excel-export.ts`. Each tab defines its own column config (key, header, optional formatter) and passes it to `exportToExcel()`.
