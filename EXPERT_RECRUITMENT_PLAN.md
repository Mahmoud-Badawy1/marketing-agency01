# 📋 Expert Recruitment Page — Detailed Implementation Plan

## Overview

Create a **"انضم لفريق ماركتير برو" (Join the Marketeer Pro Team)** page for recruiting new experts/specialists. The page will match the existing landing page design (RTL, Cairo/Tajawal fonts, accent colors, framer-motion animations, Radix UI components) and include a full application form with backend API + admin dashboard management.

---

## 1. Database — New MongoDB Model

### `ExpertApplication` Schema (`shared/schema.ts`)

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `fullName` | String | ✅ | — | المدرس الاسم الكامل |
| `email` | String | ✅ | — | البريد الإلكتروني |
| `phone` | String | ✅ | — | رقم الهاتف (واتساب) |
| `age` | Number | ✅ | — | العمر |
| `city` | String | ✅ | — | المدينة / المحافظة |
| `education` | String | ✅ | — | المؤهل الدراسي (e.g. بكالوريوس تربية) |
| `specialization` | String | ✅ | — | التخصص |
| `experienceYears` | Number | ✅ | — | سنوات الخبرة في المجال |
| `hasAgencyExperience` | Boolean | ✅ | `false` | هل لديك خبرة في إدارة حملات تسويقية؟ |
| `portfolioDetails` | String | ❌ | — | تفاصيل الخبرة أو الرابط (إن وجد) |
| `marketingTools` | String | ❌ | — | المنصات التسويقية (Facebook Ads, Google Ads, etc.) |
| `availableHours` | String | ✅ | — | الأوقات المتاحة (صباحي / مسائي / مرن) |
| `motivation` | String | ❌ | — | لماذا تريد الانضمام لفريقنا؟ |
| `cvUrl` | String | ❌ | — | رابط السيرة الذاتية (Cloudinary upload) |
| `status` | String | — | `"new"` | حالة الطلب: `new` → `reviewed` → `interview` → `accepted` → `rejected` |
| `adminNotes` | String | ❌ | — | ملاحظات الأدمن (داخلية فقط) |
| `createdAt` | Date | auto | — | تاريخ التقديم |
| `updatedAt` | Date | auto | — | تاريخ آخر تحديث |

### Zod Validation Schema
- `insertExpertApplicationSchema` — validates form input
- `ExpertApplicationType` — TypeScript interface for API responses

---

