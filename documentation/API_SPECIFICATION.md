# Marketer Pro API Specification

This document provides a detailed reference for all API endpoints, their authentication requirements, and expected request/response shapes.

## 1. Authentication & Authorization

### Admin Authentication (Password-based)

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/admin/login` | POST | None | Authenticate with admin password. Returns a session token. |
| `/api/admin/verify` | GET | Admin Bearer Token | Verify the current admin session is valid. |
| `/api/admin/logout` | POST | Admin Bearer Token | Invalidate the current admin session. |

### User Authentication (OTP Email-based)

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/send-otp` | POST | None | Send a 6-digit OTP to a user's email address. |
| `/api/auth/verify-otp` | POST | None | Verify an OTP code and receive a JWT access token. |
| `/api/auth/me` | GET | User JWT | Get the authenticated user's profile data. |
| `/api/auth/set-password` | POST | User JWT | Set or update password for a user account. |
| `/api/auth/login-password` | POST | None | Log in with email + password (for returning users). |
| `/api/auth/update-profile` | PUT | User JWT | Update profile fields (name, phone, address, etc.). |

## 2. Lead Management

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/leads` | POST | None | Submit a new lead capture form. Triggers a background HubSpot sync. |
| `/api/admin/leads` | GET | Admin | Retrieve all leads, sorted by date descending. |
| `/api/admin/leads/:id/status` | PUT | Admin | Update the status of a specific lead (`new`, `contacted`, `converted`). |
| `/api/admin/leads/:id` | DELETE | Admin | Permanently delete a lead record. |

## 3. Order Management

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/orders` | POST | None | Create a new service order. Validates and applies coupon if provided. Triggers HubSpot sync. |
| `/api/orders/:id/upload` | POST | None | Upload a payment transfer proof image to Cloudinary. |
| `/api/user/orders` | GET | User JWT | Get all orders for the authenticated user. |
| `/api/user/orders/:id/cancel` | PUT | User JWT | Cancel a user's own order (ownership verified). |
| `/api/admin/orders` | GET | Admin | Retrieve all orders sorted by date. |
| `/api/admin/orders/:id/status` | PUT | Admin | Update an order's status (e.g., `pending`, `confirmed`, `cancelled`). |
| `/api/admin/orders/:id/plan` | PUT | Admin | Update the plan and amount associated with an order. |
| `/api/admin/orders/:id/cancel` | PUT | Admin | Cancel an order with a reason. |
| `/api/admin/orders/:id` | DELETE | Admin | Permanently delete an order record. |

## 4. Strategy Calls (Trial Bookings)

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/trials` | POST | None | Create a new strategy call booking. |
| `/api/user/trials` | GET | User JWT | Get all trial bookings for the authenticated user. |
| `/api/user/trials/:id/cancel` | PUT | User JWT | Cancel a user's own trial booking. |
| `/api/admin/trial-bookings` | GET | Admin | Retrieve all trial bookings. |
| `/api/admin/trial-bookings/:id` | PUT | Admin | Update a trial booking record. |
| `/api/admin/trial-bookings/:id/cancel` | PUT | Admin | Admin-cancel a trial booking with a reason. |
| `/api/admin/trial-bookings/:id` | DELETE | Admin | Permanently delete a trial booking. |

## 5. Availability Calendar

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/availability` | GET | None | Get available time slots (optionally filtered by date). |
| `/api/admin/availability` | POST | Admin | Create a single new availability slot. |
| `/api/admin/availability-bulk` | POST | Admin | Create multiple slots in a bulk batch (with optional recurrence). |
| `/api/admin/availability-bulk` | DELETE | Admin | Delete multiple slots by IDs. |
| `/api/admin/availability-item/:id` | PUT | Admin | Update a single availability slot. |
| `/api/admin/availability-item/:id` | DELETE | Admin | Delete a single availability slot. |
| `/api/admin/availability-series/:recurrenceId` | PUT | Admin | Update all slots in a recurrence series by a given start time. |
| `/api/admin/availability-series/:recurrenceId` | DELETE | Admin | Delete all slots belonging to a recurrence series. |

## 6. Coupon Management

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/coupons/validate` | POST | None | Validate a coupon code against a specific plan. |
| `/api/admin/coupons` | GET | Admin | List all coupons with usage logs. |
| `/api/admin/coupons` | POST | Admin | Create a new coupon. |
| `/api/admin/coupons/:id` | PUT | Admin | Update a coupon (toggle active, change value, etc.). |
| `/api/admin/coupons/:id` | DELETE | Admin | Delete a coupon permanently. |

## 7. Expert Applications (Join the Team)

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/expert-applications` | POST | None | Submit a new expert recruitment application. |
| `/api/admin/expert-applications` | GET | Admin | List all expert applications. |
| `/api/admin/expert-applications/:id/status` | PUT | Admin | Update an application's status. |
| `/api/admin/expert-applications/:id/notes` | PUT | Admin | Add admin notes to an application. |
| `/api/admin/expert-applications/:id` | DELETE | Admin | Delete an expert application. |

## 8. Testimonials

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/testimonials` | GET | None | Get all active (published) testimonials. |
| `/api/admin/testimonials` | GET | Admin | Get all testimonials (including inactive). |
| `/api/admin/testimonials` | POST | Admin | Create a new testimonial. |
| `/api/admin/testimonials/:id` | PUT | Admin | Update a testimonial (text, active state, order). |
| `/api/admin/testimonials/:id` | DELETE | Admin | Delete a testimonial. |

## 9. Settings & CMS

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/settings` | GET | None | Retrieve all public site settings (content, pricing, etc.). |
| `/api/admin/settings` | GET | Admin | Get all settings including private keys. |
| `/api/admin/settings` | PUT | Admin | Upsert a key-value setting pair. |

## 10. HubSpot CRM & Uploads

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/admin/hubspot/preview` | GET | Admin | Preview how many records are pending sync. |
| `/api/admin/hubspot/sync-all` | POST | Admin | Trigger a full background bulk sync of all records to HubSpot. |
| `/api/admin/upload` | POST | Admin | Upload a media file to Cloudinary. Returns the hosted URL. |

## Error Responses

All errors are returned in a standard JSON format:
```json
{
  "message": "Human-readable error description"
}
```

| Status Code | Meaning |
| :--- | :--- |
| `400 Bad Request` | Validation failure (Zod schema mismatch) |
| `401 Unauthorized` | Missing or invalid Bearer token |
| `404 Not Found` | Resource does not exist |
| `429 Too Many Requests` | Rate limit exceeded (default: 120 req/min) |
| `503 Service Unavailable` | MongoDB is not connected (`readyState !== 1`) |
