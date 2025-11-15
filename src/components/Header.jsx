import { MEDIA } from '../constants/media'

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
}) {
  return (
    <header
      id="main-header"
      className={`sticky top-0 z-50 bg-[#0f172a]/95 backdrop-blur-xl border-b border-[#14b8a6]/30 shadow-lg text-white transition-all duration-300 ${
        isHeaderScrolled ? 'shadow-2xl border-b-[#14b8a6]/60' : ''
      }`}
      role="banner"
    >
      <div
        ref={scrollProgressRef}
        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#14b8a6] via-[#22d3ee] to-[#06b6d4] transition-all duration-150"
      />
      <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center" role="navigation" aria-label="Main navigation">
        <a
          href="#home"
          className="group flex items-center gap-3 text-2xl font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#22d3ee] focus:ring-offset-2 focus:ring-offset-gray-900 rounded-lg px-2 py-1 transition-all duration-300 hover:scale-105"
          aria-label="Dhruv Thakar - Go to home"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#14b8a6] to-[#22d3ee] rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity" />
            <img
              src={MEDIA.logo}
              alt="Dhruv Thakar Logo"
              className="relative w-10 h-10 rounded-full border-2 border-[#14b8a6] group-hover:border-[#22d3ee] transition-all duration-300 sm:inline-block hidden"
              loading="eager"
            />
          </div>
          <span className="bg-gradient-to-r from-[#22d3ee] via-[#14b8a6] to-[#22d3ee] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
            Dhruv Thakar
          </span>
        </a>
        <div className="hidden md:flex items-center gap-2">
          <ul id="nav-links" role="menubar" className="flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.id} role="none">
                <a
                  href={`#${link.id}`}
                  role="menuitem"
                  className={`nav-link group relative px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:bg-[#14b8a6]/10 ${
                    activeSection === link.id ? 'active-link' : ''
                  }`}
                  aria-current={activeSection === link.id ? 'page' : undefined}
                >
                  <span className="relative z-10">{link.label}</span>
                  <span className="active-underline absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-[#14b8a6] to-[#22d3ee] transition-all duration-300" />
                </a>
              </li>
            ))}
            <li role="none">
              <a
                href="#contact"
                className="px-6 py-2.5 bg-gradient-to-r from-[#14b8a6] to-[#22d3ee] hover:from-[#22d3ee] hover:to-[#14b8a6] rounded-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(20,184,166,0.5)]"
                role="menuitem"
              >
                Contact
              </a>
            </li>
          </ul>
          <button
            type="button"
            onClick={onToggleTheme}
            className="ml-2 w-10 h-10 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-[#14b8a6] text-[#22d3ee] hover:text-white transition-all duration-300 hover:scale-110 hover:rotate-12 focus:outline-none focus:ring-2 focus:ring-[#22d3ee]"
            aria-label="Toggle dark mode"
            title="Toggle theme"
          >
            <i className={isDarkMode ? 'fas fa-moon' : 'fas fa-sun'} aria-hidden="true" />
          </button>
        </div>
        <button
          type="button"
          id="menu-btn"
          onClick={onToggleMenu}
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-[#14b8a6] text-[#22d3ee] hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#22d3ee]"
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-nav"
        >
          <i className={isMenuOpen ? 'fas fa-times' : 'fas fa-bars'} aria-hidden="true" />
        </button>
      </nav>
      <div id="mobile-nav" className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-[#0f172a]/98 backdrop-blur-xl border-t border-[#14b8a6]/30`}>
        <ul className="px-6 py-4 space-y-2">
          {navLinks.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                className="block px-4 py-3 rounded-lg font-semibold hover:bg-[#14b8a6]/20 hover:text-[#14b8a6] transition-all duration-300 border-l-4 border-transparent hover:border-[#14b8a6]"
                onClick={onCloseMenu}
              >
                <i className="fas fa-chevron-right w-6" />
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}

export default Header

