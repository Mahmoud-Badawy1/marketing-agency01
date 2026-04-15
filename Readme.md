# Marketer Pro (ماركتير برو) - Marketing Agency Platform

## Overview
Marketer Pro is a high-performance, full-stack marketing agency platform built for the Arabic market. It provides a conversion-optimized bilingual landing page, a comprehensive service booking and checkout system, a user authentication flow, an expert recruitment pipeline, and a feature-rich admin dashboard — all backed by a single-function serverless Express.js API on Vercel.

## Key Features

| Feature | Description |
| :--- | :--- |
| **Modern Bilingual UI** | Arabic-first RTL design with full English LTR support via a `useLanguage` hook |
| **CMS-Driven Content** | All landing page content (hero, pricing, instructor, gallery, FAQs, etc.) is managed via the Admin Settings tab and served from MongoDB |
| **Service Checkout** | Multi-step checkout with dynamic pricing, coupon codes, InstaPay/bank transfer flows, and Cloudinary-hosted payment proof uploads |
| **User Authentication** | OTP email-based sign-up/sign-in with JWT sessions and profile management |
| **Expert Recruitment** | A multi-step "Join the Team" form with application management in the admin dashboard |
| **Strategy Calls (Trials)** | Availability calendar with bookable time slots, capacity management, and recurrence support |
| **Booking Policies** | Admin-configurable cancellation and edit deadline hours |
| **Admin Dashboard** | Secure management of Leads, Orders, Trials, Coupons, Testimonials, Expert Applications, Settings, and CRM sync |
| **Coupon System** | Percentage and fixed-value coupons with usage logs, date ranges, and per-plan restrictions |
| **HubSpot CRM Sync** | Automatic and bulk synchronization of Leads, Orders, and Strategy Calls |
| **Vercel Optimized** | Single-function serverless architecture to bypass the 12-function Hobby plan limit |
| **SEO Ready** | Prerender.io support with dynamic `robots.txt` and sitemap generation |

## Project Architecture

### Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18 (Vite) + TypeScript |
| **Styling** | Tailwind CSS + Shadcn UI (Radix) |
| **Animation** | Framer Motion |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB + Mongoose |
| **Validation** | Zod (schema-first, shared across client/server) |
| **State Management** | TanStack Query (React Query v5) |
| **Media CDN** | Cloudinary |
| **CRM** | HubSpot API |
| **Auth** | OTP via Email + JWT sessions (bcrypt hashing) |
| **Hosting** | Vercel |

### Core Folder Structure
```
api/
  ├── index.ts                # Vercel Entry Point — the single serverless function
  ├── _server/                # Ignored by Vercel function discovery (underscore convention)
  │   ├── auth.ts             # JWT session management & OTP logic
  │   ├── db.ts               # MongoDB connection (singleton, supports cold-start reuse)
  │   ├── hubspot.ts          # HubSpot CRM sync service
  │   ├── routes.ts           # Route aggregator (mounts all sub-routers)
  │   ├── storage.ts          # IStorage interface + DatabaseStorage implementation
  │   └── routes/
  │       ├── auth.ts         # /api/auth/* — OTP, login, profile
  │       ├── availability.ts # /api/availability/* — Calendar slots (CRUD + recurrence)
  │       ├── common.ts       # Shared middleware (adminAuth, dbCheck, rateLimit, upload)
  │       ├── coupons.ts      # /api/admin/coupons/*
  │       ├── experts.ts      # /api/expert-applications/*
  │       ├── hubspot_admin.ts# /api/admin/hubspot/*
  │       ├── leads.ts        # /api/leads/* & /api/admin/leads/*
  │       ├── orders.ts       # /api/orders/* & /api/admin/orders/*
  │       ├── settings.ts     # /api/settings/* & /api/admin/settings/*
  │       ├── testimonials.ts # /api/admin/testimonials/*
  │       ├── trials.ts       # /api/trials/* & /api/admin/trials/*
  │       └── uploads.ts      # /api/admin/upload (Cloudinary)
  └── _shared/
      └── schema.ts           # Mongoose models + Zod validation schemas (shared source of truth)

client/
  └── src/
      ├── components/         # Atomic Design shared components
      │   ├── atoms/          # Button, Input, Badge, Label, Switch, Textarea, Checkbox
      │   ├── molecules/      # AdminSearchBar, ExportButton, StatusBadge, FAQAccordion
      │   ├── organisms/      # Navbar, Footer, WhatsAppFloat, SeasonalDecor
      │   ├── templates/      # AdminLayout, PublicLayout, DashboardLayout, AuthLayout
      │   ├── layout/         # Router.tsx (app-wide routing)
      │   └── ui/             # Shadcn/Radix primitives (accordion, dialog, card, etc.)
      ├── features/           # Feature-based modules (business logic lives here)
      │   ├── admin/          # Full admin dashboard (see Admin Dashboard section)
      │   ├── auth/           # OTP-based user authentication
      │   ├── checkout/       # Multi-step service checkout
      │   ├── contact/        # Contact/inquiry form
      │   ├── dashboard/      # Authenticated user dashboard
      │   ├── join-team/      # Expert recruitment multi-step form
      │   ├── landing/        # All public landing page sections (Hero, Pricing, FAQ, etc.)
      │   ├── layout/         # Navbar, Footer shared layout components
      │   └── testimonials/   # Public testimonials carousel
      ├── config/
      │   └── constants.ts    # Global constants (SERVICES, SOCIAL_FIELDS, PLANS, etc.)
      ├── hooks/              # Global custom hooks (use-toast, use-language, use-public-settings)
      └── lib/                # Utilities (queryClient, animations, admin fetch helper)
```

