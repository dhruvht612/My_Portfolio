# CI/CD

GitHub Actions runs the quality gates. Vercel's Git integration does the deploying.
Actions never deploys — it only decides whether a pull request is mergeable.

## Pipeline at a glance

| Workflow | Trigger | Blocks a merge? | What it does |
|---|---|---|---|
| `ci.yml` | PR, push to `main` / `redesign` | Yes, once required | Lint → test → build → bundle budget + secret scan → upload `dist/` |
| `lighthouse.yml` | PR, manual | No | Performance audit; a11y and CLS assert hard, perf warns |
| `audit.yml` | Mondays 06:00 UTC, manual | No | `npm audit --audit-level=high`; opens or comments on a `security` issue |
| Dependabot | Mondays | No | Grouped npm + actions update PRs |

Local equivalents, in the order CI runs them:

```bash
npm ci          # exactly what CI installs with
npm run lint:ci # eslint with the warning ceiling enforced
npm run test:run
npm run build
npm run size    # bundle budgets + service-role key scan
```

## The lint ceiling

`npm run lint` reports; `npm run lint:ci` is the gate and pins `--max-warnings 31`.

There are **0 errors**. The 31 warnings are a deliberate, tracked backlog — see the rule
comments in `eslint.config.js`. Two rules are downgraded to warnings because the code they
flag works and refactoring it is a considered job, not a lint-driven one:

- `react-hooks/set-state-in-effect` — the Landing typing effect, prop→state sync in
  `useActiveSection`, the async Supabase session bootstrap in `useAuth`.
- `react-hooks/purity` — `Date.now()` in elapsed-time labels and one `Math.random()`
  animation delay.

`react-refresh/only-export-components` is a warning only under `src/context/**`,
`src/hooks/**` and `src/components/ui/**`, where exporting a hook beside its provider is
the intended pattern.

**The ceiling is a ratchet.** New code cannot add warnings, and when you clear some, lower
the number in `package.json` so they cannot come back.

## Bundle budgets

`bundle-budget.json` holds gzipped ceilings, seeded from a real build. Only chunks at or
above 10 kB get their own entry — below that the build emits ~100 per-icon chunks of a few
hundred bytes and every added icon would churn the file. `__total__` covers everything in
aggregate. A 5% tolerance absorbs dependency bumps.

**The baseline describes a build made with the Supabase env set**, because that is what
ships. Without it the build is a different artifact, not a smaller one: `isSupabaseConfigured`
folds to a compile-time `false`, `createClient` becomes unreachable, `@supabase/supabase-js`
tree-shakes out, and the chunk graph reshuffles around the gap. Measured on `ee1a19b`:

| | with `.env` | without |
|---|---|---|
| `__total__` | 668,179 B | 597,460 B (−12%) |
| emitted js/css files | 129 | 125 |
| `AdminSystemHealth.js` | 21,374 B | 22,762 B (**+6.5%**) |

So a Supabase-less build reports chunks both under *and over* the baseline, and the ones
over it are not regressions. CI passes `--report-only` when `VITE_SUPABASE_URL` is not
set — true on fork PRs, and on this repo until the secret is added — which downgrades the
budget verdict to a report. The service-role key scan is never advisory and exits 1 either
way. **Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the repo secrets** to have
CI measure, and guard, the artifact that actually ships.

Chunks are keyed by the name Rollup emits before the content hash, and several files can
share one key — the entry chunk and a lazy `index` module both map to `index.js`, as do
lucide's `chevron-down`/`-left`/`-right`. Their sizes are summed.

When growth is intentional, accept the build as the new baseline. Every CI run prints the
block under *Baseline for this build*; copy it into `bundle-budget.json` and commit, or
re-seed locally from a build made with your `.env` present:

```bash
npm run build
npm run size -- --print-seed   # print the block without rewriting anything
npm run size -- --update       # rewrite bundle-budget.json from this build
```

## Secrets

| Name | GitHub | Vercel | Notes |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Secret | Production + Preview | Public by nature; kept secret for hygiene |
| `VITE_SUPABASE_ANON_KEY` | Secret | Production + Preview | Ships in the client bundle by design — RLS is the real protection |
| `SUPABASE_SERVICE_ROLE_KEY` | **Never** | **Never** | Local `.env` only, for `npm run seed` / `verify:phase5`. Bypasses RLS |
| `SUPABASE_DEV_INSECURE_TLS` | **Never** | **Never** | Local antivirus workaround; disables cert verification |

`VITE_APP_VERSION` is set from the commit SHA in CI, so Admin → System Health reports what
is actually deployed.

Fork pull requests do not receive secrets. The build still passes — `PortfolioContext`
falls back to the bundled static slice — it just exercises a different path than
production. Do **not** switch to `pull_request_target` to work around this; that hands repo
secrets to unreviewed code.

## One-time setup

These cannot be done from the repo. Work through them once.

### 1. GitHub secrets
`Settings → Secrets and variables → Actions → New repository secret`

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 2. Vercel
1. Import `dhruvht612/My_Portfolio`. Framework preset **Vite**, Node **22**.
2. `Settings → Environment Variables`: add both `VITE_` values above for **Production**
   and **Preview**.
3. `Settings → Deployment Protection`: turn on **Vercel Authentication** for Preview.
   Preview URLs are public by default and this app serves an admin console at
   `/admin/login` backed by the real database.
4. `vercel.json` in the repo already supplies the SPA rewrite, asset caching and security
   headers — do not duplicate them in the dashboard.

The SPA rewrite matters: without it, refreshing on `/projects` or opening a direct link to
`/admin/login` returns a CDN 404, because no such file exists in `dist/`.

### 3. Branch protection
`Settings → Branches → Add rule` for `main`:

- Require a pull request before merging
- Require status checks to pass → **`Lint, test, build`**
- Require branches to be up to date before merging
- (Optional) Include administrators

### 4. Decide what happens to `redesign`
It is a long-lived branch carrying the whole overhaul, and the longer it runs the worse the
eventual merge gets. Either merge it into `main` once the current phase lands and go back to
short-lived branches, or promote it to a permanent staging branch with its own Vercel
environment. `ci.yml` currently builds on pushes to both.

## Adding tests

`vitest` with jsdom; setup in `src/test/setup.js` stubs `matchMedia`,
`IntersectionObserver`, `ResizeObserver`, `requestIdleCallback` and `scrollTo`, and resets
`localStorage` plus `data-theme` between tests.

Current suites:

| File | Covers |
|---|---|
| `src/lib/portfolioFetchers.test.js` | `normalizeBadge`, `deriveProjectFilters` — the Supabase→UI mapping contract |
| `src/context/ThemeContext.test.jsx` | Theme precedence, persistence, `theme-color` sync, and that `index.html`'s pre-paint script still matches |
| `src/components/Footer.test.jsx` | Footer column grouping, résumé links, badge alt text, social link targets |
| `src/components/Layout.smoke.test.jsx` | App boots; one banner, one contentinfo; theme toggle wired end to end |

On coverage: there is no threshold yet, deliberately. Set one at whatever the suite reports
the day you decide to enforce it, then ratchet. A number picked in advance either blocks
merges or gets lowered until it means nothing.

## Not built yet

- **E2E.** Playwright over nav, theme toggle, contact form and admin login. The natural
  follow-up now that a runner exists.
- **Supabase migrations.** One file in `supabase/migrations/`; applying by hand is still
  correct. Revisit when order and idempotency start to matter.
- **Release tagging.** A portfolio deploys continuously; there is nothing to version.
