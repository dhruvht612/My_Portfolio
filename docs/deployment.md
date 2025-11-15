# Deployment & Hosting

This document outlines common workflows for running, building, and deploying the portfolio.

## Local Development

```bash
npm install
npm run dev
```

- Vite serves at `http://localhost:5173`.
- Hot Module Replacement (HMR) keeps edits instant.
- Update environment-specific values via `.env` if needed (see below).

## Linting & Testing

```bash
npm run lint
```

- Uses the ESLint config defined in `eslint.config.js`.
- Run before committing to catch common issues.

## Production Build

```bash
npm run build
```

- Outputs static assets to `dist/`.
- Preview locally with `npm run preview`.

## Hosting Options

| Platform | Notes |
| -------- | ----- |
| GitHub Pages | Push the `dist/` output via GitHub Actions or manual upload. |
| Netlify | Connect the repo, set build command to `npm run build`, publish directory `dist`. |
| Vercel | Similar setup; Vercel auto-detects Vite. Supports edge functions if you add a backend later. |
| Static Hosts (S3, Firebase, Cloudflare Pages) | Upload the `dist/` folder contents; configure SPA fallback if using client-side routing. |

## Environment Variables

- Create `.env` files (e.g., `.env.local`, `.env.production`) if you add API keys.
- Prefix variables with `VITE_` so they are exposed to the client: `VITE_CONTACT_ENDPOINT=https://api.example.com/contact`.
- Access in code via `import.meta.env.VITE_CONTACT_ENDPOINT`.

## Backend & API Integration

- If you later introduce a backend (Express, serverless functions, Supabase, etc.), store the base URL in `VITE_API_BASE`.
- Use `fetch`/`axios` in `useEffect` hooks or custom hooks to load dynamic data instead of importing from `src/data/`.

## Continuous Deployment Tips

- Keep `dist/` out of version control; let the hosting provider build from source.
- Add quality gates in your CI pipeline (lint, tests) before the deploy job.
- Invalidate CDN cache (if any) after each release to ensure visitors receive the latest assets.

That’s it—once `dist/` is online, the portfolio is live. Update the documentation if you add additional environments or deployment steps.

