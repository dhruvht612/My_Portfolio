# Dhruv Thakar - Portfolio

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=120&color=0:0f172a,100:1e293b&section=header" alt="header wave" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=600&size=24&duration=2800&pause=900&color=38BDF8&center=true&vCenter=true&width=900&lines=Modern+React+Portfolio;Animated+UI+%7C+Data-Driven+Sections;Built+with+Vite+%2B+Tailwind+%2B+Framer+Motion" alt="typing intro banner" />
</p>

<p align="center">
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-0a0a23?logo=react&logoColor=61dafb" alt="React 19" /></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-7-0a0a23?logo=vite&logoColor=ffd62e" alt="Vite 7" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind-3-0f172a?logo=tailwindcss&logoColor=38bdf8" alt="Tailwind CSS 3" /></a>
  <a href="https://reactrouter.com/"><img src="https://img.shields.io/badge/React_Router-7-0f172a?logo=reactrouter&logoColor=f97316" alt="React Router 7" /></a>
  <a href="https://www.framer.com/motion/"><img src="https://img.shields.io/badge/Framer_Motion-Animation-0f172a?logo=framer&logoColor=ff66cc" alt="Framer Motion" /></a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript"><img src="https://img.shields.io/badge/JavaScript-ES2024-0f172a?logo=javascript&logoColor=facc15" alt="JavaScript ES2024" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-18%2B-0f172a?logo=nodedotjs&logoColor=22c55e" alt="Node.js 18+" /></a>
  <a href="https://eslint.org/"><img src="https://img.shields.io/badge/ESLint-9-0f172a?logo=eslint&logoColor=a78bfa" alt="ESLint 9" /></a>
  <a href="../../"><img src="https://img.shields.io/badge/Status-Actively_Improving-0f172a?logo=github&logoColor=38bdf8" alt="Status Actively Improving" /></a>
  <a href="#license"><img src="https://img.shields.io/badge/License-MIT-0f172a.svg" alt="License MIT" /></a>
</p>

Modern, dark-themed, data-driven developer portfolio built with React + Vite. The app includes a landing flow, multi-route pages, animated sections, filterable projects, and an interactive skills-to-projects modal.

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=100&color=0:1e293b,100:0f172a&section=footer" alt="footer wave" />
</p>

## What This Portfolio Includes

- Landing experience with preloader and entry CTA.
- Route-based pages for About, Projects, Beyond, Experience, Education, Certifications, Skills, and Contact.
- Reusable section UI with gradients, glassmorphism cards, and motion effects.
- Projects section with category filters and rich metadata.
- Skills section where each skill can open a modal showing related projects.
- Accessibility basics such as skip links, focus states, semantic markup, and ARIA usage.

## Tech Stack

| Layer | Tools |
| --- | --- |
| Frontend | React 19, React Router 7 |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS 3, custom CSS utilities, icon libraries |
| Forms | Formspree (`@formspree/react`) |
| Motion | Framer Motion |
| Quality | ESLint 9 |

## Quick Start

### Prerequisites

- Node.js 18+ (or current LTS)
- npm

### Run Locally

```bash
npm install
npm run dev
```

Local URL: `http://localhost:5173`

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Starts the Vite development server |
| `npm run build` | Creates an optimized production build in `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | Runs ESLint checks |

## Environment Variables

Create a `.env.local` file in the project root:

```bash
VITE_FORMSPREE_FORM_ID=your_form_id_here
```

- Variables must be prefixed with `VITE_` to be available in client code.
- Access them with `import.meta.env`, for example:
  `import.meta.env.VITE_FORMSPREE_FORM_ID`

## Project Structure

```text
.
├── src/
│   ├── components/      # Reusable sections and UI building blocks
│   ├── pages/           # Route-level page wrappers
│   ├── data/            # Portfolio content (projects, skills, about, etc.)
│   ├── context/         # Shared app-level context/providers
│   ├── constants/       # Shared constants/media maps
│   ├── hooks/           # Custom hooks (scroll, effects, canvas behavior)
│   ├── App.jsx
│   └── main.jsx
├── public/              # Static assets, PDFs, manifest
├── docs/                # Extended project docs
├── index.html
└── package.json
```

## Customization Guide

### Update Content

- Projects: `src/data/projects.js`
- Skills: `src/data/skills.js`
- About: `src/data/about.js`
- Certifications: `src/data/certifications.js`
- Leadership/Beyond: `src/data/leadership.js`
- Experience: `src/data/experience.js`

### Update Visual Assets

- Add/update files in `src/assets/`
- Map reusable media references in `src/constants/media.js`

### Update Resume Files

- Replace resume PDFs in `public/` while preserving filenames used by the UI.

## Deployment

Build and deploy the `dist/` folder to any static host:

1. `npm run build`
2. Configure SPA fallback so non-root routes return `index.html`
3. Add production environment variables (`VITE_FORMSPREE_FORM_ID`, etc.)

See also: `docs/deployment.md`

## Additional Documentation

- `docs/overview.md`
- `docs/content-management.md`
- `docs/deployment.md`

## Troubleshooting

- If a route 404s in production, verify SPA fallback rewrites are enabled.
- If contact submissions fail, confirm `VITE_FORMSPREE_FORM_ID` is set correctly.
- If styles look off, run a clean install (`rm -rf node_modules package-lock.json && npm install`) and restart the dev server.

## License

MIT (see `LICENSE` if present).
