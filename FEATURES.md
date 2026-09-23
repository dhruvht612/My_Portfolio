# Feature Inventory — Portfolio & Admin CMS

Based on the current repo state (React 19, Vite 7, Tailwind 3, Supabase, React Router 7, Framer Motion). Status: **Admin CMS mostly implemented**, **public blog & real-time features pending**.

---

## 🎯 Admin Console — Already Implemented

### Authentication & Layout
- **Email/password login** (`/admin/login`) — Supabase Auth, session persistence, logout
- **Protected routes** — `ProtectedRoute` wrapper guards all `/admin/*` except login
- **Dark-only admin scope** — `.admin-scope` forces dark palette regardless of public theme
- **Collapsible sidebar** — Navigation with Lucide icons, mobile drawer, active route highlighting
- **Admin header** — Page title, user avatar/name, logout button
- **Command palette** (`⌘K`) — Fuzzy search across admin pages, actions, and shortcuts
- **Keyboard shortcuts overlay** (`?`) — Discoverable hotkeys for power users

### Dashboard (`/admin`)
- **Completion score (0–100)** — Weighted across projects, certs, skills, experiences, blog, inbox
- **Health metrics** — Completion, momentum, freshness, visibility with letter grade (S → B-)
- **AI insights** — Auto-generated from traffic, tech tags, inbox state, draft vs. published ratio
- **Productivity radar** — Focus recommendation, streak detection, backlog awareness
- **Traffic sparklines** — 14-day visit trend per stat card
- **Reorderable sections** — Drag-to-reorder dashboard panels (persisted in localStorage)
- **Quick dock** — One-click jumps to Projects, Blog, Messages, Analytics, Settings
- **Live stats cards** — Projects, Certifications, Blog (draft/published), Unread messages with ring progress
- **Auto-refresh** — 2-minute polling when tab visible

### Projects CRUD (`/admin/projects`)
- **Holographic live preview** — Real-time card render inside the form modal (uses actual `HolographicCard` component)
- **Multi-step wizard** — Core info → Media & links → Metadata/Tags → Review & publish
- **Image upload** — Supabase Storage (`project-images` bucket) with progress, preview, public URL
- **Badge system** — "Featured", "New", custom labels with gradient presets
- **Category filters** — Auto-suggested from existing project categories
- **Tech stack tags** — Free-form tag input with typeahead suggestions
- **Feature bullets** — Dynamic array field (add/remove/reorder)
- **Status toggles** — Featured / Disabled (in development) flags
- **Display ordering** — Manual sort with up/down controls in table view
- **Bulk actions** — Edit, delete (with confirmation), toggle featured from table row menu

### Blog CRUD (`/admin/blog` + `/admin/blog/new|edit/:id`)
- **Draft / Published workflow** — Status toggle sets `published_at` timestamp
- **Auto-slug generation** — Title → slug on blur, uniqueness enforced server-side
- **Markdown editor** — Split-pane (editor/preview), GitHub-flavored markdown via `remark-gfm`
- **Cover image upload** — `blog-images` bucket
- **Tag input** — Free-form tags with comma/Enter separation
- **Auto-save draft** — Every 30s when tab visible (existing posts only)
- **Filter table** — All / Draft / Published segmented control
- **Row actions** — Edit, Publish/Unpublish, Delete

### Skills CRUD (`/admin/skills`)
- **Two-tab workspace** — Skill Groups (domains) ↔ Individual Skills
- **Proficiency slider** — 0–100 with percentage display
- **Group → Skill hierarchy** — Cascade delete (group deletion removes child skills)
- **Project linkage** — Optional `related_project_id` FK for skill-to-project mapping in modals
- **Detail lines** — Dynamic array for contextual skill notes
- **Level label** — Free text (e.g., "Advanced", "Expert")
- **Icon picker** — Font Awesome class input with suggestions

### Certifications CRUD (`/admin/certifications`)
- **Full metadata** — Title, issuer, date, credential ID/URL, tags, category
- **Featured flag** — Highlight in public "featured" section
- **Learned / Applied / Applied-project** — Narrative fields for portfolio depth
- **Badge image upload** — `cert-images` bucket

### Experience CRUD (`/admin/experiences`)
- **Organization grouping** — Auto-groups rows by `organization` for timeline rendering
- **Rich role details** — Subtitle, employment type, date range, location, work mode (Remote/Hybrid/On-site)
- **Accomplishment bullets** — Dynamic array
- **Skills used** — Tag input
- **Logo upload** — `logos` bucket
- **Featured flag** — Promote specific roles

