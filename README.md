# Dhruv Thakar — Portfolio

[![React](https://img.shields.io/badge/React-19-0a0a23?logo=react&logoColor=61dafb)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-0a0a23?logo=vite&logoColor=ffd62e)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-0f172a?logo=tailwindcss&logoColor=38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-0f172a.svg)](#license)

A modern, dark-themed portfolio built with React and Vite. Features a landing page, multi-route layout (About, Projects, Beyond, Experience, Education, Certifications, Skills, Contact), fixed navigation, and a Technical Skills section where each skill is clickable and opens a modal listing projects that use that technology.

---

## Table of Contents

1. [Features](#-features)
2. [Tech Stack](#-tech-stack)
3. [Getting Started](#-getting-started)
4. [Project Structure](#-project-structure)
5. [Content & Data](#-content--data)
6. [Deployment](#-deployment)
7. [License](#license)

---

## Features

| Section | Description |
| --- | --- |
| **Landing** | Entry page with “Enter Portfolio” CTA; routes to `/home`. |
| **Hero (Home)** | Animated typing roles, quick stats, link to Projects. |
| **About** | Profile, story/interests/fun facts tabs, counters, resume + contact CTAs. |
| **Projects** | Filterable project cards (Trail, Wisely, QR Code Generator, Huffman Compression, Book Catalog, Before the Appointment, Farm Flight) with tech icons, hover animations, and links. |
| **Beyond** | Leadership stats and short/long-term goals. |
| **Experience** | Timeline of roles with expandable descriptions. |
| **Education** | Ontario Tech University, focus areas, highlight cards. |
| **Certifications** | Grid of credentials with issuer and links. |
| **Skills** | Category filters (All, Programming, Data, Web, Tools). Each skill is a **clickable button**; clicking opens a **modal** titled “Projects using {Skill}” with a list of related projects (name, description, GitHub link). Modal closes via X button or clicking outside. |
| **Contact** | Contact cards and Formspree-powered form. |

- **Navigation:** Fixed top bar with logo, nav links, and Contact button. Active route is highlighted via React Router. Smooth scroll for in-page navigation.
- **Styling:** Dark theme with gradient background (`theme-dark-blue-page`), glass-style panels, and consistent section headers (decorative line + icon + title + subtitle).
- **Accessibility:** Skip link, focus rings, semantic HTML, and ARIA where needed.

---

## Tech Stack

| Layer | Tools |
| --- | --- |
| Framework | React 19, React Router 7 |
| Build | Vite 7 |
| Styling | Tailwind CSS 3, custom CSS variables, Font Awesome icons |
| Forms | Formspree (contact) |
| State | React hooks (`useState`, `useMemo`, `useCallback`, `useRef`) |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:5173

# Lint
npm run lint

# Production build
npm run build
npm run preview
```

**Environment:** Use `.env.local` for secrets. For the contact form, set `VITE_FORMSPREE_FORM_ID` to your Formspree form ID (e.g. `mwpabokg`). Access in code via `import.meta.env.VITE_FORMSPREE_FORM_ID`.

---

## Project Structure

```
├── src/
│   ├── components/     # Header, Hero, About, Projects, Beyond, Experience,
│   │                   # Education, Certifications, Skills, Contact, etc.
│   ├── pages/          # Route-level pages (HomePage, AboutPage, ProjectsPage, …)
│   ├── context/        # PortfolioContext (nav, projects, skills, stats, …)
│   ├── data/           # projects.js, skills.js, about.js, certifications.js,
│   │                   # experience.js, leadership.js
│   ├── constants/      # media.js (logos, images)
│   ├── App.jsx         # Router, Layout, Landing route
│   ├── main.jsx
│   └── index.css       # Tailwind + custom utilities (nav, cards, gradients)
├── public/             # Static assets, manifest
├── docs/               # Optional: overview, content-management, deployment
└── package.json
```

---

## Content & Data

- **Projects:** `src/data/projects.js` — `projects` array and `PROJECT_FILTERS`. Each project has `id`, `title`, `description`, `features`, `tech`, `categories`, `links`, optional `badge`.
- **Skills:** `src/data/skills.js` — `skillGroups` (Programming, Data & Analytics, Web Development, Databases & Tools) with items (name, percent, icon, level, details). The Skills component also defines a local `projects` list used for the “Projects using {Skill}” modal; update that array in `Skills.jsx` to change modal content.
- **About:** `src/data/about.js` — `aboutTabs` (story, interests, facts).
- **Certifications / Experience / etc.:** Other `src/data/*.js` files and `PortfolioContext` in `src/context/PortfolioContext.jsx` supply the rest of the content.

---

## Deployment

1. Run `npm run build` and deploy the `dist/` folder to Netlify, Vercel, GitHub Pages, or any static host.
2. Configure SPA fallback so all routes serve `index.html` (e.g. `/*` → `/index.html`).
3. Set `VITE_FORMSPREE_FORM_ID` (and any other `VITE_*` vars) in your host’s environment for production builds.

---

## License

MIT © Dhruv Thakar. See [LICENSE](./LICENSE) if present. Contributions welcome—open an issue or PR.

---

Built with React, Vite, and Tailwind CSS.