## 2. Backend API Routes (`server/routes.ts` + `api/index.ts`)

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/expert-applications` | Public | Submit a new expert application (with optional CV upload via multer) |
| `GET` | `/api/admin/expert-applications` | Admin | List all applications (sorted newest first) |
| `PUT` | `/api/admin/expert-applications/:id/status` | Admin | Update application status (`new` → `reviewed` → `interview` → `accepted` → `rejected`) |
| `PUT` | `/api/admin/expert-applications/:id/notes` | Admin | Update admin internal notes |
| `DELETE` | `/api/admin/expert-applications/:id` | Admin | Delete an application |

### Storage Layer (`server/storage.ts`)
Add 5 new methods to `MongoStorage`:
- `createExpertApplication(data)` → create & return
- `getExpertApplications()` → find all, sorted by createdAt desc
- `updateExpertApplicationStatus(id, status)` → findByIdAndUpdate
- `updateExpertApplicationNotes(id, notes)` → findByIdAndUpdate
- `deleteExpertApplication(id)` → findByIdAndDelete

---

## 3. Frontend — Expert Recruitment Page

### Route: `/join-us` (or `/teach-with-us`)
New page: `client/src/pages/JoinTeam.tsx`

### Page Sections (top to bottom):

#### 3.1 Hero Banner
- Gradient background matching landing page style (purple/accent tones)
- Large heading: **"انضم لفريق الخبراء في ماركتير برو"**
- Subheading: **"كن جزءاً من مهمتنا لتقديم أفضل الحلول التسويقية"**
- Framer-motion fade-in animation (same `fadeInUp` from `lib/animations.ts`)
- "قدّم الآن" button scrolls to form

#### 3.2 Why Join Abqary Section (3 cards)
- **Card 1** — 🎯 "بيئة عمل مرنة" — العمل أونلاين من أي مكان بالأوقات المناسبة لك
- **Card 2** — 📈 "تطوير مهني مستمر" — تدريبات وورش عمل دورية لتحسين مهاراتك
- **Card 3** — 💰 "دخل مجزي" — عائد مادي ممتاز يتناسب مع خبرتك وأدائك

Uses same Card + motion animations as WhySection.

#### 3.3 Requirements Section
Bullet list styled with check icons (same green accent):
- خبرة في التسويق الرقمي
- شغف بمساعدة الشركات على النمو
- التزام بالمواعيد والاحترافية
- يفضل خبرة في إدارة الحملات الإعلانية
- اتصال إنترنت مستقر وجهاز كمبيوتر

#### 3.4 Application Form
Full form inside a Card with the following fields:

| Field | Component | Validation |
|---|---|---|
| الاسم الكامل | `Input` | Required, min 3 chars |
| البريد الإلكتروني | `Input` type=email | Required, valid email |
| رقم الهاتف (واتساب) | `Input` type=tel | Required, min 10 digits |
| العمر | `Input` type=number | Required, 18–60 |
| المدينة / المحافظة | `Input` | Required |
| المؤهل الدراسي | `Select` dropdown | Required (بكالوريوس / ماجستير / دكتوراه / دبلوم / أخرى) |
| التخصص | `Input` | Required |
| سنوات الخبرة | `Input` type=number | Required, 0–40 |
| هل لديك خبرة سابقة؟ | Radio (نعم/لا) | Required |
| تفاصيل الخبرة | `Textarea` | Shown conditionally if "نعم" |
| المنصات المستخدمة | `Input` | Optional (FB, Google, TikTok, etc.) |
| الأوقات المتاحة | `Select` | Required (صباحي / مسائي / مرن) |
| لماذا تريد الانضمام؟ | `Textarea` | Optional, max 500 chars |
| السيرة الذاتية (PDF) | File upload | Optional, max 5MB, PDF only → Cloudinary |
| زر "أرسل طلب الانضمام" | `Button` | Submits POST to `/api/expert-applications` |

After successful submit: show a success animation (checkmark + "تم إرسال طلبك بنجاح! سنراجعه ونتواصل معك قريباً").

#### 3.5 Footer
Reuse existing `Footer` component.

### SEO
- `<Helmet>` with title: "انضم لفريق عبقري | Abqary — وظائف مدربين"
- Meta description, OG tags, canonical URL `/join-us`
- JSON-LD `JobPosting` structured data

---

## 4. Admin Dashboard — Expert Applications Tab

### New tab in `AdminDashboard.tsx`: "طلبات الانضمام"

#### 4.1 Applications Table
| Column | Description |
|---|---|
| الاسم | fullName |
| الهاتف | phone (clickable WhatsApp link) |
| المدينة | city |
| الخبرة | experienceYears سنة |
| أباكوس | ✅/❌ badge |
| الحالة | Status badge (color-coded) |
| التاريخ | createdAt formatted |
| إجراءات | Status change buttons + view details + delete |

#### 4.2 Status Badges (color-coded)
| Status | Arabic | Color |
|---|---|---|
| `new` | جديد | Blue |
| `reviewed` | تمت المراجعة | Yellow |
| `interview` | مقابلة | Purple |
| `accepted` | مقبول | Green |
| `rejected` | مرفوض | Red |

#### 4.3 Expandable Row / Modal for Full Details
- Shows all application fields
- Admin notes textarea (editable, saves via PUT)
- CV download link (if uploaded)
- Status change dropdown
- Delete button with confirmation dialog

---

## 5. Navigation Update

### Navbar (`constants.ts`)
Add a new nav item or a standalone link:
- Button in Navbar: **"انضم للفريق"** → links to `/join-us`
- Style: outlined/ghost variant to differentiate from the main CTA

### Footer
Add "انضم لفريق عبقري" link in footer navigation.

---

## 6. File Changes Summary

| File | Action |
|---|---|
| `shared/schema.ts` | Add ExpertApplication model + Zod schema + types |
| `server/storage.ts` | Add 5 CRUD methods for expert applications |
| `server/routes.ts` | Add 5 API routes (1 public + 4 admin) |
| `api/index.ts` | Mirror the same 5 routes for Vercel serverless |
| `client/src/pages/JoinTeam.tsx` | **New file** — full recruitment page |
| `client/src/pages/AdminDashboard.tsx` | Add "طلبات المدربين" tab with table + management |
| `client/src/App.tsx` | Add `/join-us` route |
| `client/src/lib/constants.ts` | Add nav item for "انضم للفريق" |
| `client/src/components/layout/Navbar.tsx` | Add "انضم للفريق" button |
| `client/src/components/layout/Footer.tsx` | Add recruitment link |
| `server/routes.ts` (sitemap) | Add `/join-us` to sitemap.xml |

---

## 7. Design Tokens (matching existing)

- Animations: `fadeInUp`, `staggerContainer`, `scaleIn` from `lib/animations.ts`
- Colors: accent gradient, primary, muted-foreground (Tailwind classes already in use)
- Components: Radix `Card`, `Button`, `Input`, `Select`, `Textarea`, `Label`, `Badge`
- Font: Cairo + Tajawal (already loaded in index.html)
- Direction: RTL (already set globally)
- Motion: `framer-motion` with `viewportConfig` for scroll-triggered animations

---

## 8. Estimated Scope

- **Backend**: ~30 min (model + routes + storage)
- **Frontend page**: ~45 min (hero + cards + form + animations)
- **Admin tab**: ~30 min (table + status management + notes)
- **Navigation + SEO**: ~10 min

**Total: ~2 hours of implementation**

---

> ⚠️ **Awaiting your approval before proceeding with implementation.**
> Please review and let me know if you'd like to add, remove, or change anything.
