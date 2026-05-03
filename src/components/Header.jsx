import { NavLink, useLocation } from 'react-router-dom'
import { MEDIA } from '../constants/media'

/**
 * Reusable global navigation bar.
 * Uses CSS variables from :root for pill glass, accent, and CTA.
 * Active state is driven by React Router (current URL), not pathname parsing.
 */
function Header({
  navLinks,
  activeSection,
  isHeaderScrolled,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
  scrollProgressRef,
  fixed = false,
}) {
  const location = useLocation()
  const isOnHome = location.pathname === '/home' || location.pathname === '/'
  const mainNavLinks = navLinks.filter((link) => link.id !== 'contact')

  return (
    <header
      id="main-header"
      className={`z-50 pt-3 px-3 sm:pt-4 sm:px-4 transition-all duration-300 ${fixed ? 'fixed top-0 left-0 right-0' : 'relative'}`}
      role="banner"
    >
      {/* Optional scroll progress bar (ref used by App to set width) */}
      <div className="absolute top-0 left-0 right-0 h-0.5 pointer-events-none" aria-hidden="true">
        <div
          ref={scrollProgressRef}
          className="h-full bg-gradient-to-r from-[var(--nav-accent)] via-[var(--nav-accent-secondary)] to-[var(--nav-accent)] transition-all duration-150"
        />
      </div>

      {/* Pill glass nav container – blends with hero when at top */}
      <nav
        className={`global-nav navbar mx-auto flex w-full max-w-full min-w-0 items-center justify-between gap-2 sm:gap-3 px-3 py-3 sm:px-5 sm:py-3 ${isHeaderScrolled ? 'is-scrolled scrolled' : ''} ${isOnHome && !isHeaderScrolled ? 'global-nav-in-hero' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Gradient logo / brand */}
        <NavLink
          to="/home"
          className="relative z-[3] flex shrink-0 items-center gap-2 rounded-[var(--nav-pill-radius)] bg-[var(--color-bg-card)]/50 hover:bg-[var(--color-bg-card)]/80 border border-[var(--color-border)]/50 px-3 py-2 sm:px-4 sm:py-2.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--nav-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)] logo-pill"
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

        {/* Middle column: centers link strip when it fits; scrolls from Home (no overlap under logo) */}
        <div className="relative z-[1] hidden min-h-0 min-w-0 flex-1 items-center justify-center md:flex">
          <ul
            id="nav-links"
            role="menubar"
            className="flex w-max max-w-full list-none flex-nowrap items-center justify-start gap-0.5 overflow-x-auto overflow-y-visible py-1 pl-1 lg:gap-1 lg:pl-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {mainNavLinks.map((link) => {
              const path = link.path ?? `/${link.id}`
              return (
                <li key={link.id} role="none" className="shrink-0">
                  <NavLink
                    to={path}
                    end={link.id === 'home'}
                    role="menuitem"
                    className={({ isActive }) => {
                      const isSectionActive = activeSection === link.id
                      const active = isActive || isSectionActive
                      return `nav-link relative inline-flex shrink-0 items-center whitespace-nowrap rounded-[var(--radius)] px-2.5 py-2 text-xs font-semibold transition-all duration-300 sm:px-3 lg:px-4 lg:text-sm ${
                        active ? 'active-link active' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card)]/50 hover:text-[var(--color-text)]'
                      }`
                    }}
                  >
                    {({ isActive }) => {
                      const isSectionActive = activeSection === link.id
                      const active = isActive || isSectionActive
                      return (
                        <>
                          <span
                            style={
                              active
                                ? { color: '#38bdf8', textShadow: '0 0 10px rgba(56, 189, 248, 0.35)' }
                                : undefined
                            }
                          >
                            {link.label}
                          </span>
                          <span className={`active-underline absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-300 ${active ? 'w-6' : 'w-0'}`} />
                        </>
                      )
                    }}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </div>

        {/* CTA + hamburger (mobile) */}
        <div className="relative z-[2] flex shrink-0 items-center gap-2 pl-1 sm:gap-2 sm:pl-2">
          <NavLink
            to="/admin/login"
            className="hidden h-9 shrink-0 items-center gap-1.5 rounded-xl border border-[var(--color-border)]/80 bg-[var(--color-bg-card)]/40 px-2.5 text-xs font-semibold text-[var(--color-text-muted)] transition-all hover:border-[var(--nav-accent)]/50 hover:bg-[var(--color-bg-card)]/70 hover:text-[var(--nav-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--nav-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)] sm:inline-flex"
            role="menuitem"
            aria-label="Open admin sign-in"
          >
            <i className="fas fa-lock text-[10px]" aria-hidden="true" />
            Admin
          </NavLink>
          <NavLink
            to="/contact"
            className="global-nav-cta contact-btn hidden shrink-0 sm:inline-flex items-center gap-2 font-bold focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]"
            role="menuitem"
          >
            <i className="fas fa-arrow-right text-xs" aria-hidden="true" />
            Contact
          </NavLink>
          <button
            type="button"
            id="menu-btn"
            onClick={onToggleMenu}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-[var(--color-bg-card)]/80 text-[var(--color-text-muted)] hover:text-[var(--nav-accent)] hover:bg-[var(--color-bg-card)] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
          >
            <i className={isMenuOpen ? 'fas fa-times' : 'fas fa-bars'} aria-hidden="true" />
          </button>
        </div>
      </nav>

      {/* Mobile slide-in menu (frosted glass pill) */}
      <div
        id="mobile-nav"
        className={`global-nav-mobile md:hidden mt-2 mx-3 overflow-hidden ${
          isMenuOpen ? 'max-h-[80vh] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-2'
        }`}
        style={{ transition: 'max-height var(--nav-transition), opacity var(--nav-transition), transform var(--nav-transition)' }}
      >
        <ul className="px-4 py-4 space-y-1">
          {mainNavLinks.map((link) => {
            const path = link.path ?? `/${link.id}`
            return (
              <li key={link.id}>
                <NavLink
                  to={path}
                  end={link.id === 'home'}
                  className={({ isActive }) => {
                    const isSectionActive = activeSection === link.id
                    const active = isActive || isSectionActive
                    return `block px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                      active ? 'bg-[var(--color-bg-card)]/80 text-[var(--nav-accent)]' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card)]/50 hover:text-[var(--color-text)]'
                    }`
                  }}
                  onClick={onCloseMenu}
                >
                  {link.label}
                </NavLink>
              </li>
            )
          })}
          <li className="pt-2 space-y-2">
            <NavLink
              to="/admin/login"
              className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)]/80 bg-[var(--color-bg-card)]/40 px-4 py-3 text-sm font-semibold text-[var(--color-text-muted)] transition-all hover:border-[var(--nav-accent)]/50 hover:text-[var(--nav-accent)]"
              onClick={onCloseMenu}
              aria-label="Open admin sign-in"
            >
              <i className="fas fa-lock text-xs" aria-hidden="true" />
              Admin
            </NavLink>
            <NavLink
              to="/contact"
              className="global-nav-cta contact-btn flex items-center justify-center gap-2 font-bold"
              onClick={onCloseMenu}
            >
              <i className="fas fa-arrow-right text-xs" aria-hidden="true" />
              Contact
            </NavLink>
          </li>
        </ul>
      </div>
    </header>
  )
}

export default Header
