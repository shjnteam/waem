# وائم — P0 Subscription Administration API

A **development starter**, not a production-ready financial or tax system.

## Start
1. Create a PostgreSQL database named `waem`.
2. Run `psql "$DATABASE_URL" -f schema.sql`.
3. `cp .env.example .env` and set real `DATABASE_URL` and a strong `ADMIN_API_KEY`.
4. `npm install && npm test && npm run dev`.
5. Send header `x-admin-api-key` to all `/api` endpoints.

## API
- `GET /api/dashboard`
- `GET,POST /api/tenants`
- `GET,POST /api/plans`
- `GET,POST /api/subscriptions`
- `POST /api/subscriptions/:id/status`
- `GET,POST /api/invoices`
- `GET /api/payments`, `POST /api/payments/manual`
- `GET /api/reminders`, `GET /api/audit`

Money is stored as integer minor units (halalas). Invoice amount is currently the plan's **untaxed** snapshot price; VAT/ZATCA invoice requirements are NOT implemented. Payment endpoint is **manual recording only**, not a payment gateway. Reminder records are scheduled but no delivery worker is implemented. Admin API key is a temporary development control, NOT RBAC/MFA. The dashboard reads actual database rows; there are no fabricated KPIs.

## Production blockers
RBAC/MFA and tenant-scoped authorization, VAT rules and compliant invoicing, subscription billing period uniqueness, proration and renewals, payment provider webhooks with verified signatures, real notifications and retries, proper sequential invoice numbering, credit notes/refunds, immutable audit, rate limiting, secrets management, data retention/PDPL, automated DB integration tests, backups, monitoring, and security review. No deployment or provider integration is claimed.
