# Marketer Pro (ماركتير برو) - Marketing Agency Platform

## Overview
Marketer Pro is a high-performance marketing agency platform designed for the Arabic market. It features a stunning, conversion-optimized landing page, a robust service booking system, and a comprehensive admin dashboard for managing leads, orders, strategy calls (trials), and CRM synchronization with HubSpot.

## Key Features
- **Modern UI/UX**: Bilingual (Arabic/English) interface with a focus on Arabic RTL support.
- **Service Booking**: Integrated checkout with InstaPay/Manual transfer flows and payment proof uploads.
- **Admin Dashboard**: Secure management of leads, orders, and trial bookings.
- **HubSpot Integration**: Automatic synchronization of leads and customers to HubSpot CRM.
- **Vercel Optimized**: Specialized architecture to bypass Hobby plan limits (12 function limit).
- **SEO Ready**: Prerender.io support and dynamic robots.txt/sitemap generation.

## Project Architecture

### Technology Stack
- **Frontend**: React (Vite) + Tailwind CSS + Framer Motion (Animations).
- **Backend**: Node.js + Express.
- **Database**: MongoDB + Mongoose.
- **Validation**: Zod (Schema-first validation).
- **CRM**: HubSpot API.
- **Hosting**: Vercel.

### Core Folder Structure
```
api/
  ├── index.ts          # Vercel Entry Point (High importance)
  ├── _server/          # Backend logic (routes, storage, auth, integrations)
  └── _shared/          # Shared schemas and types (Mongoose/Zod)
client/
  ├── src/
  │   ├── components/   # Atomic design components (Admin tabs, Landing sections)
  │   ├── pages/        # Main application pages
  │   └── lib/          # Constants, utils, and API helpers
  └── public/           # Static assets
script/
  └── build.ts          # Consolidated build script for Client/Server
```

> [!IMPORTANT]
> **The Underscore (`_`) Convention**: 
> Folders inside `api/` starting with an underscore (like `_server` and `_shared`) are intentionally named this way. Vercel ignores these folders during its "Serverless Function" discovery, allowing the entire backend to be bundled into a single `/api` endpoint. This resolves the 12-function limit on Vercel Hobby plans.

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)
- HubSpot Access Token (Optional, for CRM sync)

### Setup
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   ```env
   MONGODB_URI=your_mongodb_uri
   ADMIN_PASSWORD=your_dashboard_password
   HUBSPOT_ACCESS_TOKEN=your_token
   CLOUDINARY_URL=your_cloudinary_config
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

## Development Guidelines
For detailed information on the codebase, architecture decisions, and contribution standards, please refer to:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Deep dive into systems and patterns.
- [PRERENDER_SETUP.md](./PRERENDER_SETUP.md) - SEO and Prerendering guide.

## License
MIT