### Education (`/admin/education`)
- **Single-row UPSERT** — Institution, degree, logo, progress %, focus areas, highlights (icon+title+description array), active flag

### Profile (`/admin/profile`)
- **Identity workspace** — Full name, typed roles (dynamic array), bio story (paragraph array)
- **Interests & Fun facts** — Structured arrays (`{icon, title, copy}` / `{emoji, title, copy}`)
- **Social links** — GitHub, LinkedIn, Instagram, Email
- **Resume upload** — `resumes` bucket (PDF)
- **Footer badges** — Array of shield.io URLs

### Messages (`/admin/messages`)
- **Contact submissions mirror** — Dual-written from public contact form (Formspree + Supabase)
- **Thread detail panel** — Click row to expand full message
- **Read/Unread toggle** — Checkbox/button per message
- **Filter & search** — All/Unread/Read segmented + free-text search across name/email/message
- **Delete with confirmation**

### Analytics (`/admin/analytics`)
- **Top stats row** — Total visits, Unique visitors, Engagement score, Avg session (all with % delta vs prior window)
- **Real-time signal** — Live visitors in last 5 min, CTR, Bounce, Conversion, Avg/day
- **Timeline intelligence** — Area chart (visits/unique/clicks) with metric selector, 7/14/30/90 day ranges
- **AI analytics copilot** — Heuristic insights regenerated on demand (traffic sources, top project, engagement trend)
- **Traffic sources** — Donut chart (direct, LinkedIn, GitHub, Google, other)
- **Top content** — Horizontal bar chart (most visited paths)
- **Project click intelligence** — Bar chart of project CTA clicks → links to project admin
- **Device intelligence** — Animated progress bars per device type
- **Live activity stream** — Terminal-style feed of last 12 events (path, source, device, project click flag)
- **Auto-refresh** — 60s when tab visible, manual refresh button
- **Privacy note** — Cookieless, no PII, localStorage visitor ID only

### System Health (`/admin/system-health`)
- **Frontend probe** — Self-ping with latency badge
- **Supabase probe** — Auth + DB + Storage connectivity checks
- **API probe** — Optional `VITE_API_URL` health check
- **Build info** — `VITE_APP_VERSION` (git SHA), Vercel deployment metadata

### CI/CD Observability (`/admin/cicd`)
- **GitHub Actions status** — Workflow runs, conclusions, timing
- **Vercel deployments** — Preview/production URLs, build logs, status
- **Supabase metrics** — DB size, API requests, auth users (if exposed)

### Logs (`/admin/logs`)
- **Structured log viewer** — Filter by level, search, time range
- **Export** — Copy JSON, download `.ndjson`

### Notifications (`/admin/notifications`)
- **Toast host** — Global success/error/info toasts with auto-dismiss
- **In-app notification center** — Persistent list with read/unread, actions

### Settings (`/admin/settings`)
- **Theme toggle** — Public site light/dark (persisted to `localStorage`, synced to `<html data-theme>`)
- **Analytics opt-in/out** — Toggle `usePageView` tracking
- **Admin preferences** — Density, sidebar collapse, shortcut hints

---

## 🌐 Public Portfolio — Already Implemented

### Core Pages
| Route | Component | Key Features |
|-------|-----------|--------------|
| `/` | `LandingRoute` | Hero with typing roles, stats, socials, animated background |
| `/home` | `HomePage` | Animated sections, featured project, beyond stats, goals |
| `/about` | `AboutPage` | Tabbed bio (Story, Interests, Fun Facts), counters, skills summary |
| `/projects` | `ProjectsPage` | Filterable grid, search, featured spotlight, holographic cards, parallax tilt, project modal with full case study |
| `/beyond` | `BeyondPage` | Stats, goals (short/long term with progress), focus areas |
| `/experience` | `ExperiencePage` | Timeline grouped by org, expandable roles, logos, bullets, skills used |
| `/education` | `EducationPage` | Institution card, progress ring, focus areas, highlights |
| `/certifications` | `CertificationsPage` | Filterable cards, featured row, verification links, tags |
| `/skills` | `SkillsPage` | Grouped by domain, animated progress bars, proficiency %, detail lines, project links |
| `/contact` | `ContactPage` | Contact cards (email copy, location, availability), social links, animated form (Formspree + Supabase dual submit), resume downloads |

