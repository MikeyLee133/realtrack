# ADR-0015: Static SPA deployment

- **Status:** Accepted (config ready; go-live needs a host account)
- **Date:** 2026-07-01

## Context

The app was complete but only ran on `localhost` — so the mobile layout
(ADR-0014) and everything else weren't actually usable in the field. It needs to
be hosted. It's a Vite single-page app with no server component (the backend is
either the browser or Supabase-as-a-service), so it can deploy as pure static
files.

Hosting requires the owner's account (Vercel/Netlify), but the config and docs
can be prepared credential-free.

## Decision

Ship **host-neutral static-deploy config** and a guide, keeping localStorage the
zero-config default and Supabase a build-time env-var switch:

- `vercel.json` and `netlify.toml` — build command (`npm run build`), output
  (`dist/`), and an **SPA fallback** (rewrite unknown paths → `/index.html`).
- `docs/DEPLOY.md` — Vercel, Netlify, and self-host steps, plus where to set the
  `VITE_SUPABASE_*` env vars.

Env vars are read at build time (Vite inlines `VITE_*`), so the backend is chosen
per deployment, not at runtime.

## Consequences

- ✅ A few clicks from a real URL that works on a phone — which is what makes the
  responsive + upload + backup work pay off.
- ✅ Same artifact deploys local-first or Supabase-backed; only env vars differ.
- ✅ The SPA fallback future-proofs deep links if client routing is added.
- ⚠️ `VITE_*` are build-time — changing the backend means a redeploy (fine).
- ⚠️ The bundle imports `@supabase/supabase-js` even in local mode (~118 KB gz);
  lazy-loading it when unconfigured is a possible optimization, not done here.
- ⚠️ Not verified against a live host account (needs credentials); the production
  build + `preview` were smoke-tested locally.
