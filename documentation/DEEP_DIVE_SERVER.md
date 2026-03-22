# Server-Side Deep Dive: Marketer Pro Backend

This guide is intended for senior engineers working on the Marketer Pro backend. It details the architectural patterns, data modeling strategies, and performance considerations.

## 1. Architectural Pattern: The Storage Interface

The project employs an abstraction layer between the API routes and the database logic, found in `api/_server/storage.ts`.

### Why This Matters
By using an `IStorage` interface, we achieve:
- **Testability**: You can easily inject a mock storage for unit testing without a live MongoDB.
- **Portability**: If the project ever needs to migrate from MongoDB to a SQL-based database or a different cloud provider, only the `DatabaseStorage` class needs to be rewritten; the 15+ route files remain untouched.

### Implementation Checklist
When adding a new feature:
1.  Define the method in `IStorage` interface.
2.  Implement it in `DatabaseStorage` using Mongoose.
3.  Access it via the exported `storage` singleton in your routes.

## 2. Data Modeling & Validation (Mongoose + Zod)

We use a "Schema-First" approach across two layers.

### Layer 1: Persistence (Mongoose)
Models in `api/_shared/schema.ts` use Mongoose to define the literal structure in MongoDB. We utilize `lean()` extensively in queries to bypass Mongoose's heavy document overhead and return plain JavaScript objects.

### Layer 2: Ingress Validation (Zod)
For every POST/PUT request, we use Zod schemas (e.g., `insertLeadSchema`) to sanitize and validate user input *before* it hits the storage layer. This prevents "NoSQL injection" and ensures data integrity.

## 3. Modular Routing & Middleware

### Router Organization
Routes are decoupled into functional modules (e.g., `leads.ts`, `orders.ts`). This keeps the `routes.ts` aggregator clean and prevents the "megalithic routes file" anti-pattern.

### Critical Middlewares
- **`dbCheck`**: A guard-rail middleware that ensures MongoDB is in `readyState: 1` before processing requests. Useful for graceful failing during cold-starts or connectivity drops.
- **`adminAuth`**: A custom Bearer token validator that checks the shared `sessions` map.
- **`apiRateLimit`**: IP-based rate limiting to prevent brute-force attacks on lead forms and admin login.

## 4. Cold-Start Optimizations
Since this project runs on Vercel Serverless Functions:
- **Connection Management**: We handle MongoDB connections at the top level of `api/_server/db.ts` to leverage Vercel's execution context reuse.
- **Bundling**: The server is compiled into a single CommonJS file via `esbuild`. This reduces the file-system overhead during function invocation, significantly decreasing cold-start latency.

## 5. Security Posture
- **TIMING-SAFE EQUALS**: Used in `safeCompare` for password checks to prevent timing attacks.
- **Bcrypt**: Used for hashing user passwords with a salt factor of 10.
- **Session Tokens**: 32-byte cryptographically secure random strings generated via `crypto.randomBytes`.
