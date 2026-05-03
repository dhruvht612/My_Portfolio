# Phase 5 — Runbook (seed + assets + verify)

Run these on your machine from the repo root (with `.env` containing `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`).

## 1. Schema fix-up

If `certifications.image_url` might be missing, run **once** in Supabase → SQL → New query:

- Paste contents of [migrations/add_certifications_image_url.sql](migrations/add_certifications_image_url.sql)

Or, if you use Supabase CLI with migrations: the same SQL is in `supabase/migrations/20250503190000_add_certifications_image_url.sql` (add a `config.toml` via `supabase init` before `supabase db push`).

Confirm Storage buckets exist: `logos`, `cert-images`, `project-images`, `blog-images`, `resumes` (from your main setup script).

## 2. Seed all tables from `src/data`

```bash
npm run seed
```

**Warning:** This deletes and re-inserts portfolio rows in `profile`, `education`, `goals`, `beyond_stats`, `skill_groups`, `skills`, `projects`, `experiences`, `certifications`. It does **not** touch `blog_posts`, `contact_submissions`, or `page_views`.

## 3. Upload logos and link URLs

Place image files under `src/assets/` (same filenames as in `src/constants/media.js`, e.g. `ontariotechu_logo.png`). Then:

```bash
npm run migrate-assets
```

This uploads each image to the `logos` bucket and updates `education.logo_url`, matching `experiences.logo_url`, and `certifications.image_url` where issuer/org maps to a known file.

## 4. Automated checks

```bash
npm run verify:phase5
```

Expect non-zero counts after a successful seed. If `certifications.image_url` fails, apply step 1.

### If you see `fetch failed` or `TypeError: fetch failed`

Scripts now hit `https://YOUR-REF.supabase.co/auth/v1/health` first and print a clearer error chain.

- **`VITE_SUPABASE_URL`** must be the **project root** only, e.g. `https://alihfrpmyzirxohulhuw.supabase.co` — **not** `.../rest/v1/` (that suffix is stripped automatically, but fixing `.env` avoids confusion).
- **VPN / corporate proxy / firewall** can block Node’s HTTPS. Try off-VPN or another network.
- **Windows DNS (IPv6):** in the same PowerShell session run:
  `set NODE_OPTIONS=--dns-result-order=ipv4first`
  then `npm run verify:phase5` again.
- **Sanity check:**
  `Invoke-WebRequest -Uri "https://YOUR-REF.supabase.co/auth/v1/health" -UseBasicParsing`
  should return status 200.

### If you see `UNABLE_TO_VERIFY_LEAF_SIGNATURE` or “unable to verify the first certificate”

Node is rejecting the TLS certificate chain. Supabase’s real cert is fine; this usually means **HTTPS inspection** (antivirus, school/work proxy, some VPNs) replaced the certificate with one Windows trusts but Node does not.

1. **Preferred:** Export the inspecting root CA as a `.pem` file, then in the same PowerShell session before `npm run …`:

   `set NODE_EXTRA_CA_CERTS=C:\path\to\root.pem`

2. Temporarily turn off **HTTPS scanning** in the antivirus UI (only if your policy allows).

3. **Update Node.js** to the current LTS.

4. If `Invoke-WebRequest` succeeds but Node still fails, (1) is the correct long-term fix.

Avoid `NODE_TLS_REJECT_UNAUTHORIZED=0` except as a short-lived local experiment; it disables TLS verification entirely.

**Repo shortcut:** set `SUPABASE_DEV_INSECURE_TLS=1` in `.env` (see `.env.example`). The seed, `verify:phase5`, and `migrate-assets` scripts read it and skip TLS verification **for that Node process only** — not for the Vite browser app. Remove it when you no longer need it (or when you fix trust with `NODE_EXTRA_CA_CERTS`).

## 5. Manual verification (11.3)

- Browse the public site (all main sections).
- Open `/dev/supabase` and confirm the portfolio probe succeeds.
- Open `/admin` — data appears in Profile, Education, Experiences, Projects, Skills, Certifications.
- Edit a project title, refresh `/projects`.
- Delete a certification, refresh `/certifications`.