> [!IMPORTANT]
> **The Underscore (`_`) Convention**:
> Folders inside `api/` starting with an underscore (e.g., `_server`, `_shared`) are intentionally named to be **ignored by Vercel's serverless function discovery**. This allows the entire Express backend to be bundled into a single `/api` endpoint, bypassing the 12-function limit on Hobby plans.

## Admin Dashboard Modules

The admin panel at `/admin` provides the following management tabs:

| Tab | Description |
| :--- | :--- |
| **Leads** | View, filter, update status, and delete contact form submissions. Full-detail view dialog. |
| **Orders** | View detailed order modal (services, coupons, payment proof), edit plan/amount, confirm, cancel, or permanently delete. |
| **Trials** | Manage strategy call bookings with edit, cancel, and delete flows. |
| **Calendar** | Create, bulk-add, and manage availability time slots with optional recurrence. |
| **Coupons** | Full CRUD for discount coupons (percentage/fixed, date ranges, usage logs, plan restrictions). |
| **Experts** | Review and manage expert/job applications with notes and status updates. |
| **Testimonials** | Create, edit, toggle active, reorder, and delete client testimonials. |
| **Booking Policies** | Configure cancellation/edit deadline hours and warning messages. |
| **Settings** | CMS for all site content. Organized into accordion sections per landing page section. |
| **Analytics** | (Dashboard overview — leads, orders, trial counts) |

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)
- Cloudinary account (for image/media uploads)
- HubSpot Access Token (optional, for CRM sync)
- SMTP credentials (optional, for OTP emails)

### Setup
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   ADMIN_PASSWORD=your_secure_dashboard_password
   JWT_SECRET=your_jwt_signing_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   HUBSPOT_ACCESS_TOKEN=your_hubspot_token   # optional
   SMTP_HOST=smtp.example.com                # optional, for OTP emails
   SMTP_USER=user@example.com
   SMTP_PASS=your_smtp_password
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

## Development Guidelines

For detailed technical information, please refer to the documentation in `/documentation`:

| Document | Description |
| :--- | :--- |
| [ARCHITECTURE.md](./documentation/ARCHITECTURE.md) | System architecture, patterns, and design decisions |
| [API_SPECIFICATION.md](./documentation/API_SPECIFICATION.md) | Full endpoint reference with auth requirements |
| [DEEP_DIVE_CLIENT.md](./documentation/DEEP_DIVE_CLIENT.md) | Frontend architecture: atomic design, React Query, RTL |
| [DEEP_DIVE_SERVER.md](./documentation/DEEP_DIVE_SERVER.md) | Backend patterns: IStorage, Zod, middleware, security |
| [CRM_SYNC_GUIDE.md](./documentation/CRM_SYNC_GUIDE.md) | HubSpot synchronization logic and maintenance |
| [PRERENDER_SETUP.md](./documentation/PRERENDER_SETUP.md) | SEO and prerendering configuration |

## License
MIT
