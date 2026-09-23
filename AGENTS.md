# AGENTS.md

## Quick commands

```bash
npm run dev          # Vite dev server (http://localhost:5173)
npm run lint         # ESLint (all files)
npm run lint:ci      # ESLint with --max-warnings 31 (CI gate — warning count is pinned)
npm run test:run     # Vitest single run (no watch)
npm run test         # Vitest in watch mode
npm run build        # Production build → dist/
npm run size         # Bundle budget check + secret scan (requires dist/)
```

CI order: `lint:ci → test:run → build → size`. All must pass.

## Node & tooling

- **Node 22** (`.nvmrc`). CI uses `node-version-file: .nvmrc`.
- Path alias: `@/` → `src/` (configured in both `vite.config.js` and `jsconfig.json`).
- ESLint 9 flat config (`eslint.config.js`). Only `jsx-uses-vars` is enabled from `eslint-plugin-react` — not the full recommended set.
- `no-unused-vars` ignores `^[A-Z_]` vars and `^_|^[A-Z]` args. This is intentional.
- `react-refresh/only-export-components` is warned (not errored) for `src/context/`, `src/hooks/`, and `src/components/ui/`.
- Tailwind 3 with custom "Orbital" design tokens in `src/styles/tokens.css`. Dark mode is default; light via `[data-theme="light"]`.

## Testing

- **Vitest** + jsdom + `@testing-library/react`. Setup: `src/test/setup.js`.
- Tests are `*.test.jsx` / `*.smoke.test.jsx` co-located with source (6 test files total).
- Global timeout: 20s (smoke tests mount the full app shell with providers + router).
- jsdom lacks `matchMedia`, `IntersectionObserver`, `ResizeObserver`, `requestIdleCallback` — all polyfilled in setup.
- `window.scrollTo` is stubbed (jsdom throws "Not implemented").
- Run a single test: `npx vitest run src/components/Header.test.jsx`

## Architecture

**Single-page app** (React 19, React Router 7, Vite 7). No monorepo.

```
src/
├── main.jsx              # Entry — imports styles in order: fonts → tokens → base → index.css → interactions
├── App.jsx               # Router, providers, lazy-loaded pages
├── components/           # Public components + admin primitives + ui kit
├── pages/                # Route pages (public + admin/)
├── hooks/                # Auth, CRUD, Supabase queries, analytics
├── context/              # PortfolioContext (data layer), ThemeContext
├── lib/                  # supabase.js client, admin queries/storage, utils
├── schemas/              # Zod schemas (mirror admin forms)
├── data/                 # Static fallback content (about, projects, skills, etc.)
├── scripts/              # Node scripts: seed, migrate-assets, verify:phase5
├── constants/            # Routes, nav config, animation variants
├── styles/               # tokens.css, base.css, fonts.css, interactions.css
└── test/                 # setup.js
```

### Data flow

`PortfolioContext` is the central data provider. It tries Supabase first; falls back to `src/data/*` when env vars are missing or the fetch fails. The `__source` field on context tells you which path was taken (`'supabase'` | `'fallback'` | `'pending'`).

Admin pages use `useAdminCrud` hook for generic table + insert/update/delete patterns against Supabase tables.

### CSS load order matters

`main.jsx` imports styles as: `fonts.css → tokens.css → base.css → index.css → interactions.css`. The `tokens.css` file defines the Orbital design system variables (`--void`, `--signal`, `--surface`, etc.) and remaps legacy `--color-*` names. Changing this order breaks theming.

### Admin console

- Admin routes (`/admin/*`) are auth-gated via `ProtectedRoute` → `useAuth()`.
- Admin is dark-only (`.admin-scope` class forces dark palette regardless of public theme).
- Reusable admin primitives live in `src/components/admin/`: `AdminForm`, `AdminFormWizard`, `DataTable`, `MarkdownEditor`, `ImageUploader`, `TagInput`, `ConfirmDialog`, etc.
- Zod schemas in `src/schemas/` mirror admin forms. Update schema + form together.

## Bundle budget

`bundle-budget.json` holds gzipped byte ceilings per chunk (with 5% tolerance). The `scripts/check-bundle-size.mjs` script:
- Scans `dist/` for a leaked Supabase service-role key (hard fail if found).
- Compares chunk sizes against budgets. New chunks are reported but not blocked.
- Use `npm run size -- --update` to re-seed after intended growth.
- Use `npm run size -- --report-only` for builds without Supabase env (different chunk graph).

## Environment

- Copy `.env.example` to `.env.local`. Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are needed for local dev.
- `SUPABASE_SERVICE_ROLE_KEY` is for Node scripts only (`src/scripts/`). Never bundle it.
- `SUPABASE_DEV_INSECURE_TLS=1` works around antivirus HTTPS interception on Windows. Never set in CI/prod.
- Vercel production build hard-fails if `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` is missing.

## Gotchas

- `src/main.jsx` is excluded from coverage and is just the React root mount — no logic to test there.
- The `@vercel/analytics` import uses `/react` entrypoint, not `/next` (would pull `next/navigation` which doesn't exist here).
- Lighthouse config (`lighthouserc.json`) asserts: accessibility ≥ 0.95, CLS ≤ 0.1 (both errors), performance ≥ 0.5 (warn).
- `vercel.json` has SPA rewrite `/(.*) → /index.html` — required for client-side routing in production.
- Dev-only routes (`/dev/supabase`, `/styleguide`) are gated behind `import.meta.env.DEV`.
- Fork PRs don't receive secrets. The build still succeeds (falls back to static data) but produces a different artifact for budget comparison.
