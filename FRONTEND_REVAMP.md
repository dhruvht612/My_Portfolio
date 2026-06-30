# Frontend Revamp Plan — "Orbital"

> A senior UI/UX direction for rebuilding the portfolio's frontend into a modern, techy, 3D scroll-driven experience.
> Author: design review pass · Date: 2026-06-29 · Stack: React 19 + Vite 7 + Tailwind 3 + Framer Motion

---

## 0. TL;DR

Your portfolio is technically strong but **visually generic-dark-SaaS**: royal-blue glassmorphism, a 3,632-line monolithic `index.css`, four competing class-naming systems, and animations that all fire at once with no `prefers-reduced-motion` guard. It looks like a thousand other dev portfolios.

This plan rebuilds it around one **signature idea — "Orbital"**: your work, skills, and timeline rendered as a navigable system you *scroll through in depth*, not a stack of cards you scroll past. We keep the React/Vite/Supabase/Framer foundation, throw away the styling chaos, and install a real design system with a 3D scroll spine.

Three phases, shippable incrementally. Public site first (the part that gets you hired), admin second.

---

## 1. Design thesis

**Subject:** A full-stack engineer who builds ambitious, systems-heavy software (you literally built an admin "capability OS" with AI insights and system-health monitoring). The portfolio should feel *engineered*, not *decorated*.

**The one job of the homepage:** In 5 seconds, make a recruiter/CTO think *"this person operates at a higher level than the portfolio template crowd."*

**Signature element — the Orbital Spine:** A persistent depth-based scroll metaphor. As you scroll, the camera moves *through* a 3D field — projects orbit, skills cluster as a constellation, the experience timeline recedes into Z-depth. It is the one bold thing; everything else (type, spacing, color) stays disciplined so the motion reads as craft, not noise.

> Risk we're taking on purpose: depth-scroll + WebGL hero. Justified because you're a builder of complex systems — the medium *is* the message. We mitigate the risk with a hard `prefers-reduced-motion` fallback (full static layout) and lazy-loaded WebGL so it never blocks first paint.

---

## 2. What's wrong today (from the audit)

| # | Problem | Impact |
|---|---------|--------|
| 1 | `index.css` is 3,632 lines of hand-written `.set-*`, `.sk-*`, `.adm-sk-*`, `.idf-*` utility classes | Unmaintainable; every new feature adds more |
| 2 | Four styling systems coexist (Tailwind + inline `var()` + prefixed CSS + glass templates) | No source of truth; inconsistent results |
| 3 | Public palette (`#7dd3fc`/`#4169e1`) ≠ admin palette (`#a78bfa`/`#22d3ee`) | Feels like two different products |
| 4 | `--color-orange: #3b82f6` is actually blue | Token names lie; nobody trusts them |
| 5 | Particles + shader grid + floating circles + liquid glass all render at once | Jank on mid/low-end devices |
| 6 | No `prefers-reduced-motion`, no light mode, no theme switch | A11y + preference gaps |
| 7 | Admin workspaces each ship their own `*AmbientBackground`, `*HeroPanel`, `*AIInsights` | Massive duplication |
| 8 | No error boundaries, inconsistent skeleton coverage | Blank screens on failure |
| 9 | DM Sans for everything | No typographic personality or hierarchy |

**Strengths to keep:** React 19, Vite, Supabase, Framer Motion, react-hook-form + Zod, the command palette (Cmd+K), skip links and ARIA already present, the holographic-card / shader-grid primitives (repurpose them).

---

## 2.5 Library strategy — how M3, Aceternity, React Bits & Three.js coexist

You asked for four libraries. Three of them overlap, so the senior move is to assign each a **single clear job** and stop them from competing. Layered, not stacked:

```
┌─ LANGUAGE ────────────────────────────────────────────┐
│  Material 3  → design-token + interaction grammar      │
│  (color roles, elevation, state layers, motion specs,  │
│   a11y/touch targets) — drives our token file & admin  │
├─ FLOURISH ────────────────────────────────────────────┤
│  Aceternity UI → hero-grade marquee effects (public)   │
│  React Bits    → smaller animated text/UI accents      │
│  (both are copy-in Framer/Tailwind snippets, NOT deps) │
├─ DEPTH ───────────────────────────────────────────────┤
│  Three.js (via @react-three/fiber) → the Orbital spine │
└───────────────────────────────────────────────────────┘
```

