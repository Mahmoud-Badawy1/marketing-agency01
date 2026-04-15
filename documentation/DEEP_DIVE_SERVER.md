# Server-Side Deep Dive: Marketer Pro Backend

This guide is intended for engineers working on the Marketer Pro backend. It details the architectural patterns, data modeling strategies, middleware design, and security posture.

## 1. Architectural Pattern: The Storage Interface (`IStorage`)

The project employs a **Repository pattern** abstraction found in `api/_server/storage.ts`.

### `IStorage` Interface
Every database operation the backend exposes is first declared as a method on the `IStorage` interface. The `DatabaseStorage` class then implements these methods using Mongoose.

```typescript
// The interface defines the contract:
interface IStorage {
  createLead(lead: InsertLead): Promise<LeadType>;
  getLeads(): Promise<LeadType[]>;
  deleteLead(id: string): Promise<boolean>;
  // ...and all other entities
}

// The implementation fulfills it:
class DatabaseStorage implements IStorage {
  async deleteLead(id: string) {
    const result = await Lead.findByIdAndDelete(id);
    return !!result;
  }
}

export const storage = new DatabaseStorage(); // Singleton used by all routes
```

### Why This Matters
- **Testability**: Inject a mock `IStorage` for unit tests without a live database.
- **Portability**: Swapping from MongoDB to a SQL DB only requires rewriting `DatabaseStorage`.

### Implementation Checklist (adding a new entity)
1. Add the Mongoose model + Zod schema to `api/_shared/schema.ts`.
2. Declare new method signatures in the `IStorage` interface.
3. Implement the methods in `DatabaseStorage`.
4. Create a new route file in `api/_server/routes/` and mount it in `routes.ts`.

## 2. Data Modeling & Validation (Mongoose + Zod Dual-Layer)

We use a **Schema-First** approach across two validation layers.

### Layer 1: Persistence (Mongoose Schema)
Defined in `api/_shared/schema.ts`. Use `.lean()` on all read queries to return plain JS objects and bypass Mongoose's document overhead:

```typescript
async getOrders(): Promise<OrderType[]> {
  return await Order.find().sort({ createdAt: -1 }).lean() as unknown as OrderType[];
}
```

### Layer 2: Ingress Validation (Zod)
Every `POST`/`PUT` handler validates the incoming request body against a Zod schema **before** it reaches the storage layer:

```typescript
router.post("/leads", async (req, res) => {
  try {
    const lead = insertLeadSchema.parse(req.body);  // throws ZodError on invalid input
    await storage.createLead(lead);
    // ...
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: fromZodError(error).message });
    }
  }
});
```

This prevents NoSQL injection and ensures data integrity before it ever hits the database.

### Bilingual Fields
Fields that store bilingual content use the `{ ar?: string; en?: string }` shape in Mongoose and Zod. The `resolveStr()` pattern is used on the frontend to safely extract the correct locale string.

## 3. Modular Routing & Middleware

### Route Organization (`api/_server/routes/`)

| File | Mounts | Key Patterns |
| :--- | :--- | :--- |
| `auth.ts` | `/api/auth/*` | OTP generation, bcrypt password hashing, JWT signing |
| `leads.ts` | `/api/leads`, `/api/admin/leads/*` | Public submit + admin CRUD |
| `orders.ts` | `/api/orders`, `/api/admin/orders/*` | Coupon validation, Cloudinary upload, status management |
| `trials.ts` | `/api/trials`, `/api/admin/trial-bookings/*` | Strategy call booking, slot increment, cancel/edit |
| `availability.ts` | `/api/availability`, `/api/admin/availability*` | Calendar slot CRUD with recurrence support |
| `coupons.ts` | `/api/admin/coupons/*` | Full coupon CRUD + atomic usage increment |
| `experts.ts` | `/api/expert-applications`, `/api/admin/expert-applications/*` | Recruitment pipeline |
| `testimonials.ts` | `/api/admin/testimonials/*` | CMS testimonials management |
| `settings.ts` | `/api/settings`, `/api/admin/settings` | Public read + admin upsert |
| `uploads.ts` | `/api/admin/upload` | Cloudinary multipart upload |
| `hubspot_admin.ts` | `/api/admin/hubspot/*` | CRM preview + bulk sync trigger |

### Critical Middleware (`api/_server/routes/common.ts`)

| Middleware | Purpose |
| :--- | :--- |
| `dbCheck` | Guards all routes — rejects with `503` if MongoDB is not in `readyState: 1` |
| `adminAuth` | Validates the `Authorization: Bearer <token>` header against the active sessions map |
| `userAuth` | Validates the user JWT token and attaches `req.userAuth` |
| `adminApiRateLimit` | IP-based rate limiting (120 req/min) to prevent abuse |
| `upload` | Multer middleware configured for in-memory multipart file buffering (Cloudinary streams) |

## 4. User Authentication System

The platform has a **dual authentication** model:

- **Admin**: Password-based, session tokens stored in an in-memory `Map`. Tokens are 32-byte `crypto.randomBytes` strings.
- **Users**: OTP email-based registration. After OTP verification, a JWT is issued (signed with `JWT_SECRET`). Users can optionally set a password for future logins.

### OTP Flow
1. `POST /api/auth/send-otp` → generate 6-digit code, hash it, store in `OtpCode` collection with 10-min TTL.
2. `POST /api/auth/verify-otp` → look up by email, check hash, check expiry, return JWT.
3. OTP codes are **consumed on first successful use** and **burned** after 5 failed attempts.

## 5. Cold-Start Optimizations

Since this project runs on Vercel Serverless Functions:

- **Connection Reuse**: The MongoDB connection in `api/_server/db.ts` is established at module load time. Vercel's execution context cache reuses the warm connection across invocations, minimizing connection overhead.
- **Single Bundle**: The entire server is compiled by `esbuild` into a single CommonJS file at `dist/api/index.js`. This reduces file-system I/O during function startup and significantly lowers cold-start latency.

## 6. Security Posture

| Mechanism | Implementation |
| :--- | :--- |
| **Timing-safe password compare** | `crypto.timingSafeEqual` used in `safeCompare()` for admin password checks |
| **Bcrypt hashing** | User passwords hashed with salt factor 10 before storage |
| **Session tokens** | 32-byte `crypto.randomBytes(32).toString('hex')` — unguessable |
| **JWT** | Signed with `HS256`, verified on every protected user route |
| **OTP lockout** | Codes are invalidated after 5 failed attempts |
| **Rate limiting** | IP-based limits on all admin and public form endpoints |
| **Input sanitization** | Zod schema validation on all POST/PUT request bodies |
| **No raw MongoDB queries** | All data access goes through the typed `IStorage` interface |