### UI/UX Systems
- **Framer Motion animations** — `AnimatedSection` (viewport-triggered fade/slide/stagger), page transitions, hover micro-interactions
- **Particle/space backgrounds** — `SpaceBackground`, `ParticlesBackground`, `CursorGlow`, liquid glass overlay
- **Holographic cards** — `HolographicCard` with sheen sweep, border glow, parallax tilt (`react-parallax-tilt`)
- **Theme system** — Orbital design tokens (`--void`, `--signal`, `--surface`, `--ink`, etc.), dark default, light via `[data-theme="light"]`, persisted in `localStorage`
- **Accessibility** — Skip link, focus rings, `aria-pressed` on filters, semantic landmarks, reduced-motion respect
- **Navigation** — Sticky header, scroll progress indicator, mobile drawer, scroll-to-top, active section highlighting
- **Toast system** — Global notifications (success/error/info) with auto-dismiss
- **Chat widget** — Floating bot placeholder (extendable)
- **Preloader** — Branded entry animation

### Data Layer
- **`PortfolioContext`** — Central provider, Supabase-first with static fallback (`src/data/*`), `__source` field (`'supabase' | 'fallback' | 'pending'`)
- **`useSupabasePortfolioSlice`** — Parallel fetch of all tables, transforms to legacy shapes
- **Static fallback** — `src/data/{about,projects,skills,experience,certifications,portfolioExtras}.js` — zero-config dev/preview

### Analytics & Tracking
- **`usePageView` hook** — Cookieless, localStorage visitor UUID, fires on route change, inserts to `page_views`
- **`trackProjectClick`** — Logs project CTA clicks with `project_clicked` FK
- **Vercel Web Analytics** — `@vercel/analytics/react` (client-side route changes counted)

---

## 📋 Database Schema (Supabase) — Defined in `docs/backend-integration-plan.md`

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `profile` | Single-row identity | `full_name`, `typed_roles[]`, `bio_story[]`, `interests[]`, `fun_facts[]`, `social_links{}`, `resume_url`, `footer_badges[]` |
| `experiences` | Work/leadership history | `organization`, `role_title`, `date_range`, `bullets[]`, `skills_used[]`, `logo_url`, `is_featured`, `display_order` |
| `projects` | Portfolio projects | `title`, `description`, `icon_class`, `badge`, `features[]`, `tech_stack[]`, `categories[]`, `live_url`, `code_url`, `is_disabled`, `is_featured`, `image_url` |
| `skill_groups` | Skill domains | `group_name`, `icon_class`, `display_order` |
| `skills` | Individual skills | `skill_group_id` (FK), `name`, `proficiency`, `icon_class`, `level`, `details[]`, `related_project_id` (FK), `display_order` |
| `certifications` | Credentials | `title`, `issuer`, `issued_date`, `credential_id`, `credential_url`, `tags[]`, `category`, `is_featured`, `learned`, `applied`, `applied_project` |
| `blog_posts` | Articles | `title`, `slug` (unique), `content` (markdown), `excerpt`, `cover_image_url`, `tags[]`, `status` (draft/published), `published_at` |
| `education` | Academic info | `institution`, `degree`, `logo_url`, `progress_percent`, `focus_areas[]`, `highlights[]`, `is_active` |
| `beyond_stats` | Hero stats | `label`, `value`, `icon`, `display_order` |
| `goals` | Goal tracking | `type` (short/long), `title`, `description`, `progress_percent`, `milestones[]` |
| `contact_submissions` | Inbox mirror | `name`, `email`, `message`, `is_read`, `received_at` |
| `page_views` | Analytics | `visitor_id`, `path`, `referrer`, `country`, `device_type`, `browser`, `project_clicked` (FK), `viewed_at` |

**Storage Buckets**: `project-images`, `logos`, `cert-images`, `blog-images`, `resumes` (all public read, authenticated write)

**RLS**: Public SELECT on content tables; Auth CRUD on all; Anon INSERT on `contact_submissions` & `page_views`; Blog public SELECT only `status='published'`

---

## 🚧 Planned / In-Progress (from `README.md` Roadmap & `docs/backend-integration-plan.md`)

### High Priority
- [ ] **Public blog** — `/blog` list + `/blog/:slug` detail page (SSR/SSG or client-side) with `react-markdown` rendering, SEO meta tags (OG, Twitter), `og:image` from cover image
- [ ] **Real-time admin** — Supabase Realtime subscriptions on tables → live list updates without refresh
- [ ] **SEO per blog post** — Dynamic `<meta>` tags, `og:image` from Supabase Storage, JSON-LD Article schema
- [ ] **Scheduled publishing** — Future `published_at` → background job (pg_cron or Edge Function) flips status

