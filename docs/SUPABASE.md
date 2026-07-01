# Supabase backend — setup

The app runs on browser `localStorage` by default (no account, no network).
Configuring Supabase switches it to a real backend that satisfies the privacy
requirements (HANDOFF §1): **login required, per-user data isolation via
Row-Level Security, and private file storage**. The switch is two env vars —
no code changes ([ADR-0009](adr/0009-supabase-backend-scaffold.md)).

## What's already in the repo

- `supabase/migrations/0001_initial_schema.sql` — tables (`projects`, `tasks`,
  `documents`, `schedule_phases`, `budget_categories`, `vendors`) with
  `owner_id default auth.uid()` + `project_id`, and RLS policies scoping every
  row to its owner.
- `supabase/migrations/0002_storage.sql` — a private `files` bucket + policies.
- `src/lib/supabaseClient.js`, `supabaseRepository.js`, `auth.js` — the client,
  the async repository implementation, and auth helpers.
- `src/lib/backend.js` — selects localStorage vs Supabase from the env.
- `src/components/Login.jsx` + the `AuthGate` in `App.jsx` — email/password
  login, shown only when Supabase is configured.

## Steps to go live

1. **Create a Supabase project** at [supabase.com](https://supabase.com) (the
   free tier is enough for one user).
2. **Run the migrations.** In the dashboard, open **SQL Editor** and run the
   contents of `supabase/migrations/0001_initial_schema.sql`, then
   `0002_storage.sql`. (Or, with the Supabase CLI: `supabase db push`.)
3. **Configure env.** Copy `.env.example` to `.env` and fill in from
   **Project Settings → API**:
   ```
   VITE_SUPABASE_URL=https://<your-project>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your anon public key>
   ```
4. **Auth settings.** Email/password is enabled by default. For quick local
   testing you may turn **off** "Confirm email" (Authentication → Providers →
   Email); leave it on for production.
5. **Restart `npm run dev`.** The app now shows a login screen; create an
   account and your projects are private to it.

## How isolation works

Every table has `owner_id uuid default auth.uid()` and an RLS policy
`using (owner_id = auth.uid()) with check (owner_id = auth.uid())`. The client
never sets `owner_id` — the database stamps it — and no query can read or write
another user's rows. Files in the `files` bucket are likewise restricted to the
owning project's user and served via short-lived signed URLs.

## What still needs wiring (not blocking)

- **File uploads are wired** via `src/lib/fileStore.js` — photos and document
  attachments go to the private `files` bucket (signed URLs) in Supabase mode,
  or IndexedDB locally ([ADR-0010](adr/0010-file-storage-uploads.md)). Files are
  not yet purged when a record/project is deleted.
- **Magic-link auth** (currently email/password) — a small addition to
  `auth.js` + `Login.jsx` if preferred.

See [ROADMAP.md](ROADMAP.md) for where this sits.
