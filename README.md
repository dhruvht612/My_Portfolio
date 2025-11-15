# Dhruv Thakar — Interactive Portfolio

[![React](https://img.shields.io/badge/React-18%2B-0a0a23?logo=react&logoColor=61dafb)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-0a0a23?logo=vite&logoColor=ffd62e)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-0f172a?logo=tailwindcss&logoColor=38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-0f172a.svg)](#license)

Modern, data-driven portfolio featuring animated hero content, filterable project cards, scroll-triggered storytelling, and an always-present chat widget. Built as a single-page experience with UX and accessibility at the core.

![Portfolio preview](./dist/assets/profile-CJGsTbJY.png)

---

## 📌 Quick Links

| Resource | Description |
| --- | --- |
| [`docs/overview.md`](./docs/overview.md) | Section-by-section walkthrough |
| [`docs/content-management.md`](./docs/content-management.md) | How to edit projects, skills, media |
| [`docs/deployment.md`](./docs/deployment.md) | Build, hosting, and env tips |

---

## 🔎 Table of Contents

1. [Feature Highlights](#-feature-highlights)
2. [Visual Architecture](#-visual-architecture)
3. [Tech Stack](#-tech-stack)
4. [Getting Started](#-getting-started)
5. [Project Layout](#-project-layout)
6. [Data-First Content Model](#-data-first-content-model)
7. [Accessibility & UX](#-accessibility--ux)
8. [Deployment](#-deployment)
9. [Roadmap](#-roadmap)
10. [License](#license)

---

## ✨ Feature Highlights

| Section | Key Experience | Visual Hook |
| --- | --- | --- |
| Hero | Animated typing loop + social CTAs | Gradient glow + stat pills |
| Projects | Filter chips, badges, GitHub/Live buttons | Hover lift + neon borders |
| Beyond | Leadership stories + goals | Multi-column timeline cards |
| Education | Coursework, hands-on, growth cards | Iconography + pastel gradients |
| Certifications | Logo grid with quick actions | Glass morphism panels |
| Chat Widget | Mini messenger with canned responses | Floating bubble + typing indicator |

---

## 🧭 Visual Architecture

```
┌─────────────────────────────────── App.jsx ────────────────────────────────────┐
│  Layout + data imports + global hooks (scroll, observers, typing effect)       │
│                                                                                │
│  Hero   About   Projects   Beyond   Education   Certifications   Skills   ...  │
│    ▲        ▲         ▲         ▲           ▲               ▲         ▲        │
│    │        │         │         │           │               │         │        │
│ src/data/about.js   src/data/projects.js  ...        src/data/skills.js       │
│                                                                                │
│  docs/      ← reference guides + workflows                                     │
└───────────────────────────────────────────────────────────────────────────────┘
```

All major sections consume plain JavaScript objects, keeping the UI stateless and easy to repurpose or connect to a backend later.

---

## 🧰 Tech Stack

| Layer | Tools |
| --- | --- |
| UI | React 19, JSX components, Font Awesome icons |
| Styling | Tailwind CSS, custom gradients, utility classes |
| State | React hooks (`useState`, `useEffect`, `useMemo`, `useRef`) |
| Animations | CSS transitions + `IntersectionObserver` for reveal effects |
| Tooling | Vite 7, ESLint 9, PostCSS, autoprefixer |

---

## ⚡ Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
# → http://localhost:5173

# 3. Optional: lint + format
npm run lint

# 4. Production build & preview
npm run build
npm run preview
```

Environment variables should be prefixed with `VITE_` and live in `.env.local`, `.env.production`, etc. Access via `import.meta.env.VITE_KEY_NAME`. For the contact form, set `VITE_FORMSPREE_FORM_ID=mwpabokg` (replace with your Formspree form ID).

---

## 🗂 Project Layout

```
├── src
│   ├── components/        # Hero, Projects, Beyond, etc.
│   ├── data/              # Pure JS objects powering each section
│   ├── constants/media.js # Central asset map
│   ├── assets/            # Logos, portraits, background art
│   ├── index.css          # Tailwind base + custom utilities
│   └── main.jsx           # React entry point
├── docs/                  # Supplemental documentation (overview, content, deploy)
├── public/                # Manifest, favicons
└── dist/                  # Build output (after npm run build)
```

---

## 🧱 Data-First Content Model

- **Projects:** `src/data/projects.js`
  - Filters (`PROJECT_FILTERS`), badges, feature lists, tech tags, action links
  - Disabled cards display “In Development / Coming Soon”
- **Skills:** `src/data/skills.js`
  - Progress bars animate to `level` percentages when visible
- **Certifications:** `src/data/certifications.js`
  - Credential IDs, verification URLs, and logos via `MEDIA`
- **Hero + Contact:** Configured in `src/App.jsx` constants for quick edits

> 📄 Deep dive instructions live in [`docs/content-management.md`](./docs/content-management.md).

---

## ♿ Accessibility & UX

- Skip-link allows keyboard users to jump straight to `#main-content`
- Focus rings tuned for dark backgrounds with `focus:ring-offset`
- Animated counters and project cards trigger only when scrolled into view to avoid motion overload
- Filters use `aria-pressed` and `role="group"` for screen reader context
- Theme toggle flips a `dark` class on `<html>` to enable future light mode styling

---

## 🚀 Deployment

- Static build via `npm run build` → deploy `dist/` to Netlify, Vercel, GitHub Pages, etc.
- Configure SPA fallback (`/*` → `/index.html`) on hosts that require it.
- For CD pipelines: run `npm run lint && npm run build` before publishing.
- Considering a backend? Store the base URL in `VITE_API_BASE` and fetch data instead of importing from `src/data/`.

More hosting scenarios and CI tips are documented in [`docs/deployment.md`](./docs/deployment.md).

---

## 🗺 Roadmap

- [ ] Light mode + theme persistence
- [ ] API-powered content (Supabase / headless CMS)
- [ ] Contact form submission endpoint
- [ ] Unit tests for data-transform helpers (filters, counters)
- [x] Documentation suite (`docs/overview.md`, `docs/content-management.md`, `docs/deployment.md`)

---

## License

MIT © Dhruv Thakar. See [LICENSE](./LICENSE) if/when added. Contributions welcome—open an issue or PR to propose improvements.

---

Built with ❤️ using React, Vite, and Tailwind CSS. Enjoy exploring the codebase!
