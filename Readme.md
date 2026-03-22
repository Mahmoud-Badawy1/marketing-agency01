# Abqary (عبقري) - Arabic Educational Platform

## Overview
Abqary is an Arabic-first educational platform specialized in teaching Mental Math to children aged 5 to 13 years. The platform features a comprehensive landing page designed to convert parents into subscribers through trust-building content, interactive demos, and clear pricing. Includes a full admin dashboard for managing leads, orders, trial bookings, and platform settings.

## Recent Changes
- **Feb 15, 2026**: Added social media links management (Facebook, Instagram, YouTube, TikTok) in admin settings, displayed dynamically in footer
- **Feb 15, 2026**: Enhanced image management in admin with fallback previews showing current page images, custom/default badges
- **Feb 15, 2026**: Built admin dashboard with password auth, 4 tabs (Leads, Orders, Trials, Settings), status management, and settings editor
- **Feb 15, 2026**: Added multi-child checkout support with dynamic pricing, prominent CTAs to pricing section
- **Feb 15, 2026**: Added checkout/payment page with InstaPay manual transfer flow, image upload for payment proof, WhatsApp confirmation, orders table in DB
- **Feb 15, 2026**: Added FAQ, Privacy Policy, Terms pages with working footer navigation
- **Feb 15, 2026**: Initial MVP built - Full landing page with 11+ sections, lead capture form with PostgreSQL persistence, Arabic RTL support, brand colors (Navy Blue + Orange)

## User Preferences
- Arabic-first (RTL) design direction
- Feature-based with Atomic design pattern
- Clean, scalable code ready for backend integration
- Brand colors: Navy Blue (primary/trust) + Orange (accent/energy)
- Fonts: Cairo + Tajawal for Arabic, Poppins for English

## Project Architecture

### Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Shadcn UI
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Routing**: Wouter (client-side)

### Structure
```
client/src/
  ├── components/
  │   ├── layout/       # Navbar, Footer, WhatsAppFloat
  │   ├── sections/     # HeroSection, StatsSection, WhySection, DemoSection,
  │   │                 # SkillsSection, ProgramsSection, EmpowerSection,
  │   │                 # PricingSection, InstructorSection, GallerySection,
  │   │                 # ContactSection
  │   └── ui/           # Shadcn UI components
  ├── hooks/
  ├── lib/
  │   ├── admin.ts      # Admin auth helpers (token management, adminFetch)
  │   ├── constants.ts  # All dynamic content data (bilingual AR/EN)
  │   ├── queryClient.ts
  │   └── utils.ts
  └── pages/
      ├── Home.tsx           # Main landing page
      ├── Checkout.tsx       # Checkout/payment page (InstaPay flow, multi-child)
      ├── AdminLogin.tsx     # Admin login page
      ├── AdminDashboard.tsx # Admin dashboard with tabs
      ├── FAQ.tsx            # Frequently asked questions
      ├── Privacy.tsx        # Privacy policy
      ├── Terms.tsx          # Terms and conditions
      └── not-found.tsx

server/
  ├── db.ts             # Database connection
  ├── routes.ts         # API routes (public + admin)
  └── storage.ts        # Database storage interface

shared/
  └── schema.ts         # Drizzle schemas (users, leads, orders, trialBookings, siteSettings)
```

### API Endpoints
#### Public
- `POST /api/leads` - Submit lead capture form
- `GET /api/leads` - Retrieve all leads
- `POST /api/orders` - Create new order (checkout, supports children JSONB array)
- `POST /api/orders/:id/upload` - Upload transfer image proof
- `GET /api/orders` - Retrieve all orders

#### Public Settings
- `GET /api/public/settings` - Get public settings (plans, images, contact) without auth

#### Admin (require Bearer token auth)
- `POST /api/admin/login` - Admin login (password: env ADMIN_PASSWORD or "abqary2026")
- `GET /api/admin/leads` - Get all leads
- `PATCH /api/admin/leads/:id/status` - Update lead status
- `GET /api/admin/orders` - Get all orders
- `PATCH /api/admin/orders/:id/status` - Update order status (confirm/reject)
- `GET /api/admin/trial-bookings` - Get all trial bookings
- `PATCH /api/admin/trial-bookings/:id/status` - Update trial booking status
- `GET /api/admin/settings` - Get all site settings
- `PUT /api/admin/settings` - Update a site setting (key-value)
- `POST /api/admin/upload` - Upload image file (returns path)

### Database Tables
- `users` - User accounts (for future auth)
- `leads` - Contact form submissions (clientName, phone, monthlyBudget, message, source, status)
- `orders` - Checkout orders (clientName, phone, monthlyBudget, projectName, plan, amount, services JSONB, transferImage, status)
- `trial_bookings` - Consultation bookings (clientName, phone, status)
- `site_settings` - Platform settings as key-value pairs:
  - key="plans": Array of plan objects (id, name, subtitle, price, period, features[], popular)
  - key="images": Object with image paths (mascot, instructor, gallery1, gallery2)
  - key="contact": Object with contact info (whatsapp, instapay)

### Admin Dashboard
- Password-based auth (default: "abqary2026", configurable via ADMIN_PASSWORD env var)
- Token stored in localStorage, used as Bearer token for API calls
- 4 tabs: Leads (الرسائل), Orders (الاشتراكات), Trial Bookings (الحصص التجريبية), Settings (الإعدادات)
- Status management: new/contacted/converted for leads; pending/confirmed/rejected for orders and trials

### Key Design Decisions
- All content stored in `constants.ts` as bilingual objects (ar/en) for future i18n
- Landing page sections are self-contained components for easy reordering
- Lead form submits to PostgreSQL for real data persistence
- WhatsApp floating button for direct parent communication
- Brand identity: Abqary mascot (boy with cap), confident/empowering tone
- Multi-child support: children stored as JSONB array in orders table
- Admin auth: simple password-based token (password is the token) for MVP simplicity
