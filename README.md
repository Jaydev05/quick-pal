# Jaydev Associates — Recruitment Portal

Full-stack recruitment portal for Jaydev Associates: public marketing pages, job listings, candidate signup & applications, candidate dashboard, and a secure admin panel. Built with TanStack Start (React 19), Tailwind CSS v4, and Lovable Cloud (backend, auth, database).

**Live app**: https://quik-connect-buddy.lovable.app

---

## Requirements

| Tool | Version | Why |
|---|---|---|
| **Node.js** | 20.19+ (22.12+ recommended) | Required by Vite 8 / TanStack Start |
| **Bun** | 1.1+ (recommended) | Project lockfile is `bun.lock` — exact installs |
| npm | 9+ (alternative) | Works, but versions may resolve slightly differently |

`.nvmrc` pins Node 22 — run `nvm use` (or `nvm install`) in the project root.

## Local setup

```sh
# 1. Install dependencies
bun install
# or: npm install

# 2. Create environment file
cp .env.example .env
# → fill in the real backend values (see .env in this repo / Lovable Cloud)

# 3. Start the dev server
bun run dev
# → http://localhost:3000
```

> The `VITE_SUPABASE_*` variables are required — the browser build inlines them.
> `SUPABASE_SERVICE_ROLE_KEY` is NOT available on Lovable Cloud; it is optional and only used for privileged server-side operations on a self-hosted backend.

## Scripts

| Command | Description |
|---|---|
| `bun run dev` | Dev server with HMR on http://localhost:3000 |
| `bun run build` | Production build → `.output/` |
| `bun run build:dev` | Development-mode build |
| `bun run preview` | Serve the production build locally |
| `bun run start` | Run the built app (`node .output/server/index.mjs`) |
| `bun run lint` | ESLint |
| `bun run format` | Prettier |

## Admin & candidate accounts

- **Admin login**: `/auth` — email `jaydevassociates25@gmail.com`, then password + one-time email code. Only this single admin account exists; new admins cannot be created from the UI.
- **Candidate signup**: `/login` — candidates create an account, confirm their email, then apply to jobs. Applications appear in the admin panel.

## Deploying to Hostinger

The backend (auth, database, storage) stays on **Lovable Cloud** — Hostinger serves only the app itself (SSR frontend). All auth redirects use `window.location.origin`, so they keep working on your own domain with **no code changes**.

### Option A — Hostinger VPS (recommended)

A VPS gives you full control (Node version, PM2, Nginx, SSL).

```sh
# 1. Server prep (Ubuntu/Debian, as root)
curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt-get install -y nodejs nginx
npm install -g bun pm2

# 2. Get the code
git clone https://github.com/Jaydev05/quik-connect-buddy.git /var/www/jaydev
cd /var/www/jaydev

# 3. Install + configure
bun install
cp .env.example .env        # → fill in real backend values
bun run build               # → produces .output/

# 4. Start with PM2
pm2 start ecosystem.config.cjs
pm2 save && pm2 startup     # auto-start on reboot
```

Then configure Nginx as a reverse proxy (replace `yourdomain.com`):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```sh
nginx -t && systemctl reload nginx
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com -d www.yourdomain.com   # free SSL
```

Point your domain's DNS (A record `@` and `www`) at the VPS IP, then done.

### Option B — Hostinger shared hosting (hPanel Node.js app)

Builds locally and uploads the result (no SSH server access needed):

```sh
# On your machine:
bun install && bun run build     # → .output/ folder
```

In **hPanel → Websites → Manage → Node.js** (or Hostinger's Node.js app setup):
1. Node.js version: **20.19 or newer**.
2. Application root: the folder where you uploaded the project files.
3. Entry point: `.output/server/index.mjs`.
4. Environment variables: add every key from `.env` (including all `VITE_SUPABASE_*`).
5. Create the app, then point your domain to the app in hPanel.

Hostinger restarts the Node process automatically; the app listens on the port Hostinger assigns via `PORT`/`NITRO_PORT`.

> **Note**: shared hosting is workable but less flexible than a VPS (no PM2, restart controls, or custom Nginx). For a production site with a custom domain, the VPS option is strongly recommended.

### After deploying

- Test: public pages, job listing, candidate signup/apply, and `/auth` admin login (password + email OTP).
- The first deployment of frontend changes requires re-running `bun run build` and restarting the app (`pm2 restart jaydev-associates` on VPS).
- Backend changes (database, auth settings) deploy to Lovable Cloud automatically.

## Project structure

```
src/
├── components/      # UI: brand, jobs, layout
├── hooks/           # useAuth, use-mobile
├── integrations/    # Lovable Cloud / Supabase clients
├── lib/             # site config, API helpers, formatting
└── routes/          # TanStack Router routes (public, auth, dashboard, admin)
```

## Build with Lovable

This project was built with [Lovable](https://lovable.dev). Continue developing it in the [Lovable editor](https://lovable.dev/projects/ee44d698-daa1-4213-8e3a-f18dd548e6a0) — every change syncs to this repository.