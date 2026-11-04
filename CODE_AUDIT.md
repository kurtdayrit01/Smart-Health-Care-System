# Smart Healthcare Project — Code Audit

## Important status
This copy is **not yet connected to Supabase**. The current backend uses `mysql2/promise` and MySQL-specific SQL. Supabase uses PostgreSQL, so changing environment variables alone will not work. The backend data-access layer and SQL schema must be migrated together.

## Checks performed
- Ran `node --check` against all six backend source files: syntax checks passed.
- Reviewed backend routes and database schema for runtime/schema mismatches.
- Frontend calls `http://localhost:4000/api` directly; it is not configured through a Vite environment variable yet.

## Defects found
1. `backend/src/billing.js`: payment processing referenced `bill.total_amount` without assigning `bill` from the fetched query row. Fixed in this copy by assigning `const bill = rows[0]`.
2. Billing routes query `bills` and `payments.bill_id`, while `database/01_schema.sql` defines `invoices` and `payments.invoice_id`. Billing endpoints will fail against the supplied schema unless the data model is reconciled.
3. Billing endpoints have no authentication middleware, unlike appointment routes. This is unsafe for patient/billing data and should be fixed before deployment.
4. Existing SQL uses MySQL placeholders (`?`), MySQL-specific aggregate expressions, `AUTO_INCREMENT`, `ENUM`, and MySQL transaction/result conventions. These are incompatible with Supabase/PostgreSQL without conversion.
5. The supplied archive contained a backend `.env` file. It has intentionally been excluded from this cleaned copy so secrets are not redistributed. Keep credentials in your local ignored `.env` file only.

## Safe next steps to connect Supabase
1. Create a Supabase project.
2. Migrate the schema and seed data to PostgreSQL, resolving the `bills` vs `invoices` naming conflict.
3. Replace the MySQL pool and all route queries with PostgreSQL/Supabase-compatible access.
4. Add server-side authorization for billing routes and configure Row Level Security if the frontend accesses Supabase directly.
5. Set local environment variables privately, then run integration tests against your own Supabase project.

## Important
No live Supabase credentials were supplied, so a live connection or database integration test could not be performed. Do not paste a `service_role` key into chat or frontend code. Keep it server-side in your local `.env`.
