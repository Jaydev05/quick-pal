# Prepare project files for local run and Hostinger deployment

## Goal

Make the project ready to run on any machine and deploy to Hostinger by adding the missing support files and documenting everything: environment variables, local setup, production build, and Hostinger deployment (VPS and shared hosting).

The app itself is unchanged — this adds dev/deploy tooling and documentation only.

## Files to add / update

1. **`.env.example`** (new)
   - Documented template of every environment variable the app reads:
     `SUPABASE_PROJECT_ID`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and the `VITE_SUPABASE_*` variants (the `VITE_` ones are required for the browser build).
   - Values shown as placeholders with a comment explaining each one is the project's own publishable key from the Lovable Cloud backend (the real values already live in `.env`).
   - Note: `SUPABASE_SERVICE_ROLE_KEY` is **not** available on Lovable Cloud and must not be fabricated — the file will state it is optional/unavailable.

2. **`README.md`** (rewrite, keep repo context)
   - Requirements: Node.js 20.19+ / 22.12+, Bun (recommended, lockfile is `bun.lock`) or npm.
   - Local setup: `bun install` → copy `.env.example` to `.env` (fill real values) → `bun run dev` → http://localhost:3000.
   - Scripts table: `dev`, `build`, `build:dev`, `preview`, `start` (new), `lint`.
   - Admin login note: `jaydevassociates25@gmail.com` password + OTP flow; candidate signup.
   - **Hostinger deployment section** with two paths:
     - **VPS (recommended)**: Node 20+/22 install, clone repo, `bun install`, `bun run build`, PM2 start, Nginx reverse proxy, Let's Encrypt SSL, DNS/domain pointing.
     - **Shared hosting (hPanel Node.js app)**: Node version ≥ 20.19, app root, entry point `.output/server/index.mjs`, `PORT`/`NITRO_PORT` env, upload `.env` and `.output` after building locally.
   - Architecture note: backend/auth/database stay on Lovable Cloud; Hostinger serves only the app frontend/SSR, so all `window.location.origin` redirects keep working on the new domain without code changes.

3. **`ecosystem.config.cjs`** (new) — PM2 config for Hostinger VPS:
   - App name `jaydev-associates`, script `.output/server/index.mjs`, `NITRO_PORT`/`PORT` 3000, one instance, restarts on failure.

4. **`package.json`** (edit) — add `"start": "node .output/server/index.mjs"` and an `engines` field pinning Node `>=20.19`.

5. **`.nvmrc`** (new) — `22` so `nvm use` / `nvm install` picks a compatible Node.

## Out of scope (already answered in chat)

- Hiding the "Edit with Lovable" badge and custom-domain cost: requires an active paid plan (Pro ~$25/month); badge removal is not permanent — it returns if the plan lapses.
- No changes to app code, routes, or database.

## Verification

- `bun run dev` starts on localhost:3000 with no missing-env errors.
- `bun run build` completes and produces `.output/server/index.mjs` (the PM2/start entry).
- README commands are copy-paste accurate against the actual repo.