**The rule that keeps it coherent:** every component from every library is **re-skinned to our tokens (Section 3) before it ships.** A pasted Aceternity card must use `--surface`/`--signal`, not its default zinc/indigo. This is what stops "four libraries" from looking like four websites.

### Material 3 — the grammar, not the skin
Don't import Google's `@material/web` components wholesale (they carry Roboto + Google's look and will fight your custom aesthetic). Instead **adopt M3's *system***:
- **Color roles** — map M3's semantic roles (`primary`, `on-primary`, `surface`, `surface-container`, `outline`, etc.) onto our palette. This makes our tokens principled instead of ad-hoc.
- **Elevation & state layers** — M3's tonal-elevation + hover/focus/pressed state-layer model replaces the random box-shadows in `index.css`.
- **Motion** — M3's emphasized/standard easing + duration tokens become our `--ease-*`/`--dur-*` values.
- **Accessibility** — M3's 48px touch targets, focus rings, contrast ratios = our quality floor.
- *(Optional)* Use Google's **Material Theme Builder** to generate the tonal palette from our `--signal` seed, then export as CSS vars.

> Net: M3 governs the **admin portal** strongly (it's a tool — M3 shines there) and provides the **token discipline** for the whole app. It does *not* dictate the public site's personality.

### Aceternity UI — public-site showpieces
Copy-paste components (MIT, Framer + Tailwind — no package lock-in). Use sparingly for moments that earn it:
- Aurora / background-beams behind the hero (as the *reduced-motion* fallback when WebGL is off).
- Bento grid for the Work/skills overview.
- Spotlight / card-hover effects on project cards (or keep your `react-parallax-tilt`).
- Animated tooltips, sticky-scroll reveal for the case-study overlay.

### React Bits — micro-accents
Smaller animated primitives (also copy-in): split/shiny/decrypting **text** effects for headlines and the mono eyebrows, animated counters for stats, magnetic buttons, gradient borders. Use for *detail*, not layout.

> Aceternity vs React Bits boundary: **Aceternity = sections/backgrounds, React Bits = text/buttons/counters.** No component does both jobs, so they never collide.

### Three.js — depth only (see Section 4)
All WebGL goes through `@react-three/fiber`. Aceternity/React Bits never touch the canvas; they live in the DOM layer above it.

---

## 3. The new design system ("foundation before features")

Everything below lives in **one place** and is the *only* source of truth. Kill the per-module CSS.

### 3.1 Color — "Deep Space + Signal"

Move off generic royal-blue. New palette: a near-black void, a single high-signal accent, and a warm contrast pop so it isn't another cold-blue portfolio.

```css
/* tokens.css — semantic, not literal */
:root {
  /* Canvas */
  --void:        #07080d;   /* base background */
  --void-2:      #0c0e16;   /* elevated surface */
  --surface:     #12151f;   /* card */
  --surface-hi:  #1a1e2b;   /* hover / raised card */

  /* Signal accent (the ONE bright color) */
  --signal:      #5eead4;   /* teal-mint — distinctive, not cyan-cliché */
  --signal-dim:  #2dd4bf;
  --signal-glow: rgba(94, 234, 212, 0.35);

  /* Warm contrast (used sparingly: CTAs, "now/featured") */
  --ember:       #ff7849;   /* a real orange this time */

  /* Ink */
  --ink:         #f4f6fb;
  --ink-muted:   #9aa3b8;
  --ink-faint:   #5a6275;

  /* Lines & states */
  --line:        rgba(255,255,255,0.08);
  --line-hi:     rgba(255,255,255,0.16);
  --ok:          #4ade80;
  --warn:        #fbbf24;
  --err:         #fb7185;

  /* --- Material 3 semantic role aliases (point at the tokens above) --- */
  --md-primary:            var(--signal);
  --md-on-primary:         var(--void);
  --md-surface:            var(--void);
  --md-surface-container:  var(--surface);
  --md-surface-container-high: var(--surface-hi);
  --md-on-surface:         var(--ink);
  --md-on-surface-variant: var(--ink-muted);
  --md-outline:            var(--line-hi);
  --md-error:              var(--err);
  /* M3 tonal elevation: stack these as background tints, not shadows */
  --md-elevation-1: rgba(255,255,255,0.03);
  --md-elevation-2: rgba(255,255,255,0.05);
  --md-elevation-3: rgba(255,255,255,0.08);
  /* M3 state layers: overlay at these opacities for hover/focus/press */
  --md-state-hover: 0.08;
  --md-state-focus: 0.12;
  --md-state-press: 0.12;
}
```

> M3 roles are **aliases**, so the whole app speaks Material 3's grammar while staying on our custom palette — and a future light theme just re-points these in `[data-theme="light"]`.
> One palette for **public AND admin** — that single change fixes "feels like two products."
> Light mode is a `[data-theme="light"]` override of these same tokens (Phase 3, optional but cheap once tokens are clean).

### 3.2 Typography — give it a voice

DM-Sans-for-everything is the most templated choice possible. Pair a characterful display face with a neutral body and your existing mono.

| Role | Face | Use |
|------|------|-----|
| Display | **Clash Display** or **Space Grotesk** | Hero headline, section titles, big numbers |
| Body | **Inter** (or keep DM Sans for body only) | Paragraphs, UI labels |
| Mono | **JetBrains Mono** (keep) | Code, data, eyebrows, timestamps |

Type scale (fluid, `clamp()`):

```css
--step--1: clamp(0.83rem, 0.8rem + 0.15vw, 0.94rem);
--step-0:  clamp(1rem,   0.95rem + 0.25vw, 1.13rem);
--step-1:  clamp(1.33rem, 1.2rem + 0.6vw, 1.8rem);
--step-2:  clamp(1.78rem, 1.5rem + 1.4vw, 2.8rem);
--step-3:  clamp(2.37rem, 1.8rem + 2.8vw, 4.5rem);
--step-4:  clamp(3.16rem, 2rem + 5.8vw, 7rem);   /* hero */
```

**Signature type treatment:** mono eyebrows in `--signal` with letter-spacing (`01 / PROJECTS`), display headlines tight-tracked, body relaxed. The mono/display contrast *is* the techy personality.

### 3.3 Spacing, radius, motion

```css
--space: 4px;            /* base unit; use multiples: 8,12,16,24,32,48,64,96 */
--radius:    10px;
--radius-lg: 18px;
--radius-xl: 28px;
--ease-out:  cubic-bezier(0.22, 1, 0.36, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
--dur-fast: 180ms; --dur: 320ms; --dur-slow: 600ms;
```

### 3.4 Tailwind wiring

Map these semantic tokens into `tailwind.config.js` so authoring is `bg-surface text-ink border-line` — never raw hex, never `var()` soup in class strings.

```js
theme: { extend: {
  colors: { void:'var(--void)', surface:'var(--surface)', signal:'var(--signal)',
            ember:'var(--ember)', ink:'var(--ink)', 'ink-muted':'var(--ink-muted)',
            line:'var(--line)' },
  fontFamily: { display:['Space Grotesk','sans-serif'], sans:['Inter','sans-serif'],
                mono:['JetBrains Mono','monospace'] },
  borderRadius: { DEFAULT:'var(--radius)', lg:'var(--radius-lg)', xl:'var(--radius-xl)' },
}}
```

---

## 4. The 3D scroll architecture

You asked for "3D scroll and all of it." Here's how to do it *without* tanking performance or accessibility.

### 4.1 Libraries to add

- **`@react-three/fiber`** + **`@react-three/drei`** — React-friendly Three.js for the WebGL scenes.
- **`lenis`** (Studio Freight) — smooth, inertia-based scroll that drives both DOM and 3D.
- Keep **Framer Motion** for DOM-layer reveals and micro-interactions.
- (Optional) **`@react-three/postprocessing`** for bloom on the signal accent.

### 4.2 The scroll spine pattern

A single `<ScrollCanvas>` fixed behind the DOM. Lenis reports scroll progress (0→1); that single value drives camera Z-position and per-section 3D state. DOM sections scroll normally *on top*, synced to the same progress.

```
┌──────────────────────────────────────┐
│  <ScrollCanvas/>  position:fixed       │  ← R3F scene, camera moves in Z
│   ┌──────────────────────────────┐    │
│   │  DOM sections (scroll)        │    │  ← Framer reveals, real content,
│   │   Hero · Work · Skills ·      │    │     fully readable / selectable
│   │   Experience · Contact        │    │
│   └──────────────────────────────┘    │
└──────────────────────────────────────┘
```

### 4.3 Per-section 3D treatment

| Section | 3D treatment | Fallback (reduced-motion / no-WebGL) |
|---------|-------------|--------------------------------------|
| **Hero** | Particle/instanced-mesh field that resolves into your name; subtle parallax on pointer | Static gradient + headline |
| **Work** | Project cards as planes floating at different Z-depths; scroll dollies the camera past them | Standard responsive grid |
| **Skills** | Constellation — skills as nodes, edges drawn between related tech; rotates slowly | Tag/bar layout (reuse `SkillProgressBar`) |
| **Experience** | Timeline receding into Z; "now" closest, oldest farthest | Vertical timeline |
| **Contact** | Calm — single plane, slow drift; let the form breathe | Plain form |

### 4.4 Performance & a11y guardrails (non-negotiable)

1. **Lazy + suspense:** `const ScrollCanvas = lazy(() => import('./three/ScrollCanvas'))`. WebGL never blocks first paint or TTI.
2. **`prefers-reduced-motion`:** detect once in a `useReducedMotion` hook → render the *static fallback tree* entirely (no R3F mount at all). This is a real, complete layout, not a degraded one.
3. **Capability gate:** if no WebGL or `navigator.hardwareConcurrency < 4`, fall back to a lightweight CSS-parallax version.
4. **One canvas, one RAF loop.** Delete the existing simultaneous `particles-bg` + `shader-grid` + floating-circles stack — they get consolidated into the single R3F scene.
5. **DPR clamp:** `dpr={[1, 1.75]}`, pause rendering when tab hidden / section off-screen (`frameloop="demand"` where possible).
6. **Mobile:** ship the CSS-parallax fallback by default under `768px`; WebGL hero only on capable tablets/desktop.

---

## 5. Page-by-page redesign

### 5.1 Public site

**Home / Landing** — Collapse `/` and `/home` into one. Orbital hero → Work preview (3 featured, depth-stacked) → Skills constellation teaser → a single strong CTA. Add a mono "system status" line (`● available for work`) as a techy signature.

**Projects** — Keep filter/search (good UX). Replace flat grid with depth-tiered cards; on click, a full-screen case-study overlay with problem → approach → stack → outcome and live/repo links. Each card gets a quiet `react-parallax-tilt` (already installed) — repurpose, don't add.

**Skills** — The constellation is the hero here. Hovering a node highlights connected tech and shows proficiency. Keep an accessible list view toggle.

**Experience / Education / Certifications** — Unify into one **Timeline** system component with three filtered views (don't maintain three near-identical pages). Z-receding timeline; "now" glows in `--signal`.

**Contact** — Quiet by design. Real-time validation (you have Zod), clear success/error states in the interface's voice ("Message sent — I'll reply within 48h," not "Submit successful"). Keep the chat widget but restyle to tokens.

**Beyond** — Fold into About as a "beyond the code" section rather than a standalone route, or keep but re-theme.

### 5.2 Admin portal

The admin is impressively featured — don't rebuild it, **systematize it.**

1. **One `WorkspaceShell`** template: shared header, ambient background, AI-insights slot, sticky footer. Delete the per-section `*AmbientBackground` / `*HeroPanel` duplicates (~8 copies → 1).
2. **Re-theme to the unified token palette** (kills the purple/cyan split).
3. **Promote real primitives:** your `DataTable`, `AdminModal`, `AdminFormWizard`, `StatusBadge`, `EmptyState` become the documented component kit. Everything else composes from them.
4. **Admin stays calm** — no 3D. It's a tool; the 3D budget belongs to the public site. Glass + tokens + good density only.
5. Add **error boundaries** + consistent **skeletons** for every CRUD page.

---

## 6. Component & CSS migration

**Goal: `index.css` from 3,632 lines → < 400.**

1. Create `src/styles/tokens.css` (the variables above) — imported once.
2. Create `src/styles/base.css` — resets, typography defaults, `.glass` utility, focus-visible rings.
3. **Delete** every `.set-*`, `.sk-*`, `.adm-sk-*`, `.idf-*` block. Re-express as Tailwind utilities or small `@layer components` classes built from tokens.
4. Introduce `clsx` + `tailwind-merge` (`cn()` helper — the audit shows `lib/utils.js` exists; standardize on it) and stop interpolating `var()` into className strings.
5. Build a `/styleguide` dev-only route rendering every primitive in every state — your living design system (cheaper than Storybook for now).

---

## 7. Phased rollout

### Phase 1 — Foundation (no visible 3D yet, but everything gets better)
- [ ] `tokens.css` with **Material 3 role aliases** + Tailwind wiring; new palette + type pairing
- [ ] Adopt M3 elevation + state-layer model (replaces ad-hoc shadows)
- [ ] `cn()` helper, base layer, kill ~2,500 lines of `index.css`
- [ ] Add `lenis` smooth scroll (DOM only) + `prefers-reduced-motion` hook
- [ ] Error boundaries + skeleton coverage
- [ ] `/styleguide` route — render every primitive + each pasted Aceternity/React Bits component re-skinned

### Phase 2 — The Orbital public site
- [ ] Add `three` + `@react-three/fiber` + `drei`; build `<ScrollCanvas>` spine
- [ ] Orbital hero (Three.js) with **Aceternity aurora/beams** as the reduced-motion fallback
- [ ] Depth-tiered Work + case-study overlay (Aceternity bento + sticky-scroll, re-skinned)
- [ ] Skills constellation + list toggle
- [ ] Unified Timeline (Experience/Education/Certs)
- [ ] **React Bits** micro-accents: headline split-text, animated stat counters, magnetic CTA
- [ ] Capability gating + mobile CSS-parallax path

### Phase 3 — Admin systematization + polish
- [ ] `WorkspaceShell`, delete duplicated ambient/hero components
- [ ] Re-theme admin to unified tokens, leaning hardest on **M3 grammar** (it's a tool — M3 fits)
- [ ] Optional light mode by re-pointing M3 role aliases in `[data-theme="light"]`
- [ ] Lighthouse pass: perf ≥ 90 mobile, a11y = 100

---

## 8. Definition of done (quality floor)

- Responsive to 360px; no horizontal scroll anywhere.
- Visible keyboard focus on every interactive element; full keyboard nav.
- `prefers-reduced-motion` yields a complete, beautiful *static* site — not a broken one.
- LCP < 2.5s on mid-tier mobile; WebGL never blocks first paint.
- One palette, one type system, one spacing scale across public + admin.
- `index.css` < 400 lines; zero `.set-*`/`.sk-*`/`.idf-*` survivors.
- Copy reads in the interface's voice: active verbs, sentence case, specific.

---

## 9. New dependencies

**Installed packages:**
```
three  @react-three/fiber  @react-three/drei  @react-three/postprocessing
lenis  clsx  tailwind-merge
```

**Copy-in (no package, paste source then re-skin to tokens):**
```
Aceternity UI   → public-site backgrounds/sections (aurora, bento, spotlight, sticky-scroll)
React Bits      → text/button micro-accents (split text, animated counters, magnetic btn)
Material 3       → token grammar only (color roles, elevation, state layers, motion specs)
                  optionally generate the tonal palette with Material Theme Builder
```

> Deliberately **not** installing `@material/web` — its baked-in Roboto + Google look would fight the custom aesthetic. We take M3's *system*, not its components.

Already present and reused: framer-motion (powers Aceternity/React Bits snippets), react-parallax-tilt, lucide-react, the shader-grid / holographic-card primitives.

---

## 10. Open decisions for you

1. **Display face:** Space Grotesk (techy, free, safe) vs Clash Display (bolder, more distinctive). I lean Space Grotesk.
2. **Accent:** teal-mint `#5eead4` (proposed) vs keep a blue family. Mint differentiates you from the blue-portfolio crowd.
3. **Light mode:** worth it, or dark-only forever? Tokens make it cheap either way.
4. **3D scope:** full per-section 3D (this plan) vs 3D hero only + 2D elsewhere (faster, lower risk).

Tell me your picks on these four and I'll start Phase 1.