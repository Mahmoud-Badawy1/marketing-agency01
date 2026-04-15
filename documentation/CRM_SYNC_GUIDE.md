# HubSpot CRM Synchronization Guide

This guide is intended for developers and CRM administrators who need to maintain or extend the HubSpot synchronization logic within the Marketer Pro platform.

## 1. System Overview

The synchronization service (`api/_server/hubspot.ts`) is designed for **unidirectional** data flow: from the Marketer Pro platform to HubSpot CRM. It handles three primary business objects: Leads, Strategy Calls (Trials), and Service Orders.

### Design Goals
- **Non-blocking**: CRM sync must never delay the user's web experience. All syncs run as background promises.
- **Resilience**: A failed HubSpot sync must not fail the web API response. Errors are logged to console, execution continues.
- **De-duplication**: Contacts are matched by `email` to prevent duplicate records.
- **Consistency**: Status changes and deal amounts are patched back to HubSpot when updated in the admin dashboard.

## 2. Synchronization Logic

### Data Object Mapping

| Marketer Pro | HubSpot Object | Lifecycle Stage |
| :--- | :--- | :--- |
| **Lead** (Contact Form) | Contact | `lead` |
| **Trial Booking** (Strategy Call) | Contact | `opportunity` |
| **Order** (Service Purchase) | Contact + Deal | `customer` (on Deal creation) |

### Order Sync (Dual-Object)
Orders trigger the most complex sync:
1. **Upsert Contact**: Search by email → PATCH existing or POST new contact.
2. **Create Deal**: POST a new Deal with the order amount and plan name.
3. **Associate**: Link the Deal to the Contact via HubSpot's v4 associations API.

### Identity Management (De-duplication)
Before pushing any record, the sync service performs a POST search against `/crm/v3/objects/contacts/search` using the email address:
- **Match found** → `PATCH /crm/v3/objects/contacts/{id}` to update details.
- **No match** → `POST /crm/v3/objects/contacts` to create a new contact.

## 3. Admin Token Management

The HubSpot Access Token is stored in MongoDB under the `site_settings` key `hubspot_token`. The sync service:
1. Reads the token from the database on first use.
2. Caches it **in memory** for 60 seconds to avoid repeated DB lookups during bulk operations.
3. Falls back to the `HUBSPOT_ACCESS_TOKEN` environment variable if no DB token is configured.

> [!WARNING]
> After updating the HubSpot token in Admin Settings, **the cache will persist for up to 60 seconds**. Triggering a sync immediately after a token change may use the old token momentarily.

## 4. Bulk Syncing

For historical data migration or post-outage recovery:

- **Endpoint**: `POST /api/admin/hubspot/sync-all` (Admin-only)
- **Preview**: `GET /api/admin/hubspot/preview` returns counts of all pending objects without triggering a sync.
- **Execution**: Fetches all Leads, Trials, and Orders from MongoDB and processes them **sequentially** in a background loop (does not block the HTTP response).

> [!TIP]
> For datasets exceeding ~1,000 records, consider temporarily adding a `sleep(200)` delay between iterations to avoid triggering HubSpot's burst rate limits (150 requests/10 seconds).

## 5. Required HubSpot Custom Properties

Ensure your HubSpot account has the following custom contact properties configured. If a property is missing, the sync will return a `400 Bad Request` for affected records.

| Property Key | Type | Maps From |
| :--- | :--- | :--- |
| `monthly_budget` | Text / Number | `lead.monthlyBudget` |
| `service_interest` | Text | `lead.serviceInterest` / `order.serviceInterest` |
| `trial_status` | Text | `trial.status` |
| `company` | Text (default) | `order.companyName` |

## 6. Troubleshooting Common Failures

| Symptom | Likely Cause | Fix |
| :--- | :--- | :--- |
| `400 Bad Request` from HubSpot | Missing custom property | Add the property in HubSpot → Properties settings |
| `401 Unauthorized` from HubSpot | Expired or invalid access token | Update `hubspot_token` in Admin → Settings |
| Contacts created as duplicates | Email field mismatch (leading/trailing spaces) | Verify email normalization in `getOrCreateUser()` |
| Deals missing contact association | HubSpot association API change | Check `/crm/v4/associations` schema in HubSpot changelog |
| Sync silently skipped | `HUBSPOT_ACCESS_TOKEN` env var not set | Set the token in Admin Settings or in `.env` |
