# HubSpot CRM Synchronization: Marketer Pro Guide

This guide is intended for developers and CRM managers who need to maintain or extend the HubSpot synchronization logic within the Marketer Pro platform.

## 1. System Overview

The synchronization service (`api/_server/hubspot.ts`) is designed for unidirectional data flow from the Marketer Pro platform to HubSpot CRM. It manages three primary business objects: Leads, Strategy Calls (Trials), and Service Orders.

### Design Goals
- **Consistency**: Keep HubSpot records up-to-date with every web-side conversion.
- **Resilience**: Ensure that a failed CRM sync doesn't block the user's web experience.
- **De-duplication**: Match existing contacts by email to prevent record bloat.

## 2. Synchronization Logic

### Data Object Mapping
- **Leads**: Synced as HubSpot **Contacts** with `lifecyclestage: lead`.
- **Strategy Calls**: Synced as HubSpot **Contacts** with `lifecyclestage: opportunity`.
- **Orders**: A dual-object sync.
  1. Creates or updates the **Contact**.
  2. Creates a **Deal** with the calculated revenue.
  3. **Associates** the Deal with the Contact using HubSpot's association API.

### Identity Management
The system prioritizes the `email` as the unique identifier.
- **Search First**: Before pushing data, we perform a POST search against `/contacts/search`.
- **Patch/Post**: If a contact ID is found, we use a `PATCH` request; otherwise, we use `POST` to create a new entry.

## 3. Handling API Errors & Rate Limits

HubSpot's API has strict rate limits. Our implementation handles these via:
- **Token Caching**: We cache the HubSpot Access Token in memory for 60 seconds to avoid repeated database lookups during bulk operations.
- **Non-Blocking Execution**: Almost all sync calls are executed as background promises that do not await their response before returning a 200 OK to the client.
- **Robustness**: If a sync fails (e.g., due to a deleted HubSpot property), the error is logged to the server console, but the system continues processing other records.

## 4. Bulk Syncing

For historical data migration or recovery, we provide a bulk sync tool.
- **Endpoint**: `/api/admin/hubspot/sync-all` (POST, Admin-only).
- **Execution**: Fetches all Leads, Trials, and Orders from MongoDB and processes them sequentially in a background loop.
- **Scaling Note**: For datasets larger than 1,000 records, consider adding a delay (sleep) between batch iterations to avoid HubSpot's burst rate limits.

## 5. Maintenance & Troubleshooting

### Common Failure Points
- **Property Mismatch**: If you add a new field to the `Lead` schema on the web, you must ensure a corresponding property exists in HubSpot, or the sync will return a 400 Bad Request.
- **Expired Token**: Ensure the `HUBSPOT_ACCESS_TOKEN` in the admin settings is periodically updated if using developer app credentials.

### Required HubSpot Properties
Ensure your HubSpot account has the following custom properties (or their defaults) configured:
- `monthly_budget`: (Text/Number)
- `service_interest`: (Text)
- `trial_status`: (Text)
- `company`: (Text, default)
