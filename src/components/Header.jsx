import { MEDIA } from '../constants/media'

/**
 * Reusable global navigation bar.
 * Uses CSS variables from :root for pill glass, accent, and CTA.
 * Scrolls with page by default; set fixed={true} for sticky/fixed behavior.
 */
function Header({
  navLinks,
  activeSection,
  isHeaderScrolled,
  isDarkMode,
  onToggleTheme,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
  scrollProgressRef,
  heroSocials = [],
  fixed = false,
}) {
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
        className={`global-nav max-w-6xl mx-auto flex items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-3 ${isHeaderScrolled ? 'is-scrolled' : ''} ${activeSection === 'home' && !isHeaderScrolled ? 'global-nav-in-hero' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Gradient logo / brand */}
        <a
          href="#home"
          className="flex items-center gap-2 rounded-[var(--nav-pill-radius)] bg-[var(--color-bg-card)]/50 hover:bg-[var(--color-bg-card)]/80 border border-[var(--color-border)]/50 px-3 py-2 sm:px-4 sm:py-2.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--nav-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)] shrink-0 logo-pill"
          aria-label="Dhruv Thakar - Go to home"
        >
          <img
            src={MEDIA.logo}
            alt=""
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[var(--nav-accent)]/50 object-cover shrink-0"
            loading="eager"
          />
          <span className="text-lg sm:text-xl font-bold tracking-tight">
            <span className="text-[var(--color-text)]">Dhruv</span>
            <span className="global-nav-logo-accent"> Thakar</span>
          </span>
        </a>

        {/* Desktop nav links with underline effect */}
        <ul
          id="nav-links"
          role="menubar"
          className="hidden md:flex items-center gap-1 flex-1 justify-center"
        >
          {mainNavLinks.map((link) => {
            const isActive = activeSection === link.id
            return (
              <li key={link.id} role="none">
                <a
                  href={`#${link.id}`}
                  role="menuitem"
                  className={`nav-link inline-block relative px-4 py-2.5 rounded-[var(--radius)] text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? 'active-link'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card)]/50 hover:text-[var(--color-text)]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {link.label}
                  <span className={`active-underline absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-300 ${isActive ? 'w-6' : 'w-0'}`} />
                </a>
              </li>
            )
          })}
        </ul>

        {/* CTA + socials + theme + hamburger */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <a
            href="#contact"
            className="global-nav-cta hidden sm:inline-flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-2.5 font-bold text-sm rounded-[var(--nav-pill-radius)] hover:opacity-90 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]"
            role="menuitem"
          >
            <i className="fas fa-arrow-right text-xs" aria-hidden="true" />
            Contact
          </a>
          <div className="hidden md:flex items-center gap-2 border-l border-white/10 pl-3">
            {heroSocials.slice(0, 4).map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:text-[var(--nav-accent)] hover:bg-[var(--color-bg-card)]/80 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
                aria-label={social.label}
              >
                <i className={`${social.icon} text-base`} aria-hidden="true" />
              </a>
            ))}
          </div>
          <button
            type="button"
            onClick={onToggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:text-[var(--nav-accent)] hover:bg-[var(--color-bg-card)]/80 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            <i className={isDarkMode ? 'fas fa-moon' : 'fas fa-sun'} aria-hidden="true" />
          </button>
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
          {mainNavLinks.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  activeSection === link.id
                    ? 'bg-[var(--color-bg-card)]/80 text-[var(--nav-accent)]'
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card)]/50 hover:text-[var(--color-text)]'
                }`}
                onClick={onCloseMenu}
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="pt-2">
            <a
              href="#contact"
              className="global-nav-cta flex items-center justify-center gap-2 px-4 py-3 rounded-[var(--nav-pill-radius)] font-bold text-sm"
              onClick={onCloseMenu}
            >
              <i className="fas fa-arrow-right text-xs" aria-hidden="true" />
              Contact
            </a>
          </li>
        </ul>
      </div>
    </header>
  )
}

export default Header