### Medium Priority
- [ ] **Admin audit log** — `audit_log` table (user, table, row_id, action, before_json, after_json, timestamp) via DB triggers
- [ ] **Role-based access** — `admin_roles` table, `is_super_admin` flag, policy checks in `ProtectedRoute` and RLS
- [ ] **Advanced analytics** — Geographic heatmap (IP→country via Edge Function), session duration, bounce rate, conversion funnel, CSV/PDF export
- [ ] **Image transforms** — Supabase Image Transformation (`/image/resize:width:300/format:webp/`) for responsive `srcset`
- [ ] **Contact webhooks** — Formspree webhook → Supabase Edge Function → `contact_submissions` (cleaner than dual submit)

### Lower Priority / Nice-to-Have
- [ ] **Architecture diagram asset** — `docs/architecture.png` for README
- [ ] **Automated backups** — Supabase Pro point-in-time recovery
- [ ] **Materialized views** — Pre-aggregated daily analytics for high-traffic scaling
- [ ] **Blog comments** — `blog_comments` table, threaded, moderation queue in admin
- [ ] **Newsletter capture** — `subscribers` table, double opt-in, export for Buttondown/ConvertKit
- [ ] **Project case study pages** — `/projects/:slug` deep-dive route with full markdown content, gallery, architecture diagram
- [ ] **Skill assessments** — Self-assessment quiz, radar chart visualization, export PDF certificate
- [ ] **Visitor heatmaps** — Click/scroll tracking via PostHog-style client library (opt-in)

---

## 💡 New Feature Ideas (Build on Existing Architecture)

### Admin Enhancements
| Feature | Effort | Description |
|---------|--------|-------------|
| **Bulk operations** | Low | Multi-select in DataTable → bulk publish, delete, reorder, tag |
| **Content versioning** | Medium | `*_history` tables with `created_at`, `changed_by`, diff view in admin |
| **Content scheduling** | Medium | `publish_at` / `unpublish_at` on projects, certs, experiences; cron job processes |
| **Media library** | Medium | Central `/admin/media` grid (all buckets), search, replace, delete unused |
| **Custom domains per project** | Low | Add `custom_domain` column, validate DNS, show SSL status |
| **Project analytics drill-down** | Low | Click project in analytics → per-project visits, clicks, referrers, conversion |
| **AI content assist** | High | OpenAI/Anthropic integration: generate blog excerpt, suggest tags, rewrite bullets, alt-text for images |
| **Design token editor** | Medium | Live-edit Orbital tokens in admin → preview on public site → commit to `tokens.css` via PR |
| **Component playground** | Low | `/admin/playground` — isolated render of any UI component with knobs (Storybook-lite) |
| **Feature flags** | Medium | `feature_flags` table → toggle UI experiments (new hero, new card layout) per visitor cohort |

### Public/Portfolio Enhancements
| Feature | Effort | Description |
|---------|--------|-------------|
| **Public blog** | Medium | List + slug pages, RSS/Atom feed, tag archives, reading time, table of contents |
| **Project deep-dive pages** | Medium | `/projects/:slug` with full markdown, image gallery, architecture diagram (Mermaid), related skills/projects |
| **Interactive skill graph** | Medium | Force-directed graph (D3/Canvas) showing skill ↔ project ↔ certification relationships |
| **Timeline explorer** | Low | Unified timeline: experiences + certifications + projects + education + blog posts, filterable |
| **Resume builder** | High | Admin: select sections → generate tailored PDF (React-PDF/PDFKit) with dynamic content |
| **Portfolio themes** | Medium | Multiple Orbital token presets (e.g., "Ocean", "Forest", "Solar") switchable in settings |
| **Multi-language (i18n)** | High | `react-i18next`, per-locale content in DB, locale prefix routes (`/en/`, `/fr/`) |
| **Visitor mode** | Low | "View as visitor" toggle in admin header → opens public site in new tab with `?admin_preview=1` |
| **Shareable project links** | Low | Short UUID links (`/p/abc123`) → redirect to project modal with analytics attribution |
| **Embeddable project cards** | Medium | `<script src="/embed.js" data-project="id">` → iframe-free web component for external sites |

