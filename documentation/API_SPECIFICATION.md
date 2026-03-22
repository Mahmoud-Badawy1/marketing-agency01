# Marketer Pro API Specification

This document provides a detailed reference for all API endpoints available on the platform and their respective status/requirements.

## 1. Authentication & Authorization

Most endpoints require a **Bearer Token** in the `Authorization` header.

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/admin/login` | POST | None | Admin login with password. Returns JWT. |
| `/api/admin/verify` | GET | Admin | Verifies the validity of the current admin session. |
| `/api/admin/logout` | POST | Admin | Invalidates the current admin session. |

## 2. Lead Management

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/leads` | POST | None | Submit a new lead caputure form. (CRM sync triggered). |
| `/api/admin/leads` | GET | Admin | Retrieve all leads sorted by date. |
| `/api/admin/leads/:id/status`| PUT | Admin | Update the status of a specific lead. |

## 3. Order & Strategy Booking

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/orders` | POST | None | Create a new service order (Checkout). |
| `/api/admin/orders` | GET | Admin | Retrieve all orders. |
| `/api/admin/orders/:id/status`| PUT | Admin | Update payment/order status. |
| `/api/trials` | POST | None | Book a new strategy/trial call. |
| `/api/admin/trials` | GET | Admin | Retrieve all strategy call bookings. |

## 4. HubSpot & CRM Integration

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/admin/hubspot/preview` | GET | Admin | Get counts for all objects ready to sync. |
| `/api/admin/hubspot/sync-all`| POST | Admin | Trigger a background bulk sync for CRM data. |

## 5. System Settings & Utilities

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/admin/settings` | GET | Admin | Retrieve all key-value site configurations. |
| `/api/admin/settings` | PUT | Admin | Upsert a specific site setting key. |
| `/api/admin/upload` | POST | Admin | Upload media to Cloudinary (Admin only). |

## Error Responses

All errors are returned in a standard JSON format:
```json
{
  "message": "Human-readable error description",
  "error": "Short_machine_code (Optional)"
}
```

- **401 Unauthorized**: Missing or invalid Bearer token.
- **429 Too Many Requests**: Rate limit exceeded (Default: 120 requests/minute).
- **503 Service Unavailable**: Database connection is currently down.
- **400 Bad Request**: Validation failed (e.g., Zod schema mismatch).
