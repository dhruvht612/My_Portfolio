# Supabase + Admin Portal — Full Implementation Plan

> **Date:** May 3, 2026
> **Status:** Planning
> **Current Stack:** React 19, Vite 7, Tailwind CSS 3, Framer Motion, React Router DOM 7
> **New Additions:** Supabase (PostgreSQL + Auth + Storage), `@supabase/supabase-js`, React Hook Form, Zod

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Supabase Database Schema](#2-supabase-database-schema)
3. [Supabase Storage Setup](#3-supabase-storage-setup)
4. [Security & Row Level Policies](#4-security--row-level-policies)
5. [Project Dependencies](#5-project-dependencies)
6. [File Structure — New Files](#6-file-structure--new-files)
7. [Phase 1: Supabase Client & Context Refactor](#7-phase-1-supabase-client--context-refactor)
8. [Phase 2: Admin Portal — Auth & Layout](#8-phase-2-admin-portal--auth--layout)
9. [Phase 3: Admin Portal — CRUD Pages](#9-phase-3-admin-portal--crud-pages)
10. [Phase 4: Contact Form Integration](#10-phase-4-contact-form-integration)
11. [Phase 5: Data Migration & Seeding](#11-phase-5-data-migration--seeding)
12. [Phase 6: Testing & Deployment](#12-phase-6-testing--deployment)
13. [Built-in Analytics System](#13-built-in-analytics-system)
14. [Supabase SQL Setup Script](#14-supabase-sql-setup-script)
15. [Environment Variables](#15-environment-variables)
16. [Implementation Checklist](#16-implementation-checklist)

---

## 1. Architecture Overview

### Current Data Flow

```
src/data/*.js (hardcoded)
  → PortfolioContext.jsx (centralized)
    → Pages (pass as props)
      → Components (render UI)
```

### New Data Flow

```
Supabase PostgreSQL Database
  → src/lib/supabase.js (client)
  → PortfolioContext.jsx (fetches on mount, caches in state)
    → Pages (unchanged)
      → Components (unchanged)

Admin Portal (/admin/*)
  → Supabase Auth (protected)
  → CRUD pages read/write to same database
  → Supabase Storage for image uploads
```

**Key Principle:** Existing UI components remain untouched. Only `PortfolioContext.jsx` and the data source change. Pages already pass data as props, so no component refactoring is needed beyond the context layer.

---

## 2. Supabase Database Schema

### 2.1 `profile` — Personal Information (single row)

| Column | Type | Constraints | Default | Notes |
|---|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | — | Primary key |
| `full_name` | `text` | NOT NULL | `'Dhruv Thakar'` | Display name |
| `typed_roles` | `text[]` | NOT NULL | `['Software Engineer', 'Computer Science Student', ...]` | Hero typing animation |
| `bio_story` | `text[]` | NOT NULL | — | Array of paragraph strings |
| `interests` | `jsonb` | — | — | `[{icon, title, copy}]` array |
| `fun_facts` | `jsonb` | — | — | `[{emoji, title, copy}]` array |
| `social_links` | `jsonb` | — | — | `{github, linkedin, instagram, email}` |
| `resume_url` | `text` | — | — | URL to latest resume PDF |
| `footer_badges` | `text[]` | — | — | URLs for shield badges |
| `updated_at` | `timestamptz` | — | `now()` | Auto-updated via trigger |

This table will always have exactly one row. Admin UI will use `UPSERT`.

---

### 2.2 `experiences` — Work & Leadership History

| Column | Type | Constraints | Default | Notes |
|---|---|---|---|---|
| `id` | `uuid` | PK | — | Primary key |
| `organization` | `text` | NOT NULL | — | Company/organization name |
| `organization_sub` | `text` | — | — | e.g., "Fortune 500 Company" |
| `employment_type` | `text` | — | — | e.g., "Internship" |
| `role_title` | `text` | NOT NULL | — | e.g., "Software Developer Intern" |
| `date_range` | `text` | NOT NULL | — | e.g., "May 2025 – Aug 2025" |
| `location` | `text` | — | — | e.g., "Markham, ON" |
| `work_mode` | `text` | — | `'Hybrid'` | Remote/Hybrid/On-site |
| `description` | `text` | — | — | Optional role description |
| `bullets` | `text[]` | — | — | Array of accomplishment bullets |
| `skills_used` | `text[]` | — | — | Array of skill tags |
| `logo_url` | `text` | — | — | URL to org logo in storage |
| `is_featured` | `boolean` | — | `false` | Featured role on timeline |
| `display_order` | `integer` | — | `0` | Sort order within org |
| `created_at` | `timestamptz` | — | `now()` | — |
| `updated_at` | `timestamptz` | — | `now()` | — |

Query strategy: Fetch all rows, group by `organization` in `PortfolioContext.jsx` to reconstruct the current `experienceByOrg` shape.

---

### 2.3 `projects` — Portfolio Projects

| Column | Type | Constraints | Default | Notes |
|---|---|---|---|---|
| `id` | `uuid` | PK | — | Primary key |
| `title` | `text` | NOT NULL | — | Project name |
| `description` | `text` | NOT NULL | — | Short description |
| `icon_class` | `text` | — | — | Lucide icon name (e.g., `Shield`) |
| `badge` | `text` | — | — | e.g., "Featured", "New" |
| `features` | `text[]` | — | — | Key features list |
| `tech_stack` | `text[]` | — | — | Technologies used |
| `categories` | `text[]` | — | — | Filter categories |
| `live_url` | `text` | — | — | Live demo URL |
| `code_url` | `text` | — | — | GitHub repo URL |
| `is_disabled` | `boolean` | — | `false` | Mark project as unavailable |
| `is_featured` | `boolean` | — | `false` | Featured project spotlight |
| `display_order` | `integer` | — | `0` | Sort order in grid |
| `image_url` | `text` | — | — | Screenshot in storage |
| `created_at` | `timestamptz` | — | `now()` | — |
| `updated_at` | `timestamptz` | — | `now()` | — |

Filter logic: Categories array maps directly to existing `PROJECT_FILTERS`. Admin can add new categories which auto-appear as filter pills.

---

### 2.4 `skill_groups` — Skill Categories

| Column | Type | Constraints | Default | Notes |
|---|---|---|---|---|
| `id` | `uuid` | PK | — | Primary key |
| `group_name` | `text` | NOT NULL | — | e.g., "Programming" |
| `icon_class` | `text` | — | — | Lucide icon for group |
| `display_order` | `integer` | — | `0` | Sort order |

### 2.5 `skills` — Individual Skills

| Column | Type | Constraints | Default | Notes |
|---|---|---|---|---|
| `id` | `uuid` | PK | — | Primary key |
| `skill_group_id` | `uuid` | FK → `skill_groups.id`, ON DELETE CASCADE | — | Parent group |
| `name` | `text` | NOT NULL | — | e.g., "Python" |
| `proficiency` | `integer` | NOT NULL, CHECK 0–100 | — | Percentage bar |
| `icon_class` | `text` | — | — | Lucide icon |
| `level` | `text` | — | — | e.g., "Advanced" |
| `details` | `text[]` | — | — | Context about the skill |
| `related_project_id` | `uuid` | FK → `projects.id`, ON DELETE SET NULL | — | Links skill to project for modal |
| `display_order` | `integer` | — | `0` | Sort order within group |

---

### 2.6 `certifications`

| Column | Type | Constraints | Default | Notes |
|---|---|---|---|---|
| `id` | `uuid` | PK | — | Primary key |
| `title` | `text` | NOT NULL | — | Certification name |
| `issuer` | `text` | NOT NULL | — | Issuing organization |
| `issued_date` | `text` | — | — | e.g., "Jan 2024" |
| `credential_id` | `text` | — | — | Verification ID |
| `credential_url` | `text` | — | — | Verification link |
| `tags` | `text[]` | — | — | Skill/tech tags |
| `category` | `text` | — | — | For grouping (e.g., "Cloud") |
| `is_featured` | `boolean` | — | `false` | Show in featured section |
| `learned` | `text` | — | — | What was learned |
| `applied` | `text` | — | — | How it was applied |
| `applied_project` | `text` | — | — | Related project name |
| `created_at` | `timestamptz` | — | `now()` | — |
| `updated_at` | `timestamptz` | — | `now()` | — |

---

### 2.7 `blog_posts` — Blog / Articles

| Column | Type | Constraints | Default | Notes |
|---|---|---|---|---|
| `id` | `uuid` | PK | — | Primary key |
| `title` | `text` | NOT NULL | — | Post title |
| `slug` | `text` | UNIQUE, NOT NULL | — | URL-friendly identifier |
| `content` | `text` | NOT NULL | — | Markdown content |
| `excerpt` | `text` | — | — | Short summary for cards |
| `cover_image_url` | `text` | — | — | Cover image in storage |
| `tags` | `text[]` | — | — | Topic tags |
| `status` | `text` | CHECK IN ('draft', 'published') | `'draft'` | Controls visibility |
| `published_at` | `timestamptz` | — | — | Set when published |
| `created_at` | `timestamptz` | — | `now()` | — |
| `updated_at` | `timestamptz` | — | `now()` | — |

Public query: `SELECT * FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC`
Admin query: All rows regardless of status.

---

### 2.8 `education` — Academic Information

| Column | Type | Constraints | Default | Notes |
|---|---|---|---|---|
| `id` | `uuid` | PK | — | Primary key |
| `institution` | `text` | NOT NULL | — | e.g., "Ontario Tech University" |
| `degree` | `text` | NOT NULL | — | e.g., "Bachelor of Computer Science" |
| `logo_url` | `text` | — | — | Institution logo |
| `progress_percent` | `integer` | — | `50` | Progress bar percentage |
| `focus_areas` | `text[]` | — | — | Areas of study |
| `highlights` | `jsonb` | — | — | `[{icon, title, description}]` array |
| `is_active` | `boolean` | — | `true` | Currently enrolled |

---

### 2.9 `beyond_stats`

| Column | Type | Constraints | Default | Notes |
|---|---|---|---|---|
| `id` | `uuid` | PK | — | Primary key |
| `label` | `text` | NOT NULL | — | e.g., "Years of Experience" |
| `value` | `text` | NOT NULL | — | e.g., "4+" |
| `icon` | `text` | — | — | Lucide icon name |
| `display_order` | `integer` | — | `0` | Sort order |

### 2.10 `goals`

| Column | Type | Constraints | Default | Notes |
|---|---|---|---|---|
| `id` | `uuid` | PK | — | Primary key |
| `type` | `text` | CHECK IN ('short', 'long') | — | Goal type |
| `title` | `text` | NOT NULL | — | e.g., "Short-Term Goal" |
| `description` | `text` | NOT NULL | — | Goal description |
| `progress_percent` | `integer` | — | `0` | Progress bar |
| `milestones` | `text[]` | — | — | Checklist items |

---

### 2.11 `contact_submissions` — Read-Only View of Formspree Messages

This table is populated via **dual submission** from the contact form. It does NOT replace Formspree. It provides a read-only view in the admin portal.

| Column | Type | Constraints | Default | Notes |
|---|---|---|---|---|
| `id` | `uuid` | PK | — | Primary key |
| `name` | `text` | NOT NULL | — | Sender name |
| `email` | `text` | NOT NULL | — | Sender email |
| `message` | `text` | NOT NULL | — | Message body |
| `is_read` | `boolean` | — | `false` | Mark as read |
| `received_at` | `timestamptz` | — | `now()` | Timestamp |

### 2.12 `page_views` — Analytics Tracking

This table powers the built-in analytics dashboard. Every page visit is recorded with a lightweight, cookieless tracking hook.

| Column | Type | Constraints | Default | Notes |
|---|---|---|---|---|
| `id` | `uuid` | PK | — | Primary key |
| `visitor_id` | `text` | NOT NULL | — | Fingerprint (localStorage UUID, regenerated if cleared) |
| `path` | `text` | NOT NULL | — | Page path (e.g., `/projects`, `/about`) |
| `referrer` | `text` | — | — | Where the visitor came from (e.g., `linkedin.com`, `github.com`, `direct`) |
| `country` | `text` | — | — | Country code from IP (optional, via Edge Function or IP API) |
| `device_type` | `text` | — | — | `desktop`, `mobile`, `tablet` (from user agent) |
| `browser` | `text` | — | — | Browser name (from user agent) |
| `project_clicked` | `uuid` | FK → `projects.id`, ON DELETE SET NULL | — | If visitor clicked a project, stores which one |
| `viewed_at` | `timestamptz` | — | `now()` | Timestamp of the view |

**How tracking works:**

1. On first visit, generate a random UUID stored in `localStorage` as `visitor_id`
2. A custom `usePageView` hook fires on every route change
3. The hook sends an INSERT to `page_views` (non-blocking, fire-and-forget)
4. No cookies, no personal data — fully privacy-compliant
5. Admin dashboard queries this table for aggregated stats

**Key queries for the admin analytics dashboard:**

```sql
-- Total visits (last 7 days)
SELECT COUNT(*) FROM page_views WHERE viewed_at > now() - interval '7 days';

-- Unique visitors (last 7 days)
SELECT COUNT(DISTINCT visitor_id) FROM page_views WHERE viewed_at > now() - interval '7 days';

-- Most visited pages (last 30 days)
SELECT path, COUNT(*) as views FROM page_views
WHERE viewed_at > now() - interval '30 days'
GROUP BY path ORDER BY views DESC LIMIT 10;

-- Most clicked projects (all time)
SELECT p.title, COUNT(pv.project_clicked) as clicks
FROM page_views pv JOIN projects p ON p.id = pv.project_clicked
WHERE pv.project_clicked IS NOT NULL
GROUP BY p.title ORDER BY clicks DESC;

-- Referrer breakdown (last 30 days)
SELECT referrer, COUNT(*) as visits FROM page_views
WHERE viewed_at > now() - interval '30 days'
GROUP BY referrer ORDER BY visits DESC;

-- Device breakdown
SELECT device_type, COUNT(*) as visits FROM page_views
WHERE viewed_at > now() - interval '30 days'
GROUP BY device_type;

-- Daily visits (last 14 days — for chart)
SELECT DATE(viewed_at) as day, COUNT(*) as views
FROM page_views
WHERE viewed_at > now() - interval '14 days'
GROUP BY day ORDER BY day;
```

---

## 3. Supabase Storage Setup

### 3.1 Storage Buckets

| Bucket | Purpose | File Types |
|---|---|---|
| `project-images` | Project screenshots | `.png`, `.jpg`, `.webp` |
| `logos` | Organization/company logos | `.png`, `.jpg`, `.svg` |
| `cert-images` | Certification badges/logos | `.png`, `.jpg` |
| `blog-images` | Blog post cover images | `.png`, `.jpg`, `.webp` |
| `resumes` | Resume PDF documents | `.pdf` |

### 3.2 Storage Policies

- Public read access to all buckets
- Authenticated users can upload, update, and delete
- Admin UI uploads file → gets public URL → stores URL in DB column
- On row delete, optionally clean up storage object

### 3.3 Image Upload Flow (Admin)

1. Admin selects image file in CRUD form
2. File uploaded via `supabase.storage.from('bucket-name').upload()`
3. Public URL retrieved via `getPublicUrl()`
4. URL stored in the relevant database row column
5. On delete of a row, optionally clean up storage object

---

## 4. Security & Row Level Policies

### 4.1 Database RLS Policies

**Public read, authenticated write** pattern for all content tables:

```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view projects"
ON projects FOR SELECT USING (true);

CREATE POLICY "Auth can insert projects"
ON projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Auth can update projects"
ON projects FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth can delete projects"
ON projects FOR DELETE USING (auth.role() = 'authenticated');
```

This pattern repeats for: `experiences`, `skill_groups`, `skills`, `certifications`, `blog_posts`, `education`, `beyond_stats`, `goals`.

**Special cases:**
- `profile` table: Only 1 row exists. Authenticated users can UPDATE/UPSERT only.
- `contact_submissions`: INSERT via anon (dual submission from form), SELECT/UPDATE/DELETE only for authenticated (admin view).
- `blog_posts`: Public SELECT only where `status = 'published'`. Authenticated can SELECT all.

### 4.2 Auth Configuration
- Enable **Email/Password** auth only (simplest, no OAuth needed)
- Disable signups (you create the admin user in Supabase dashboard)
- Set session expiry to 1 week (adjustable)
- Enable "Confirm email" OFF for the admin user (you control the account)

---

## 5. Project Dependencies

### Install

```bash
npm install @supabase/supabase-js react-hook-form @hookform/resolvers zod
```

| Package | Purpose |
|---|---|
| `@supabase/supabase-js` | Supabase client (DB queries, auth, storage) |
| `react-hook-form` | Form management for admin CRUD pages |
| `@hookform/resolvers` | Zod validation integration with react-hook-form |
| `zod` | Schema validation for all admin forms |

### Blog Dependencies

```bash
npm install react-markdown remark-gfm
```

| Package | Purpose |
|---|---|
| `react-markdown` | Renders markdown content to HTML |
| `remark-gfm` | GitHub Flavored Markdown support (tables, strikethrough, etc.) |

### Analytics Dependencies (Optional — Free)

```bash
npm install recharts date-fns
```

| Package | Purpose |
|---|---|
| `recharts` | Charts and graphs for the analytics dashboard |
| `date-fns` | Date formatting and grouping for time-series queries |

---

## 6. File Structure — New Files

```
src/
├── lib/
│   └── supabase.js                         # Supabase client initialization
│
├── context/
│   └── PortfolioContext.jsx                # REFACTORED — fetches from Supabase
│
├── hooks/
│   ├── useAuth.js                          # Supabase auth state hook
│   ├── useSupabaseQuery.js                 # Generic data fetching hook
│   └── usePageView.js                      # Analytics tracking hook
│
├── schemas/
│   ├── profile.schema.js                   # Zod schema for profile form
│   ├── project.schema.js                   # Zod schema for project form
│   ├── experience.schema.js                # Zod schema for experience form
│   ├── skill.schema.js                     # Zod schema for skill form
│   ├── certification.schema.js             # Zod schema for cert form
│   ├── blog.schema.js                      # Zod schema for blog form
│   └── education.schema.js                 # Zod schema for education form
│
├── components/
│   └── admin/
│       ├── AdminSidebar.jsx                # Navigation sidebar
│       ├── AdminHeader.jsx                 # Top bar with logout
│       ├── DataTable.jsx                   # Reusable table with actions
│       ├── AdminForm.jsx                   # Reusable form wrapper
│       ├── ImageUploader.jsx               # File upload component
│       ├── MarkdownEditor.jsx              # Blog content editor
│       ├── StatusBadge.jsx                 # Draft/Published badge
│       └── AnalyticsChart.jsx              # Reusable chart wrapper
│
├── pages/
│   └── admin/
│       ├── AdminLogin.jsx                  # Login page
│       ├── AdminLayout.jsx                 # Sidebar + header layout
│       ├── AdminDashboard.jsx              # Stats overview
│       ├── AdminProfile.jsx                # Edit bio, socials, resume
│       ├── AdminExperiences.jsx            # CRUD experiences
│       ├── AdminProjects.jsx               # CRUD projects
│       ├── AdminSkills.jsx                 # CRUD skill groups + skills
│       ├── AdminCertifications.jsx         # CRUD certifications
│       ├── AdminBlog.jsx                   # CRUD blog posts list
│       ├── AdminBlogEditor.jsx             # Individual blog post editor
│       ├── AdminMessages.jsx               # View contact submissions
│       ├── AdminEducation.jsx              # Edit education info
│       └── AdminAnalytics.jsx              # Analytics dashboard
│
├── scripts/
│   └── seed-supabase.js                    # Migration script — seeds DB from current data files
│
└── constants/
    └── adminNav.js                         # Admin sidebar navigation config
```

### Modified Files

```
src/App.jsx                     # Add /admin/* routes + ProtectedRoute
src/context/PortfolioContext.jsx # Replace imports with Supabase queries
src/components/Contact.jsx      # Add dual submission to Supabase
```

---

## 7. Phase 1: Supabase Client & Context Refactor

### 7.1 Create Supabase Client

**File:** `src/lib/supabase.js`

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 7.2 Refactor PortfolioContext.jsx

**Current:** Imports all data from `src/data/*.js` files and merges them into one context object.

**New approach:**

1. On mount, fetch all tables in parallel using `Promise.all`
2. Store results in state
3. Transform data to match existing shapes (e.g., group experiences by org)
4. Export same `usePortfolio()` hook with same interface
5. This ensures zero changes to Pages or Components

```javascript
// Example pattern for refactored context
const [data, setData] = useState({ loading: true, error: null })

useEffect(() => {
  async function fetchData() {
    try {
      const [
        { data: profileData },
        { data: experienceData },
        { data: projectsData },
        { data: skillGroupsData },
        { data: skillsData },
        { data: certsData },
        { data: blogData },
        { data: educationData },
        { data: beyondStatsData },
        { data: goalsData },
      ] = await Promise.all([
        supabase.from('profile').select().single(),
        supabase.from('experiences').select().order('display_order'),
        supabase.from('projects').select().order('display_order'),
        supabase.from('skill_groups').select().order('display_order'),
        supabase.from('skills').select().order('display_order'),
        supabase.from('certifications').select().order('created_at', { ascending: false }),
        supabase.from('blog_posts').select().eq('status', 'published').order('published_at', { ascending: false }),
        supabase.from('education').select().single(),
        supabase.from('beyond_stats').select().order('display_order'),
        supabase.from('goals').select().order('type'),
      ])

      // Transform to existing shapes
      const experienceByOrg = groupBy(experienceData, 'organization')
      // ... more transformations

      setData({ loading: false, error: null, /* ...all transformed data */ })
    } catch (error) {
      // Fall back to static data
      console.warn('Supabase fetch failed, using fallback data:', error)
      setData({ loading: false, error, /* ...fallback data from imports */ })
    }
  }
  fetchData()
}, [])
```

### 7.3 Fallback Strategy

If Supabase queries fail (network error, etc.), fall back to importing static data from `src/data/*.js` as a safety net. This ensures the site never breaks.

```javascript
// If Supabase fetch fails, use these as fallback:
import { projects as fallbackProjects } from '../data/projects'
import { experienceByOrg as fallbackExperience } from '../data/experience'
// ... etc
```

---

## 8. Phase 2: Admin Portal — Auth & Layout

### 8.1 Add Admin Routes to App.jsx

```javascript
// Lazy-loaded admin pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile'))
const AdminExperiences = lazy(() => import('./pages/admin/AdminExperiences'))
const AdminProjects = lazy(() => import('./pages/admin/AdminProjects'))
const AdminSkills = lazy(() => import('./pages/admin/AdminSkills'))
const AdminCertifications = lazy(() => import('./pages/admin/AdminCertifications'))
const AdminBlog = lazy(() => import('./pages/admin/AdminBlog'))
const AdminBlogEditor = lazy(() => import('./pages/admin/AdminBlogEditor'))
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages'))
const AdminEducation = lazy(() => import('./pages/admin/AdminEducation'))
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'))

// ProtectedRoute component
function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()
  if (loading) return <Preloader />
  if (!session) return <Navigate to="/admin/login" replace />
  return children
}

// Routes
<Route path="/admin/login" element={<AdminLogin />} />
<Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
  <Route index element={<AdminDashboard />} />
  <Route path="profile" element={<AdminProfile />} />
  <Route path="experiences" element={<AdminExperiences />} />
  <Route path="projects" element={<AdminProjects />} />
  <Route path="skills" element={<AdminSkills />} />
  <Route path="certifications" element={<AdminCertifications />} />
  <Route path="blog" element={<AdminBlog />} />
  <Route path="blog/new" element={<AdminBlogEditor />} />
  <Route path="blog/edit/:id" element={<AdminBlogEditor />} />
  <Route path="messages" element={<AdminMessages />} />
  <Route path="education" element={<AdminEducation />} />
  <Route path="analytics" element={<AdminAnalytics />} />
</Route>
```

### 8.2 useAuth Hook

**File:** `src/hooks/useAuth.js`

```javascript
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { session, loading }
}
```

### 8.3 AdminLogin.jsx

- Clean login form with email + password
- Uses `supabase.auth.signInWithPassword()`
- On success, redirect to `/admin`
- Shows error messages for invalid credentials
- Matches existing portfolio glassmorphism aesthetic

### 8.4 AdminLayout.jsx

- Full-screen admin layout (NOT wrapped in the public `Layout`)
- **Left sidebar:** Navigation links with Lucide icons, collapsible on mobile
- **Top header:** Page title + user info + logout button
- **Main content area:** `<Outlet />` for child routes
- Dark theme consistent with portfolio design

### 8.5 usePageView Hook (Analytics Tracking)

**File:** `src/hooks/usePageView.js`

A lightweight, cookieless tracking hook that fires on every route change:

```javascript
import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function getOrCreateVisitorId() {
  let id = localStorage.getItem('visitor_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('visitor_id', id)
  }
  return id
}

function getDeviceInfo() {
  const ua = navigator.userAgent
  let deviceType = 'desktop'
  if (/Mobi|Android/i.test(ua)) deviceType = 'mobile'
  else if (/Tablet|iPad/i.test(ua)) deviceType = 'tablet'

  let browser = 'unknown'
  if (/Firefox/i.test(ua)) browser = 'Firefox'
  else if (/Chrome/i.test(ua)) browser = 'Chrome'
  else if (/Safari/i.test(ua)) browser = 'Safari'
  else if (/Edge/i.test(ua)) browser = 'Edge'

  return { deviceType, browser }
}

export function usePageView() {
  const location = useLocation()
  const hasTracked = useRef(false)

  useEffect(() => {
    // Avoid double-tracking on React 19 StrictMode
    if (hasTracked.current) return
    hasTracked.current = true

    const visitorId = getOrCreateVisitorId()
    const { deviceType, browser } = getDeviceInfo()

    supabase.from('page_views').insert({
      visitor_id: visitorId,
      path: location.pathname,
      referrer: document.referrer || 'direct',
      device_type: deviceType,
      browser,
    }).then(({ error }) => {
      if (error) console.warn('Analytics tracking failed:', error.message)
    })
  }, [location.pathname])
}
```

**Usage:** Add to the top-level `App.jsx` or `Layout.jsx`:
```javascript
// In App.jsx or Layout.jsx
import { usePageView } from './hooks/usePageView'

function App() {
  usePageView() // Tracks every route change
  // ...
}
```

**For project click tracking:** Add a helper function that logs when a visitor clicks "View Project" or "View Code":
```javascript
export function trackProjectClick(projectId) {
  const visitorId = getOrCreateVisitorId()
  supabase.from('page_views').insert({
    visitor_id: visitorId,
    path: window.location.pathname,
    project_clicked: projectId,
  })
}
```
Call this from the project modal/card "View" buttons.

---

## 9. Phase 3: Admin Portal — CRUD Pages

All CRUD pages follow the same pattern: **Table view + Modal-based Add/Edit forms** (not separate pages — keeps the UX fast and inline).

### Shared Reusable Components

**DataTable.jsx:**
- Reusable table with configurable columns
- Sort by column header click
- Actions column (edit/delete icons)
- Empty state message when no data
- Loading spinner while fetching

**AdminForm.jsx:**
- Form wrapper using `react-hook-form` + `zodResolver`
- Accepts schema, default values, submit handler as props
- Renders fields dynamically from a field config array
- Handles loading state, success/error toasts

**ImageUploader.jsx:**
- Drag-and-drop or click-to-select file input
- Image preview before upload
- Uploads to specified Supabase storage bucket
- Returns public URL on success
- Progress indicator during upload

**MarkdownEditor.jsx:**
- Split-pane layout: editor on left, preview on right
- Uses `react-markdown` + `remark-gfm` for preview
- Toolbar with common markdown shortcuts (bold, italic, heading, link, code, list)
- Full-screen toggle option

### 9.1 AdminDashboard.jsx

Stats overview cards:
- Total projects (with link to manage)
- Total certifications
- Total blog posts (published vs draft count)
- Unread contact messages (with link to view)
- Recent activity log (last 5 edits by `updated_at`)

### 9.2 AdminProfile.jsx

Single form with sections:
- **Basic Info:** Full name, typed roles (dynamic array input — add/remove roles)
- **Bio/Story:** Array of paragraphs (add/remove)
- **Social Links:** GitHub, LinkedIn, Instagram, Email
- **Resume:** File upload for PDF (uploads to `resumes` bucket)
- **Footer Badges:** Array of badge URLs
- Uses `UPSERT` on submit (always one row)

### 9.3 AdminExperiences.jsx

- Table grouped by organization with expandable rows
- **Add/Edit modal** with:
  - Organization name (dropdown of existing or "New organization" to type new)
  - Organization subtitle
  - Employment type (text input)
  - Role title
  - Date range (text, e.g., "May 2025 – Aug 2025")
  - Location
  - Work mode (select: Remote / Hybrid / On-site)
  - Description (textarea)
  - Bullets (dynamic array — add/remove bullet points)
  - Skills used (tag input — add/remove skill tags)
  - Logo upload (uploads to `logos` bucket)
  - Is featured toggle
  - Display order (number input)
- Delete with confirmation dialog
- Reorder with up/down buttons

### 9.4 AdminProjects.jsx

- Table with columns: Image thumbnail, Title, Categories (tags), Tech count, Status (active/disabled), Featured badge
- **Add/Edit modal** with:
  - Title
  - Description
  - Icon class (Lucide icon picker dropdown with search)
  - Badge text ("Featured", "New", or custom)
  - Features (dynamic array)
  - Tech stack (tag input — add/remove)
  - Categories (multi-select from existing categories + ability to add new)
  - Live URL
  - Code URL
  - Is disabled toggle
  - Is featured toggle
  - Image upload (project screenshot → `project-images` bucket)
  - Display order
- Preview card in modal showing how it looks on the live site (uses same `holographic-card` component)

### 9.5 AdminSkills.jsx

- **Two-tab interface:**
  - **Tab 1: Skill Groups** — CRUD for groups (name, icon class, display order)
  - **Tab 2: Skills** — CRUD for individual skills
    - Name
    - Parent group (select dropdown from skill_groups)
    - Proficiency (slider 0–100 with percentage display)
    - Icon class
    - Level (text: Beginner/Intermediate/Advanced/Expert)
    - Details (dynamic array of strings)
    - Related project (select from projects dropdown — links skill to project for modal)
    - Display order
- Deleting a skill group cascades delete to all child skills

### 9.6 AdminCertifications.jsx

- Table with columns: Title, Issuer, Date, Featured badge, Category
- **Add/Edit modal:**
  - Title
  - Issuer
  - Issued date (text)
  - Credential ID
  - Credential URL
  - Tags (tag input)
  - Category (text or select from existing)
  - Is featured toggle
  - Learned (textarea)
  - Applied (textarea)
  - Applied project (text)
  - Image upload for cert badge (→ `cert-images` bucket)

### 9.7 AdminBlog.jsx + AdminBlogEditor.jsx

- **AdminBlog.jsx:** Table of all posts
  - Columns: Title, Status badge (Draft/Published), Date, Tags
  - Filter by status (All / Draft / Published)
  - Quick actions: Publish / Unpublish / Edit / Delete
  - "+ New Post" button → navigates to `/admin/blog/new`

- **AdminBlogEditor.jsx:** Full editor for creating/editing posts
  - Title (auto-generates slug on blur, editable)
  - Slug (URL-friendly, validated)
  - Excerpt (textarea — short summary for cards)
  - Cover image upload (→ `blog-images` bucket)
  - Tags (tag input)
  - Status toggle (draft/published — sets `published_at` when switching to published)
  - **Content:** Markdown editor with live preview split-pane
  - Save as draft or publish button
  - Auto-save draft every 30 seconds (optional enhancement)

### 9.8 AdminMessages.jsx

- Table of contact form submissions
  - Columns: Name, Email, Date, Read status badge, Message preview (truncated)
  - Click row to expand full message in a detail panel
  - Mark as read/unread toggle (checkbox or button)
  - Filter by read status (All / Unread / Read)
  - Delete old messages with confirmation
  - Search by name or email

### 9.9 AdminEducation.jsx

- Single form (similar to profile):
  - Institution name
  - Degree
  - Logo upload (→ `logos` bucket)
  - Progress percentage (slider 0–100)
  - Focus areas (dynamic array — add/remove)
  - Highlights (dynamic array of objects: {icon, title, description})
  - Is active toggle
- Uses `UPSERT` on submit

### 9.10 AdminAnalytics.jsx

Built-in analytics dashboard using data from the `page_views` table. All charts use `recharts`.

**Top Stats Row (4 cards):**
- **Total Visits** — Last 7 days vs previous 7 days (with % change indicator)
- **Unique Visitors** — Distinct `visitor_id` count for last 7 days
- **Total Messages** — Contact form submissions (from `contact_submissions`)
- **Avg. Views/Day** — Average daily visits over last 30 days

**Charts Section:**

1. **Visits Over Time** (Line Chart)
   - Daily visit counts for the last 14 days
   - X-axis: dates, Y-axis: number of views
   - Smooth curve with gradient fill below

2. **Top Pages** (Bar Chart — Horizontal)
   - Most visited pages in the last 30 days
   - Shows path + view count
   - Limited to top 8 pages

3. **Referrer Sources** (Pie/Donut Chart)
   - Breakdown of where visitors come from
   - Categories: `linkedin.com`, `github.com`, `google.com`, `direct`, `other`
   - Shows percentage per source

4. **Device Breakdown** (Donut Chart)
   - Desktop vs Mobile vs Tablet percentages
   - Shows exact counts

5. **Most Clicked Projects** (Bar Chart — Horizontal)
   - Projects ranked by number of "View Project" clicks
   - Links to the project's edit page in admin
   - Shows click count per project

**Time Range Selector:**
- Dropdown or pill buttons: `7 days` | `14 days` | `30 days` | `90 days`
- All charts and stats update based on selected range

**Data Refresh:**
- Auto-refreshes every 60 seconds when the tab is visible
- Manual refresh button
- Caches queries with 30-second stale time

**Privacy Note (displayed in small text at bottom):**
- "Analytics are cookieless and do not collect personal data. Visitors are identified by a randomly generated ID stored in localStorage."

---

## 10. Phase 4: Contact Form Integration

### Strategy: Keep Formspree, Add Dual Submission to Supabase

The contact form stays exactly as-is with Formspree. Messages are simultaneously sent to Supabase for admin viewing.

### Implementation in `Contact.jsx`

```javascript
import { supabase } from '../lib/supabase'

// Inside the form submit handler
const handleFormSubmit = async (e) => {
  e.preventDefault()

  const formData = {
    name: e.target.name.value,
    email: e.target.email.value,
    message: e.target.message.value,
  }

  // Submit to Formspree (existing — handles email notifications)
  const formspreeResult = await handleSubmit(formData)

  // Submit to Supabase (parallel — stores for admin viewing)
  try {
    await supabase
      .from('contact_submissions')
      .insert({
        name: formData.name,
        email: formData.email,
        message: formData.message,
      })
  } catch (error) {
    // Non-critical — Formspree is the primary submission
    console.warn('Failed to store contact submission in Supabase:', error)
  }

  return formspreeResult
}
```

Formspree handles email notifications to your inbox. Supabase stores the message so you can view it in `/admin/messages`.

### Future Enhancement: Webhook → Edge Function

Optional upgrade: Configure Formspree webhook to POST to a Supabase Edge Function, which inserts into `contact_submissions`. This is cleaner but more complex and can be added later.

---

## 11. Phase 5: Data Migration & Seeding

### 11.1 Seed Script

**File:** `src/scripts/seed-supabase.js`

A Node.js script that:
1. Reads all existing `src/data/*.js` files
2. Connects to Supabase using the service role key (bypasses RLS)
3. Inserts all data into the appropriate tables
4. Handles relationships (e.g., skill groups before skills)
5. Upserts the profile row

**Run command:**

```bash
node src/scripts/seed-supabase.js
```

**Execution order:**

1. `profile` (1 row — UPSERT)
2. `skill_groups` (4 rows)
3. `experiences` (all rows — multiple per organization)
4. `projects` (9 rows)
5. `skills` (29 rows, linked to groups and optionally projects)
6. `certifications` (27 rows)
7. `education` (1 row — UPSERT)
8. `beyond_stats` (4 rows)
9. `goals` (2 rows)

### 11.2 Image Migration

Existing images in `src/assets/` need to be uploaded to Supabase Storage:
- Logos (company/university) → `logos` bucket
- Update database rows with public URLs from storage
- Old `src/assets/` references can be removed after migration and verification

### 11.3 Verification

After seeding:
1. Visit the portfolio site — verify all content renders correctly
2. Visit `/admin` — verify all data appears in tables
3. Edit a project in admin — verify changes appear on the live site after refresh
4. Delete a cert — verify it disappears from the site

---

## 12. Phase 6: Testing & Deployment

### 12.1 Testing Checklist

- [ ] Site loads with Supabase data (no fallback triggered)
- [ ] All pages render correctly (home, about, projects, experience, skills, education, certifications, contact)
- [ ] Project filters work with Supabase-sourced categories
- [ ] Skill progress bars display correct percentages
- [ ] Experience timeline groups by organization correctly
- [ ] Admin login works
- [ ] Admin CRUD operations work for each content type
- [ ] Image uploads work and display on live site
- [ ] Blog posts publish/unpublish correctly
- [ ] Contact form dual-submission works
- [ ] Admin messages page shows submissions
- [ ] Fallback to static data works if Supabase is down
- [ ] Mobile responsive for admin portal
- [ ] Deleting a skill group cascades to child skills
- [ ] Blog slug uniqueness is enforced

### 12.2 Deployment

- Supabase project is cloud-hosted — no deployment needed for backend
- Frontend deployment (Vercel/Netlify): Add environment variables
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Admin user created in Supabase dashboard before deploy
- Run seed script once after Supabase project is created
- Set `VITE_FORMSPREE_FORM_ID` in production env vars

### 12.3 Post-Deployment

- Test admin portal on production URL
- Verify environment variables are set correctly
- Confirm RLS policies are active
- Remove `src/data/*.js` files ONLY after confirming everything works (keep as git backup in a branch)

---

## 13. Built-in Analytics System

### Why Not Vercel Analytics?

| Metric | Supabase Analytics (Recommended) | Vercel Web Analytics |
|---|---|---|
| **Cost** | **Free** (included in Supabase free tier) | **$20/mo** (Vercel Pro plan required) |
| **Dashboard** | **Inside your admin portal** — single pane of glass | Vercel dashboard — separate tab |
| **Custom Events** | **Yes** — project clicks, custom events | No — page views only |
| **Data Ownership** | **Full** — your database, your data | Vercel's platform |
| **Setup** | Already included in this plan | Extra package, separate config |
| **Cookieless** | Yes | Yes |

**Bottom line:** Since you're already using Supabase, adding analytics costs $0 extra, lives inside your admin portal, and gives you more control. Vercel Web Analytics requires a paid plan and keeps data on their platform.

### 13.1 How It Works

1. **Tracking hook** (`usePageView`) fires on every route change
2. **Fire-and-forget INSERT** to `page_views` table — does not block page rendering
3. **Visitor identification** via a randomly generated UUID in `localStorage` — no cookies, no fingerprinting beyond that
4. **Admin dashboard** queries the table with time-range filters and displays charts
5. **Project clicks** are tracked separately via `trackProjectClick()` helper

### 13.2 Privacy Considerations

- No cookies are used
- No personal identifiable information (PII) is collected
- Visitor IDs are random UUIDs with no connection to real identity
- IP addresses are NOT stored
- Full GDPR/CCPA compliant by design
- A privacy note is displayed at the bottom of the analytics dashboard

### 13.3 AdminAnalytics.jsx — Implementation Details

**Data fetching pattern:**
```javascript
// Fetch all stats in parallel on mount
const [dateRange, setDateRange] = useState(30) // days

const [stats, setStats] = useState(null)

useEffect(() => {
  const since = new Date()
  since.setDate(since.getDate() - dateRange)

  Promise.all([
    // Total visits
    supabase.from('page_views').select('*', { count: 'exact', head: true })
      .gte('viewed_at', since.toISOString()),
    // Unique visitors
    supabase.from('page_views').select('visitor_id').gte('viewed_at', since.toISOString()),
    // Visits over time
    supabase.from('page_views').select('viewed_at').gte('viewed_at', since.toISOString()),
    // Top pages
    supabase.from('page_views').select('path').gte('viewed_at', since.toISOString()),
    // Referrers
    supabase.from('page_views').select('referrer').gte('viewed_at', since.toISOString()),
    // Device types
    supabase.from('page_views').select('device_type').gte('viewed_at', since.toISOString()),
    // Project clicks
    supabase.from('page_views').select('project_clicked, projects(title)')
      .not('project_clicked', 'is', null).gte('viewed_at', since.toISOString()),
  ]).then(([total, unique, timeline, pages, referrers, devices, clicks]) => {
    // Process and set state
  })
}, [dateRange])
```

**Chart components (using recharts):**
- `LineChart` for visits over time
- `BarChart` (horizontal) for top pages and project clicks
- `PieChart` (donut) for referrer sources and device breakdown
- All charts share a consistent dark theme matching the admin portal

**Performance note:** For a portfolio site with low traffic, raw queries are fine. If traffic grows significantly, consider:
- Adding a Materialized View for daily aggregates
- Using Supabase Edge Functions for pre-computed stats
- Partitioning the `page_views` table by month

### 13.4 SQL RLS Policy for Analytics

```sql
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (anonymous visitors)
CREATE POLICY "Anon can insert page views" ON page_views
  FOR INSERT WITH CHECK (true);

-- Only authenticated users (admin) can view analytics
CREATE POLICY "Auth can view page views" ON page_views
  FOR SELECT USING (auth.role() = 'authenticated');

-- Auth users can delete old data (cleanup)
CREATE POLICY "Auth can delete page views" ON page_views
  FOR DELETE USING (auth.role() = 'authenticated');
```

### 13.5 Adding Analytics to the SQL Setup Script

Add this to the tables section of the SQL setup script:

```sql
-- 12. PAGE VIEWS (Analytics)
CREATE TABLE page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  path text NOT NULL,
  referrer text,
  country text,
  device_type text,
  browser text,
  project_clicked uuid REFERENCES projects(id) ON DELETE SET NULL,
  viewed_at timestamptz DEFAULT now()
);

-- Indexes for faster analytics queries
CREATE INDEX idx_page_views_path ON page_views(path);
CREATE INDEX idx_page_views_visitor ON page_views(visitor_id);
CREATE INDEX idx_page_views_viewed_at ON page_views(viewed_at);
CREATE INDEX idx_page_views_project_clicked ON page_views(project_clicked);
```

And add this to the RLS policies section:

```sql
-- PAGE VIEWS (Analytics)
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon can insert page views" ON page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth can view page views" ON page_views FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth can delete page views" ON page_views FOR DELETE USING (auth.role() = 'authenticated');
```

---

## 14. Supabase SQL Setup Script

This script should be run in the Supabase SQL Editor after creating a new project.

```sql
-- ============================================
-- SUPABASE PORTFOLIO DATABASE SETUP
-- Run this in the Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- 1. PROFILE (single row)
CREATE TABLE profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL DEFAULT 'Dhruv Thakar',
  typed_roles text[] NOT NULL DEFAULT ARRAY['Software Engineer', 'Computer Science Student', 'Full-Stack Developer', 'Cloud Enthusiast'],
  bio_story text[] NOT NULL,
  interests jsonb,
  fun_facts jsonb,
  social_links jsonb,
  resume_url text,
  footer_badges text[],
  updated_at timestamptz DEFAULT now()
);

-- 2. EXPERIENCES
CREATE TABLE experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization text NOT NULL,
  organization_sub text,
  employment_type text,
  role_title text NOT NULL,
  date_range text NOT NULL,
  location text,
  work_mode text DEFAULT 'Hybrid',
  description text,
  bullets text[],
  skills_used text[],
  logo_url text,
  is_featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. PROJECTS
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon_class text,
  badge text,
  features text[],
  tech_stack text[],
  categories text[],
  live_url text,
  code_url text,
  is_disabled boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. SKILL GROUPS
CREATE TABLE skill_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name text NOT NULL,
  icon_class text,
  display_order integer DEFAULT 0
);

-- 5. SKILLS
CREATE TABLE skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_group_id uuid REFERENCES skill_groups(id) ON DELETE CASCADE,
  name text NOT NULL,
  proficiency integer NOT NULL CHECK (proficiency >= 0 AND proficiency <= 100),
  icon_class text,
  level text,
  details text[],
  related_project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  display_order integer DEFAULT 0
);

-- 6. CERTIFICATIONS
CREATE TABLE certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  issuer text NOT NULL,
  issued_date text,
  credential_id text,
  credential_url text,
  tags text[],
  category text,
  is_featured boolean DEFAULT false,
  learned text,
  applied text,
  applied_project text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 7. BLOG POSTS
CREATE TABLE blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  excerpt text,
  cover_image_url text,
  tags text[],
  status text CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 8. EDUCATION
CREATE TABLE education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution text NOT NULL,
  degree text NOT NULL,
  logo_url text,
  progress_percent integer DEFAULT 50,
  focus_areas text[],
  highlights jsonb,
  is_active boolean DEFAULT true
);

-- 9. BEYOND STATS
CREATE TABLE beyond_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  value text NOT NULL,
  icon text,
  display_order integer DEFAULT 0
);

-- 10. GOALS
CREATE TABLE goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text CHECK (type IN ('short', 'long')),
  title text NOT NULL,
  description text NOT NULL,
  progress_percent integer DEFAULT 0,
  milestones text[]
);

-- 11. CONTACT SUBMISSIONS
CREATE TABLE contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  received_at timestamptz DEFAULT now()
);

-- 12. PAGE VIEWS (Analytics)
CREATE TABLE page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  path text NOT NULL,
  referrer text,
  country text,
  device_type text,
  browser text,
  project_clicked uuid REFERENCES projects(id) ON DELETE SET NULL,
  viewed_at timestamptz DEFAULT now()
);

-- Indexes for faster analytics queries
CREATE INDEX idx_page_views_path ON page_views(path);
CREATE INDEX idx_page_views_visitor ON page_views(visitor_id);
CREATE INDEX idx_page_views_viewed_at ON page_views(viewed_at);
CREATE INDEX idx_page_views_project_clicked ON page_views(project_clicked);

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profile_updated_at BEFORE UPDATE ON profile
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experiences_updated_at BEFORE UPDATE ON experiences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON certifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- PROFILE: Public read, authenticated upsert
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view profile" ON profile FOR SELECT USING (true);
CREATE POLICY "Auth can upsert profile" ON profile FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth can update profile" ON profile FOR UPDATE USING (auth.role() = 'authenticated');

-- EXPERIENCES
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view experiences" ON experiences FOR SELECT USING (true);
CREATE POLICY "Auth can manage experiences" ON experiences FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- PROJECTS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Auth can manage projects" ON projects FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- SKILL GROUPS
ALTER TABLE skill_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view skill_groups" ON skill_groups FOR SELECT USING (true);
CREATE POLICY "Auth can manage skill_groups" ON skill_groups FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- SKILLS
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view skills" ON skills FOR SELECT USING (true);
CREATE POLICY "Auth can manage skills" ON skills FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- CERTIFICATIONS
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view certifications" ON certifications FOR SELECT USING (true);
CREATE POLICY "Auth can manage certifications" ON certifications FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- BLOG POSTS: Public only sees published
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published posts" ON blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Auth can view all posts" ON blog_posts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth can manage posts" ON blog_posts FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- EDUCATION
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view education" ON education FOR SELECT USING (true);
CREATE POLICY "Auth can manage education" ON education FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- BEYOND STATS
ALTER TABLE beyond_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view beyond_stats" ON beyond_stats FOR SELECT USING (true);
CREATE POLICY "Auth can manage beyond_stats" ON beyond_stats FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- GOALS
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view goals" ON goals FOR SELECT USING (true);
CREATE POLICY "Auth can manage goals" ON goals FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- CONTACT SUBMISSIONS
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon can insert contact submissions" ON contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth can view contact submissions" ON contact_submissions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth can update contact submissions" ON contact_submissions FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth can delete contact submissions" ON contact_submissions FOR DELETE USING (auth.role() = 'authenticated');

-- PAGE VIEWS (Analytics)
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon can insert page views" ON page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth can view page views" ON page_views FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth can delete page views" ON page_views FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public) VALUES
  ('project-images', 'project-images', true),
  ('logos', 'logos', true),
  ('cert-images', 'cert-images', true),
  ('blog-images', 'blog-images', true),
  ('resumes', 'resumes', true);

-- Storage policies
CREATE POLICY "Public read all buckets" ON storage.objects FOR SELECT
  USING (bucket_id IN ('project-images', 'logos', 'cert-images', 'blog-images', 'resumes'));

CREATE POLICY "Auth can upload" ON storage.objects FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Auth can update" ON storage.objects FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Auth can delete" ON storage.objects FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- SETUP COMPLETE
-- ============================================
```

---

## 15. Environment Variables

### `.env` (local development)

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key

# For seed script only (never shipped to frontend)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Existing Formspree config
VITE_FORMSPREE_FORM_ID=mwpabokg
```

### Production (Vercel / Netlify)

Set in deployment dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_FORMSPREE_FORM_ID`

**Important:** Never commit `SUPABASE_SERVICE_ROLE_KEY` to the frontend. It's only used by the seed script running locally with Node.js.

---

## 16. Implementation Checklist

### Phase 1: Setup (2–3 hours)
- [ ] Create Supabase project at https://supabase.com
- [ ] Run SQL setup script in Supabase SQL Editor
- [ ] Create admin user in Supabase Auth dashboard (Email/Password)
- [ ] Verify storage buckets were created
- [ ] Install dependencies: `npm install @supabase/supabase-js react-hook-form @hookform/resolvers zod react-markdown remark-gfm`
- [ ] Create `.env` with Supabase credentials
- [ ] Create `src/lib/supabase.js`

### Phase 2: Context Refactor (3–4 hours)
- [ ] Create `src/hooks/useSupabaseQuery.js` (generic fetch hook)
- [ ] Refactor `PortfolioContext.jsx` to fetch from Supabase
- [ ] Add fallback to static data from `src/data/*.js`
- [ ] Test that all pages render identically to before
- [ ] Verify loading states and error handling

### Phase 3: Seeding (2–3 hours)
- [ ] Create `src/scripts/seed-supabase.js`
- [ ] Map all current data file structures to database inserts
- [ ] Run seed script: `node src/scripts/seed-supabase.js`
- [ ] Verify data in Supabase dashboard table editor
- [ ] Verify site renders correctly with seeded data
- [ ] Upload asset images to storage, update URLs in DB

### Phase 4: Admin Auth & Layout (3–4 hours)
- [ ] Create `src/hooks/useAuth.js`
- [ ] Create `src/pages/admin/AdminLogin.jsx`
- [ ] Create `src/pages/admin/AdminLayout.jsx` with sidebar
- [ ] Create `src/components/admin/AdminSidebar.jsx`
- [ ] Create `src/components/admin/AdminHeader.jsx`
- [ ] Create `ProtectedRoute` component in `App.jsx`
- [ ] Add admin routes to `App.jsx`
- [ ] Test login/logout flow
- [ ] Test that unauthenticated access redirects to `/admin/login`

### Phase 5: Admin CRUD Pages (8–12 hours)
- [ ] Create Zod schemas in `src/schemas/` for all content types
- [ ] Create `src/components/admin/DataTable.jsx` (reusable)
- [ ] Create `src/components/admin/AdminForm.jsx` (reusable)
- [ ] Create `src/components/admin/ImageUploader.jsx` (reusable)
- [ ] Create `src/components/admin/MarkdownEditor.jsx` (reusable)
- [ ] Create `src/components/admin/StatusBadge.jsx`
- [ ] Build `src/pages/admin/AdminDashboard.jsx`
- [ ] Build `src/pages/admin/AdminProfile.jsx`
- [ ] Build `src/pages/admin/AdminExperiences.jsx`
- [ ] Build `src/pages/admin/AdminProjects.jsx`
- [ ] Build `src/pages/admin/AdminSkills.jsx`
- [ ] Build `src/pages/admin/AdminCertifications.jsx`
- [ ] Build `src/pages/admin/AdminBlog.jsx`
- [ ] Build `src/pages/admin/AdminBlogEditor.jsx`
- [ ] Build `src/pages/admin/AdminMessages.jsx`
- [ ] Build `src/pages/admin/AdminEducation.jsx`

### Phase 6: Contact Integration (1–2 hours)
- [ ] Update `Contact.jsx` with dual submission to Supabase
- [ ] Test that messages appear in `/admin/messages`
- [ ] Test marking messages as read/unread

### Phase 7: Analytics Integration (2–3 hours)
- [ ] Install `recharts` and `date-fns`
- [ ] Create `src/hooks/usePageView.js` tracking hook
- [ ] Add `usePageView()` to `App.jsx` or `Layout.jsx`
- [ ] Add `trackProjectClick()` to project card/modal components
- [ ] Build `src/components/admin/AnalyticsChart.jsx` reusable chart wrapper
- [ ] Build `src/pages/admin/AdminAnalytics.jsx` dashboard
- [ ] Test tracking works (visit pages, verify rows in `page_views` table)
- [ ] Test charts render with real data
- [ ] Test time range selector updates all charts

### Phase 8: Polish & Deploy (3–4 hours)
- [ ] Test all admin CRUD operations end-to-end
- [ ] Test analytics dashboard with real traffic data
- [ ] Test mobile responsiveness of admin portal
- [ ] Test fallback when Supabase is unreachable
- [ ] Deploy frontend with environment variables
- [ ] Final production testing

---

## Appendix A: Estimated Timeline

| Phase | Duration | Complexity |
|---|---|---|
| Phase 1: Setup | 2–3 hours | Low |
| Phase 2: Context Refactor | 3–4 hours | Medium |
| Phase 3: Seeding | 2–3 hours | Medium |
| Phase 4: Auth & Layout | 3–4 hours | Medium |
| Phase 5: CRUD Pages | 8–12 hours | High |
| Phase 6: Contact Integration | 1–2 hours | Low |
| Phase 7: Analytics Integration | 2–3 hours | Medium |
| Phase 8: Polish & Deploy | 3–4 hours | Medium |
| **Total** | **24–35 hours** | — |

## Appendix B: Future Enhancements

- **Real-time updates** with Supabase subscriptions (admin sees changes instantly without refresh)
- **Image optimization** via Supabase Image Transformation API
- **Formspree webhook → Supabase Edge Function** for cleaner contact submission sync
- **Public blog page** with `/blog/:slug` route on the portfolio site
- **Admin activity audit log** (track who changed what and when)
- **Role-based access** (if you want to give someone else limited admin access)
- **Automated backups** of Supabase data (Supabase Pro includes this)
- **Scheduled posts** (set a future `published_at` date)
- **SEO meta tags** per blog post (og:image, description, etc.)
- **Advanced analytics** — geographic heat map, session duration, bounce rate, conversion funnel
- **Materialized views** for pre-aggregated analytics stats (if traffic grows significantly)
- **Export analytics** — download CSV/PDF reports from the admin dashboard