### Analytics & Intelligence
| Feature | Effort | Description |
|---------|--------|-------------|
| **Funnel visualization** | Medium | Visitor → Project view → Click → Contact form → Submission (Sankey diagram) |
| **Cohort retention** | Medium | Weekly cohorts, return visitor heatmap |
| **Referrer attribution** | Low | UTM parameter capture + first/last touch attribution per project click |
| **Performance monitoring** | Low | Web Vitals (LCP, CLS, FID, INP) → `page_views` extension or separate `web_vitals` table |
| **Error tracking** | Low | Client error boundary → Supabase `client_errors` table (message, stack, route, user agent) |
| **A/B test framework** | High | `experiments` table, assignment cookie, variant render, statistical significance calculator |

### Developer Experience
| Feature | Effort | Description |
|---------|--------|-------------|
| **Type-safe DB layer** | Medium | `supabase.gen.typescript` → `src/types/database.ts` → Zod schemas auto-generated |
| **E2E tests** | Medium | Playwright: auth flow, CRUD happy paths, analytics dashboard, public pages |
| **Visual regression** | Medium | Chromatic/Percy for UI components (holographic cards, forms, charts) |
| **Storybook** | Low | Document UI kit (`src/components/ui/*`), admin primitives, form field types |
| **API layer (optional)** | Medium | Supabase Edge Functions → REST API for external consumers (mobile app, Notion sync) |
| **Webhook manager** | Medium | `/admin/webhooks` — register URLs for `projects.insert`, `blog_posts.publish`, `contact_submissions.insert` |

---

## 🛠 Technical Debt / Refactor Opportunities

| Area | Issue | Suggested Fix |
|------|-------|---------------|
| `PortfolioContext` | 200+ lines, mixed concerns | Split into `usePortfolioData`, `usePortfolioMeta`, `usePortfallback` |
| `AdminDashboard` | 425 lines, inline calculations | Extract `useDashboardStats`, `useDashboardInsights`, `useDashboardHealth` hooks |
| `Projects` component | 627 lines, modal + grid + featured | Split into `FeaturedProject`, `ProjectGrid`, `ProjectModal`, `ProjectFilters` |
| CSS load order | Fragile (docs say "changing breaks theming") | Document in `tokens.css` with `@layer`, add build-time order check |
| `no-unused-vars` ignores | Capitalized props pattern | Consider `eslint-plugin-react-hooks` exhaustive-deps instead of workaround |
| `react-refresh` warnings | Context/hooks/ui modules | Split provider + hook into separate files (e.g., `ThemeProvider.jsx` + `useTheme.js`) |
| Bundle chunks | `generateCategoricalChart.js` = 100kB gzipped | Dynamic import Recharts only in `AdminAnalytics`, tree-shake otherwise |
| `supabase` client | Null when unconfigured | Wrap in `createSupabaseClient()` that throws early with actionable message |

---

## 📦 Quick-Start for New Features

1. **Add a new admin CRUD page**
   ```bash
   # 1. Define table in Supabase (SQL editor)
   # 2. Add Zod schema: src/schemas/your-entity.schema.js
   # 3. Create admin page: src/pages/admin/AdminYourEntity.jsx (copy AdminProjects pattern)
   # 4. Add route in App.jsx under ProtectedRoute
   # 5. Add sidebar item in src/constants/adminNav.js
   # 6. Run seed script if needed
   ```

2. **Add a new public page section**
   ```bash
   # 1. Add table/columns to Supabase
   # 2. Extend useSupabasePortfolioSlice hook to fetch it
   # 3. Update PortfolioContext to expose new slice
   # 4. Create component in src/components/
   # 5. Add page in src/pages/ and route in App.jsx
   # 6. Update navLinks + FOOTER_GROUPS in PortfolioContext
   ```

3. **Add a new analytics metric**
   ```bash
   # 1. Ensure data exists in page_views or new table
   # 2. Add query function in src/lib/admin/queries.js
   # 3. Call from AdminAnalytics load() and add to bundle state
   # 4. Add StatCard / chart in AdminAnalytics render
   ```

---

## 🔗 Related Files for Reference

| Purpose | File |
|---------|------|
| Full backend plan | `docs/backend-integration-plan.md` |
| Deployment guide | `docs/deployment.md` |
| CI/CD runbook | `docs/ci-cd.md` |
| Phase 5 verification | `docs/phase5-runbook.md` |
| Content management | `docs/content-management.md` |
| Overview & data flow | `docs/overview.md` |
| Environment template | `.env.example` |
| Bundle budget | `bundle-budget.json` |
| Lighthouse thresholds | `lighthouserc.json` |
| Vercel config | `vercel.json` |
| Supabase migrations | `supabase/migrations/` |

---

*Generated from repo inspection — update as features ship.*