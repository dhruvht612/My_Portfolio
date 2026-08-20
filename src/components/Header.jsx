import { useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { LayoutGroup, motion } from 'framer-motion'
import { ArrowRight, Menu, Moon, Sun, X } from 'lucide-react'
import { MEDIA } from '../constants/media'
import { FOOTER_GROUPS } from '../context/PortfolioContext'
import { useTheme } from '../context/ThemeContext'
import { useDisclosure } from '../hooks/useDisclosure'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { EASE } from '../lib/motion'

/* Aliased outside the component (the AnimatedSection pattern): this eslint config
   has no react plugin, so an identifier used only inside JSX reads as unused. */
const MotionHeader = motion.header
const MotionSpan = motion.span
/* The link strip is a horizontal scroll container (overflow-x: auto on narrow
   desktops); layoutScroll lets framer fold its scroll offset into the pill's
   layout measurement instead of sliding to a stale x. */
const MotionUl = motion.ul

/* Mount-only entrance: fade + 8px downward settle, ~450ms.
   Declared at module scope so the objects stay referentially stable — the header
   re-renders on every scroll-compaction toggle and framer must not restart the
   entrance when it does (identical values => no re-animation). The header lives
   outside Layout's AnimatePresence, so it never remounts on a route change. */
const HEADER_INITIAL = { opacity: 0, y: -8 }
const HEADER_ANIMATE = { opacity: 1, y: 0 }
const HEADER_TRANSITION = { duration: 0.45, ease: EASE.emphasized }

/* Sliding active pill. Movement is a framer layout animation, so its timing lives
   here rather than in CSS, and collapses to 0 under reduced motion. */
const INDICATOR_TRANSITION = { duration: 0.28, ease: EASE.emphasized }
const NO_MOTION = { duration: 0 }

/* Matches Tailwind's `lg` breakpoint, where the full link strip replaces the drawer.
   Kept in JS as well as CSS because the drawer has to close itself when a resize
   crosses the line — otherwise `isOpen` stays true behind a `lg:hidden` panel and the
   scroll lock leaks. */
const LG_BREAKPOINT = 1024

/** Groups links into the footer's canonical column order; unknown groups trail. */
function groupLinks(links) {
  const groups = FOOTER_GROUPS.map((title) => ({
    title,
    links: links.filter((link) => link.footerGroup === title),
  })).filter((group) => group.links.length > 0)
  const ungrouped = links.filter((link) => !FOOTER_GROUPS.includes(link.footerGroup))
  if (ungrouped.length > 0) groups.push({ title: null, links: ungrouped })
  return groups
}

/**
 * Reusable global navigation bar.
 * Uses CSS variables from :root for pill glass, accent, and CTA.
 *
 * Active state is driven entirely by React Router's `NavLink`. An earlier version
 * OR-ed in an IntersectionObserver's "current section", which could mark two links
 * active at once and needed a tiebreak to keep `layoutId="nav-indicator"` unique.
 * Every route renders exactly one section, so the observer only ever agreed with the
 * router — the router alone now makes single-active structurally guaranteed.
 */
function Header({ navLinks, isHeaderScrolled, scrollProgressRef, scrollProgressTrackRef }) {
  const location = useLocation()
  const { theme, toggleTheme, followSystemTheme, isSystem } = useTheme()
  const themeLabel = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
  const reduced = useReducedMotion()
  const isOnHome = location.pathname === '/home' || location.pathname === '/'
  const mainNavLinks = navLinks.filter((link) => link.id !== 'contact')
  const drawerGroups = groupLinks(mainNavLinks)

  const {
    isOpen: isMenuOpen,
    close: closeMenu,
    toggle: toggleMenu,
    panelRef,
    triggerRef,
  } = useDisclosure()
  const stripRef = useRef(null)

  const indicatorTransition = reduced ? NO_MOTION : INDICATOR_TRANSITION

  /* Route change closes the drawer. Covers the browser back button, which no amount
     of onClick handlers on the links can see. */
  useEffect(() => {
    closeMenu({ refocus: false })
  }, [location.pathname, closeMenu])

  /* Crossing into desktop hides the drawer via `lg:hidden`; without this the state
     (and its body scroll lock) would survive invisibly. */
  useEffect(() => {
    if (!isMenuOpen) return
    const onResize = () => {
      if (window.innerWidth >= LG_BREAKPOINT) closeMenu({ refocus: false })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [isMenuOpen, closeMenu])

  /* The strip scrolls horizontally when the links outrun the pill (narrow `lg`
     widths). Two jobs here, both keyed off the same measurement:
       1. data-overflow-start/end drive the edge-fade masks, so hidden links are
          advertised instead of silently clipped.
       2. The active link is scrolled into view, so the indicator pill is never
          parked off-screen after a route change. */
  useEffect(() => {
    const strip = stripRef.current
    if (!strip) return

    const syncFades = () => {
      const maxScroll = strip.scrollWidth - strip.clientWidth
      // 1px tolerance: fractional layout leaves scrollLeft a hair short of maxScroll.
      strip.dataset.overflowStart = strip.scrollLeft > 1 ? 'true' : 'false'
      strip.dataset.overflowEnd = strip.scrollLeft < maxScroll - 1 ? 'true' : 'false'
    }

    syncFades()
    const active = strip.querySelector('[aria-current="page"]')
    /* Feature-guarded: scrollIntoView is absent in jsdom and its options form is not
       universal. Nothing here is load-bearing — worst case the strip stays where the
       user left it — so a missing implementation must not break the render. */
    if (active && typeof active.scrollIntoView === 'function') {
      active.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
        behavior: reduced ? 'auto' : 'smooth',
      })
    }

    strip.addEventListener('scroll', syncFades, { passive: true })
    const observer = new ResizeObserver(syncFades)
    observer.observe(strip)
    return () => {
      strip.removeEventListener('scroll', syncFades)
      observer.disconnect()
    }
  }, [location.pathname, reduced, mainNavLinks.length])

  return (
    <>
      {/* Scrim behind the open drawer: a dismiss target that also detaches the panel
          from the page it covers. Deliberately a SIBLING of the header, not a child —
          framer-motion can leave a transform on the header, and a transformed ancestor
          would make this `fixed` element resolve against the header box instead of the
          viewport, shrinking the scrim to a sliver. useDisclosure already closes on any
          outside pointerdown, so this needs no handler of its own. */}
      <div className={`nav-scrim lg:hidden ${isMenuOpen ? 'is-open' : ''}`} aria-hidden="true" />

      <MotionHeader
        id="main-header"
        className="fixed top-0 left-0 right-0 z-50 pt-3 px-3 sm:pt-4 sm:px-4 transition-colors duration-300"
        role="banner"
        initial={reduced ? false : HEADER_INITIAL}
        animate={HEADER_ANIMATE}
        transition={reduced ? NO_MOTION : HEADER_TRANSITION}
      >
      {/* Scroll progress bar. Layout writes the width directly on the ref inside a
          rAF; there is deliberately no CSS transition on it, since a transition
          would interpolate toward a value the next frame has already replaced —
          which is what used to make the bar visibly lag the scroll. */}
      <div
        ref={scrollProgressTrackRef}
        className="absolute top-0 left-0 right-0 h-0.5 pointer-events-none"
        role="progressbar"
        aria-label="Page scroll progress"
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          ref={scrollProgressRef}
          className="h-full w-0 bg-gradient-to-r from-[var(--nav-accent)] via-[var(--nav-accent-secondary)] to-[var(--nav-accent)]"
        />
      </div>

      {/* Pill glass nav container – blends with hero when at top.
          Compaction is CSS-only: .nav-shell transitions min-height / padding /
          margin and .nav-shell--compact supplies the scrolled geometry, so no
          height is animated in JS. Blur stays on .global-nav alone — no second
          blur layer is introduced here. */}
      <nav
        className={`global-nav nav-shell mx-auto flex w-full max-w-full min-w-0 items-center justify-between gap-2 sm:gap-3 px-3 py-3 sm:px-5 sm:py-3 ${isHeaderScrolled ? 'nav-shell--compact' : ''} ${isOnHome && !isHeaderScrolled ? 'global-nav-in-hero' : ''}`}
        aria-label="Main navigation"
      >
        {/* Gradient logo / brand */}
        <NavLink
          to="/home"
          className="relative z-[3] flex shrink-0 items-center gap-2 rounded-[var(--nav-pill-radius)] bg-[var(--color-bg-card)]/50 hover:bg-[var(--color-bg-card)]/80 border border-[var(--color-border)]/50 px-3 py-2 sm:px-4 sm:py-2.5 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nav-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] logo-pill"
          aria-label="Dhruv Thakar - Go to home"
        >
          <img
            src={MEDIA.logo}
            alt=""
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[var(--nav-accent)]/50 object-cover shrink-0"
            loading="eager"
          />
          <span className="text-lg sm:text-xl font-bold tracking-tight logo">Dhruv Thakar</span>
        </NavLink>

        {/* Middle column: centres the link strip when it fits, scrolls when it does
            not. Plain ul/li — the previous role="menubar"/"menuitem" advertised an
            application menu with arrow-key navigation that was never implemented,
            and NavLink already emits aria-current="page". */}
        <div className="relative z-[1] hidden min-h-0 min-w-0 flex-1 items-center justify-center lg:flex">
          <LayoutGroup>
            <MotionUl
              id="nav-links"
              ref={stripRef}
              layoutScroll
              className="nav-strip flex w-max max-w-full list-none flex-nowrap items-center justify-start gap-0.5 overflow-x-auto overflow-y-visible py-1 pl-1 lg:gap-1 lg:pl-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {mainNavLinks.map((link) => {
                const path = link.path ?? `/${link.id}`
                return (
                  <li key={link.id} className="shrink-0">
                    <NavLink
                      to={path}
                      end={link.id === 'home'}
                      className={({ isActive }) =>
                        `nav-link relative inline-flex shrink-0 items-center whitespace-nowrap rounded-[var(--radius)] px-2.5 py-2 text-xs font-semibold transition-colors duration-300 sm:px-3 lg:px-4 lg:text-sm ${
                          isActive
                            ? 'active-link'
                            : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card)]/50 hover:text-[var(--color-text)]'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <MotionSpan
                              layoutId="nav-indicator"
                              className="nav-indicator"
                              transition={indicatorTransition}
                              aria-hidden="true"
                            />
                          )}
                          <span className="relative z-[1]">{link.label}</span>
                        </>
                      )}
                    </NavLink>
                  </li>
                )
              })}
            </MotionUl>
          </LayoutGroup>
        </div>

        {/* CTA + hamburger. The Admin link that used to sit here is reachable from the
            footer instead — it is not visitor-facing navigation, and dropping it is
            what un-crowds the bar between 640px and the lg breakpoint. */}
        <div className="relative z-[2] flex shrink-0 items-center gap-2 pl-1 sm:gap-2 sm:pl-2">
          {/* aria-pressed exposes the current state to assistive tech: the label alone
              only said what the button would do, never which theme was active. The
              icon shows the theme you would switch TO, so it stays paired with the
              label. Long-press / right-click hands control back to the OS. */}
          <button
            type="button"
            onClick={toggleTheme}
            onContextMenu={(event) => {
              event.preventDefault()
              followSystemTheme()
            }}
            className="theme-toggle"
            aria-label={themeLabel}
            aria-pressed={theme === 'light'}
            title={isSystem ? `${themeLabel} (following your system)` : `${themeLabel} (right-click to follow system)`}
          >
            {theme === 'dark' ? (
              <Sun size={15} strokeWidth={2} aria-hidden="true" />
            ) : (
              <Moon size={15} strokeWidth={2} aria-hidden="true" />
            )}
            {isSystem && <span className="theme-toggle-system-dot" aria-hidden="true" />}
          </button>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `global-nav-cta contact-btn hidden shrink-0 sm:inline-flex items-center gap-2 font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nav-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] ${
                isActive ? 'is-current' : ''
              }`
            }
          >
            <ArrowRight size={13} strokeWidth={2.5} aria-hidden="true" />
            Contact
          </NavLink>
          <button
            type="button"
            id="menu-btn"
            ref={triggerRef}
            onClick={toggleMenu}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-[var(--color-bg-card)]/80 text-[var(--color-text-muted)] hover:text-[var(--nav-accent)] hover:bg-[var(--color-bg-card)] transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
          >
            {isMenuOpen ? (
              <X size={17} strokeWidth={2} aria-hidden="true" />
            ) : (
              <Menu size={17} strokeWidth={2} aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile drawer (frosted glass pill).
          Renders NO .nav-indicator: layoutId="nav-indicator" must exist on at most
          one node at a time, and the desktop strip owns it.
          `inert` while closed is the fix for the real defect here — the panel used to
          collapse with max-height/opacity alone, leaving every link in the tab order
          and announced to screen readers while invisible. */}
      <nav
        id="mobile-nav"
        ref={panelRef}
        aria-label="Mobile navigation"
        inert={!isMenuOpen}
        /* Overflow is set per axis rather than leaning on utility order: x always
           clipped so the collapse animation cannot bulge sideways, y scrollable only
           while open so a long link list stays reachable on a short screen. */
        className={`global-nav-mobile lg:hidden mt-2 mx-3 overflow-x-hidden ${
          isMenuOpen ? 'max-h-[80vh] overflow-y-auto opacity-100 translate-y-0' : 'max-h-0 overflow-y-hidden opacity-0 -translate-y-2'
        }`}
        style={{ transition: 'max-height var(--nav-transition), opacity var(--nav-transition), transform var(--nav-transition)' }}
      >
        <div className="px-4 py-4 space-y-4">
          {drawerGroups.map((group) => (
            <div key={group.title ?? 'other'}>
              {group.title && (
                <p className="px-4 pb-1.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]/70">
                  {group.title}
                </p>
              )}
              <ul className="space-y-1 list-none">
                {group.links.map((link) => {
                  const path = link.path ?? `/${link.id}`
                  return (
                    <li key={link.id}>
                      <NavLink
                        to={path}
                        end={link.id === 'home'}
                        className={({ isActive }) =>
                          `block px-4 py-3 rounded-lg text-sm font-semibold transition-colors duration-300 ${
                            isActive
                              ? 'bg-[var(--color-bg-card)]/80 text-[var(--nav-accent)]'
                              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card)]/50 hover:text-[var(--color-text)]'
                          }`
                        }
                      >
                        {link.label}
                      </NavLink>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `global-nav-cta contact-btn flex items-center justify-center gap-2 font-bold ${isActive ? 'is-current' : ''}`
            }
          >
            <ArrowRight size={13} strokeWidth={2.5} aria-hidden="true" />
            Contact
          </NavLink>
        </div>
      </nav>
      </MotionHeader>
    </>
  )
}

export default Header
