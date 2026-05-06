# Dhruv Thakar - Portfolio

A modern portfolio and full admin CMS built with React + Vite, backed by Supabase for content, auth, storage, messages, and analytics.

## Highlights

- Public multi-page portfolio with animated sections and route-based navigation.
- Protected `/admin` portal with a full content workflow (create/edit/delete).
- Supabase-backed data layer with static-data fallback for resiliency.
- Reusable form system (React Hook Form + Zod) with wizard steps and live previews.
- Built-in analytics dashboard (charts, top pages, referrers, devices).
- Contact form persistence in Supabase (`contact_submissions`) for admin inbox management.

## Live Feature Set

### Public Portfolio

- Landing experience with animated hero and modern background layers.
- Dedicated pages for Home, About, Projects, Beyond, Experience, Education, Certifications, Skills, and Contact.
- Project filtering and rich project cards (badges, tech stack, links, status).
- Skills mapped to related projects for contextual exploration.

### Admin Portal (`/admin`)

- Auth-protected admin shell with sidebar navigation and responsive layout.
- Dashboard overview for content and operational visibility.
- Content management pages:
  - Profile
  - Experiences
  - Projects
  - Skills
  - Certifications
  - Blog + Blog Editor
  - Education
  - Messages
  - Analytics
  - System Health
  - Logs
  - Notifications
  - Settings
  - Account Profile
- Reusable admin UI patterns:
  - Data tables
  - Confirm dialogs
  - Tag inputs
  - Markdown editor
  - Image uploader (Supabase Storage)
  - Multi-step form wizard

## Tech Stack

| Layer | Tools |
| --- | --- |
| Frontend | React 19, React Router 7 |
| Build | Vite 7 |
| Styling | Tailwind CSS 3 + custom UI classes |
| Data / Auth / Storage | Supabase (`@supabase/supabase-js`) |
| Forms & Validation | React Hook Form, Zod, `@hookform/resolvers` |
| Content Rendering | `react-markdown`, `remark-gfm` |
| Analytics Charts | Recharts, date-fns |
| Quality | ESLint 9 |

## Routes

### Public

- `/`
- `/home`
- `/about`
- `/projects`
- `/beyond`
- `/experience`
- `/education`
- `/certifications`
- `/skills`
- `/contact`

### Admin

- `/admin/login`
- `/admin` (dashboard)
- `/admin/profile`
- `/admin/experiences`
- `/admin/projects`
- `/admin/skills`
- `/admin/certifications`
- `/admin/blog`
- `/admin/blog/new`
- `/admin/blog/edit/:id`
- `/admin/messages`
- `/admin/education`
- `/admin/analytics`
- `/admin/system-health`
- `/admin/logs`
- `/admin/notifications`
- `/admin/settings`
- `/admin/account`

## Quick Start

### Prerequisites

- Node.js 18+
- npm

### Install and Run

```bash
npm install
npm run dev
```

App runs at: `http://localhost:5173`

## Environment Variables

Create `.env.local` (or `.env`) in project root:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_FORMSPREE_FORM_ID=your-formspree-id
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Notes:

- `VITE_*` variables are exposed to client code.
- `SUPABASE_SERVICE_ROLE_KEY` is for local scripts only (never expose publicly).
- If Supabase env vars are missing, public pages can still use local fallback content.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite development server |
| `npm run build` | Build production bundle (`dist/`) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run seed` | Seed Supabase from local portfolio data |
| `npm run migrate-assets` | Migrate/upload assets to storage workflow |
| `npm run verify:phase5` | Verify Supabase phase-5 migration/setup |

## Project Structure

```text
.
├── src/
│   ├── components/            # Public + admin reusable components
│   ├── pages/                 # Public and /admin route pages
│   ├── hooks/                 # Auth, CRUD, analytics, Supabase hooks
│   ├── context/               # Portfolio data provider
│   ├── lib/                   # Supabase client + data adapters/utilities
│   ├── schemas/               # Zod schemas for admin forms
│   ├── scripts/               # Seeding/migration/verification scripts
│   ├── constants/             # Shared route/nav/UI constants
│   ├── data/                  # Static fallback content
│   ├── App.jsx
│   └── main.jsx
├── docs/                      # Setup and architecture docs
├── public/                    # Static assets
└── package.json
```

## Content & Data Model

The app is now Supabase-first for portfolio content:

- Profile
- Experiences
- Projects
- Skill groups and skills
- Certifications
- Blog posts
- Education
- Contact submissions
- Page views (analytics)

Reference docs:

- `docs/backend-integration-plan.md`
- `docs/content-management.md`
- `docs/overview.md`

## Deployment Notes

1. Build with `npm run build`.
2. Deploy `dist/` to static hosting.
3. Configure SPA rewrites so non-root routes serve `index.html`.
4. Add required environment variables in hosting provider settings.
5. Ensure Supabase RLS policies and storage buckets are configured.

See `docs/deployment.md` for deployment details.

## Troubleshooting

- Route 404s in production: verify SPA fallback rewrites.
- Admin login issues: confirm Supabase URL/key and auth setup.
- Missing data in admin/public pages: verify table policies and seeded records.
- Contact inbox empty: check `contact_submissions` insert policy and env config.
- Styling/build issues: reinstall dependencies and restart dev server.

## License

MIT (see `LICENSE` if present).
