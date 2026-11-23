# Expense Tracker

A simple, modern expense-tracking dashboard with a soft pastel design. Works on desktop, tablet and phone, in light and dark mode.

> **Status:** Phase 0 (foundation). Sign-up, login and the dashboard layout are in place; adding and charting expenses arrives in Phase 1. See the [roadmap](#roadmap).

## Tech stack

| Layer    | Tools                                                                 |
| -------- | --------------------------------------------------------------------- |
| Frontend | React 19, TypeScript, Vite, React Router                              |
| Styling  | Tailwind CSS v4 with a custom pastel design-token theme, Lucide icons |
| Backend  | Supabase (Postgres, Auth, Row-Level Security)                         |
| Testing  | Vitest + Testing Library (UI), PGlite (database security tests)       |
| Quality  | TypeScript strict checks, Oxlint, Prettier, GitHub Actions CI         |
| Hosting  | Vercel                                                                |

## Features (so far)

- Email sign-up and sign-in with email confirmation
- Protected routes: signed-out visitors are sent to the login page
- Responsive app shell: sidebar on desktop, bottom navigation on mobile
- Light/dark mode that follows the system setting and remembers your choice
- Database schema for categories, expenses and monthly budgets
- Every new user gets 10 starter categories automatically
- Row-Level Security: each user can only read and change their own data, verified by automated tests

## Project structure

```
src/
  auth/         Auth context, provider and route guard
  components/   App shell, logo, theme toggle, UI primitives (Button, Card, Input…)
  config/       App name and defaults (change the product name here)
  lib/          Supabase client, formatting helpers
  pages/        Login, Dashboard, 404
  theme/        Light/dark theme provider
supabase/
  migrations/   SQL to create tables, security policies and triggers
scripts/
  test-db.mjs   Runs the migration in an in-memory Postgres and checks data isolation
```

## Getting started (local)

Requires **Node.js 20+**.

```bash
git clone https://github.com/ravispatel303/expense-tracker.git
cd expense-tracker
npm install
cp .env.example .env    # then fill in your Supabase URL and anon key
npm run dev             # http://localhost:5173
```

Without a `.env` file the app still runs and shows a setup notice on the login page.

### Scripts

| Command           | What it does                                        |
| ----------------- | --------------------------------------------------- |
| `npm run dev`     | Start the dev server                                |
| `npm run build`   | Type-check and build for production                 |
| `npm test`        | Run UI and unit tests                               |
| `npm run test:db` | Run database migration and Row-Level Security tests |
| `npm run lint`    | Lint with Oxlint                                    |
| `npm run format`  | Format with Prettier                                |

## Deploying

### 1. Set up Supabase (one time)

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**, paste the contents of `supabase/migrations/0001_initial_schema.sql` and click **Run**.
3. Open **Authentication → URL Configuration** and set **Site URL** to your Vercel URL (e.g. `https://expense-tracker-xyz.vercel.app`) so confirmation emails link back to your app.
4. Copy the **Project URL** and **anon public key** from **Project Settings → API**.

> Never expose the `service_role` key or the database password. They are not needed by this app.

### 2. Deploy to Vercel

1. In [Vercel](https://vercel.com), click **Add New → Project** and import this repository.
2. Vercel detects Vite automatically. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = your Project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon public key
3. Click **Deploy**. Every merge to `main` redeploys automatically, and every pull request gets a preview URL.

## Roadmap

- [x] **Phase 0:** Project foundation, design system, auth, database schema, CI
- [ ] **Phase 1:** Add/edit/delete expenses, categories, dashboard charts, monthly budgets
- [ ] **Phase 2:** CSV import/export, recurring expenses, installable PWA, launch
- [ ] **Phase 3:** User feedback and validation
- [ ] **Phase 4:** iOS and Android apps (React Native + Expo)
- [ ] **Phase 5:** Pro features

## License

© 2026 Ravi Patel. All rights reserved. The source is public for viewing; no license is granted to copy, modify or distribute it.
