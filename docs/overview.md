# Portfolio Overview

This document explains the main experience of the portfolio site, the purpose of each section, and how data flows through the app.

## Entry Flow

1. **Preloader:** Displays a branded loading animation while assets bootstrap. Controlled by `isLoading` state in `src/App.jsx`.
2. **Header:** Sticky navigation with theme toggle, scroll progress bar, and responsive mobile drawer.
3. **Hero:** Animated typing effect cycling through roles, with quick stats and CTA social icons.

## Content Sections

| Section | Component | Data Source | Notes |
| ------- | --------- | ----------- | ----- |
| About | `src/components/About.jsx` | `src/data/about.js` | Tabbed layout with counters. |
| Projects | `src/components/Projects.jsx` | `src/data/projects.js` | Supports filters, badges, tech chips, and GitHub/Live buttons. |
| Beyond | `src/components/Beyond.jsx` | `src/data/leadership.js` | Highlights leadership roles and goals. |
| Education | `src/components/Education.jsx` | Inline constants in `App.jsx` | Focus areas and highlight cards. |
| Certifications | `src/components/Certifications.jsx` | `src/data/certifications.js` | Grid of verified credentials. |
| Skills | `src/components/Skills.jsx` | `src/data/skills.js` | Progress bars animated on scroll. |
| Contact | `src/components/Contact.jsx` | constants in `App.jsx` | Contact cards + alternative links. |
| Footer | `src/components/Footer.jsx` | constants in `App.jsx` | Re-uses nav and social data. |

## Interactions & Animations

- **Intersection Observers:** Trigger counters, skill bars, and card fade-ins once sections enter view.
- **Project Filters:** Buttons update `projectFilter` state, and `useMemo` computes the filtered list.
- **Chat Widget:** Toggleable floating widget storing messages in component state.
- **Theme Toggle:** Adds/removes the `dark` class on `<html>` and updates state for header styling.

## Data Flow

1. All content arrays/objects are imported into `src/App.jsx`.
2. `App` passes them down as props to components.
3. Components render purely from props, keeping UI consistent and easy to update.

## Accessibility Considerations

- `SkipLink` enables quick keyboard navigation to the main content.
- Buttons and filters expose ARIA attributes (e.g., `aria-pressed`).
- Focus rings and contrast-friendly colors help maintain readability.

Use this overview as a quick reference when extending the site or onboarding collaborators.

