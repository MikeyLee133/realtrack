# Deploying RealTrack

RealTrack is a static single-page app (Vite build → `dist/`). It hosts anywhere
that serves static files. Config for the two easiest options is in the repo:
`vercel.json` and `netlify.toml` (both set the build command, output dir, and an
SPA fallback).

You choose the backend at deploy time:

- **Local-first (no env vars)** — data lives in each browser (localStorage +
  IndexedDB). Zero setup; good for a single device.
- **Supabase (two env vars)** — login, per-user isolation, private file storage,
  multi-device. See [SUPABASE.md](SUPABASE.md), then add the env vars below.

## Vercel

1. Push this repo to GitHub/GitLab/Bitbucket.
2. In [vercel.com](https://vercel.com) → **New Project** → import the repo.
   Vercel detects Vite; `vercel.json` handles the rest.
3. *(Supabase only)* Project → **Settings → Environment Variables**, add:
   ```
   VITE_SUPABASE_URL         = https://<your-project>.supabase.co
   VITE_SUPABASE_ANON_KEY    = <your anon public key>
   ```
4. **Deploy.** You get a `*.vercel.app` URL — open it on your phone.

## Netlify

1. Push the repo to a Git host.
2. In [netlify.com](https://netlify.com) → **Add new site → Import**. `netlify.toml`
   sets build command (`npm run build`) + publish dir (`dist`) + SPA fallback.
3. *(Supabase only)* **Site settings → Environment variables**, add the same two
   `VITE_SUPABASE_*` vars.
4. **Deploy.** You get a `*.netlify.app` URL.

## DigitalOcean Droplet (nginx) — subdomain on an existing site

Serve the app under its own subdomain (e.g. `realtrack.mikeylee.io`) on the same
Droplet as your main site. The files and helper live in `deploy/`.

1. **DNS** — add an `A` record: host `realtrack` → your droplet IP
   (`143.198.149.134`). Verify: `dig realtrack.mikeylee.io +short` returns the IP.
2. **Web root** on the droplet: `sudo mkdir -p /var/www/realtrack`
3. **Build + upload** from your machine (edit the vars at the top first):
   ```bash
   ./deploy/deploy-droplet.sh          # runs npm run build + rsync
   ```
4. **Install the nginx site**:
   ```bash
   sudo cp deploy/nginx/realtrack.mikeylee.io.conf /etc/nginx/sites-available/realtrack
   sudo ln -s /etc/nginx/sites-available/realtrack /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```
5. **HTTPS** (Let's Encrypt):
   ```bash
   sudo apt install -y certbot python3-certbot-nginx   # if not already installed
   sudo certbot --nginx -d realtrack.mikeylee.io
   ```
6. Visit **https://realtrack.mikeylee.io**, then link it from your main site:
   `<a href="https://realtrack.mikeylee.io">Construction Tracker</a>`

**Redeploys:** just re-run `./deploy/deploy-droplet.sh`.

> On Apache or Caddy instead of nginx? The static files are identical — only the
> server config differs. The equivalent is a vhost with docroot `/var/www/realtrack`
> and an `index.html` fallback.

## Build it yourself

```bash
npm ci
npm run build        # → dist/
npm run preview      # serve dist/ locally to sanity-check
```

Then upload `dist/` to any static host (S3+CloudFront, GitHub Pages, Cloudflare
Pages, nginx…). Ensure the host **rewrites unknown paths to `/index.html`** (the
SPA fallback) if you later add client-side routes.

## Notes

- Env vars are read at **build time** (Vite inlines `VITE_*`). Changing them
  requires a rebuild/redeploy.
- The `VITE_SUPABASE_ANON_KEY` is a public key and safe to ship; row-level
  security (not the key) is what protects data. Never expose the Supabase
  *service* key in the client.
- Custom domain: add it in the host's dashboard; no app changes needed.
