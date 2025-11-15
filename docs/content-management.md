# Content Management Guide

The portfolio is intentionally data-driven so you can edit text, images, and links without touching component logic. This guide covers the most common updates.

## Projects (`src/data/projects.js`)

- Each project object supports:
  - `id`, `title`, `description`
  - `iconClass`: Font Awesome icon class
  - `badge`: optional `{ label, icon, gradient }`
  - `features`: array of bullet strings
  - `tech`: array of strings rendered as chips
  - `categories`: used by filter buttons (`PROJECT_FILTERS`)
  - `links`: `{ live, code }` used for the two CTA buttons
  - `disabled`: true/false flag for coming-soon cards
- To add a new filter, append to `PROJECT_FILTERS` at the top of the file and ensure project categories reference the new `id`.

## Certifications (`src/data/certifications.js`)

- Each certification includes issuer, credential ID/URL, issue date, and optional logo via `MEDIA`.
- Logos are centrally defined in `src/constants/media.js` so they can be reused elsewhere.

## Skills (`src/data/skills.js`)

- Organized by skill groups with `title`, `icon`, and an array of `items`.
- Each skill item includes `name`, `level` (percent), and optional `description`.
- Progress bars animate to their `level` when scrolled into view.

## About Tabs (`src/data/about.js`)

- Tabs are keyed by `id`. `activeTab` state in `About` determines which content is visible.
- Each tab object can include `title`, `summary`, `bullets`, and `cta`.

## Leadership & Beyond (`src/data/leadership.js`)

- Stores cards for leadership roles highlighted in the Beyond section.
- Each role can include dates, impact points, and icons.

## Media Assets

- Place new images inside `src/assets/` and map them in `src/constants/media.js`.
- Import those constants wherever needed (e.g., certification logos).

## Tips

- Keep IDs unique to avoid React key warnings.
- Prefer HTTPS links for external resources.
- Use descriptive `badge` gradients to maintain the visual hierarchy.
- Test on both mobile and desktop after major data updates.

Following this structure keeps the portfolio maintainable and makes future automation (e.g., hooking up a CMS or backend) much easier.

