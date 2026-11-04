# Smart Healthcare - Supabase PostgreSQL migration

This package keeps the React + Express architecture. The backend's database adapter now connects to PostgreSQL through `pg`, while retaining a small compatibility layer for existing MySQL-style `?` placeholders and result handling. This reduces the number of route files that need invasive changes, but runtime tests against your Supabase project are still required.

## 1. Create the database schema

1. Open your Supabase project dashboard.
2. Open **SQL Editor** and create a new query.
3. Paste and run `database/supabase/01_supabase_schema.sql`.
4. Confirm the tables exist under **Table Editor**.

This schema includes the application's existing `bills` table used by the Billing screen, as well as `invoices`/`invoice_items` used by the dashboard and academic database features. The old `database/01_schema.sql` is a MySQL script; do not run that old file in Supabase.

## 2. Configure the backend locally

1. In `backend`, copy `.env.example` to `.env`.
2. In Supabase, open **Project Settings → Database → Connection string**.
3. Choose the Node.js / URI connection string. Prefer the Supabase pooler connection string if your network requires it; copy the URI into `DATABASE_URL` in `backend/.env`.
4. Replace the placeholder with your actual database password locally. Do not paste credentials into chat, commit `.env`, or put a database password/service-role key in the React frontend.
5. Set `JWT_SECRET` to a long, unique random value. Keep `FRONTEND_ORIGIN=http://localhost:5173` for local development.

Example shape only (not real credentials):

`DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres`

## 3. Install and run

In a terminal:

```powershell
cd backend
npm install
npm run check
npm run dev
```

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:4000/api/health`. A successful connection should return JSON with `"status":"ok"` and `"database":"connected"`. If it returns HTTP 503, check `DATABASE_URL`, the password, connection mode, and network access.

## 4. Create the first admin

After schema setup and a successful DB health check:

```powershell
cd backend
node src/create-admin.js
```

Enter the admin name, email, and a strong password when prompted. The script hashes the password before saving it.

## 5. Important notes

- The adapter preserves much of the previous query API; it is not a substitute for integration tests. Check login, doctor registration, appointment CRUD, patient CRUD, dashboard, and billing/payment flows against your actual project.
- The billing UI uses `bills`, while the original SQL schema defines `invoices`; both are retained in the migration so the existing screens and dashboard can continue to use their respective tables.
- The `payments` table supports `bill_id` for the Billing UI and `invoice_id` for invoice records.
- Do not use real patient data while testing. Use fictional demo data only.
- This package does not automatically transfer existing records from MySQL. If you have important MySQL data, export and migrate it separately after making a backup.
