import { MEDIA } from '../constants/media'
import SpaceBackground from './SpaceBackground'

function Footer({ navLinks, heroSocials, footerBadges }) {
  return (
    <footer className="relative bg-[var(--color-bg)] text-[var(--color-text-muted)] pt-16 pb-8 overflow-hidden border-t border-[var(--color-border)]">
      <SpaceBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-bg-elevated)]/30 to-[var(--color-bg)]" aria-hidden="true" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-96 h-96 bg-[var(--color-blue)] rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[var(--color-accent)] rounded-full blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold animate-gradient mb-4 text-[var(--color-text)]">Let&apos;s Build Something Amazing Together</h3>
          <p className="text-[var(--color-text-muted)] text-lg mb-8">Have a project in mind? Let&apos;s connect and make it happen!</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#contact"
              className="group relative px-8 py-4 bg-[var(--color-orange)] hover:bg-[var(--color-orange-hover)] rounded-xl font-bold text-white shadow-lg hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all duration-300 hover:scale-105"
            >
              <i className="fas fa-paper-plane mr-2" />
              Get In Touch
            </a>
            <a
              href="https://drive.google.com"
              className="px-8 py-4 border-2 border-[var(--color-blue)] text-[var(--color-accent)] rounded-xl font-bold hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)] transition-all duration-300 hover:scale-105"
            >
              <i className="fas fa-download mr-2" />
              Download Resume
            </a>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <img src={MEDIA.logo} alt="Dhruv Thakar Logo" className="w-12 h-12 rounded-full border-2 border-[var(--color-blue)]" />
              <h3 className="text-2xl font-bold animate-gradient text-[var(--color-text)]">Dhruv Thakar</h3>
            </div>
            <p className="text-[var(--color-text-muted)] mb-4 leading-relaxed">
              Computer Science student passionate about building innovative solutions and contributing to the tech community.
            </p>
            <p className="italic text-sm text-[var(--color-accent)] font-semibold">&quot;Building solutions, one line of code at a time.&quot;</p>
          </div>
          <div className="text-center md:text-left">
            <h4 className="text-lg font-bold text-[var(--color-text)] mb-4 flex items-center justify-center md:justify-start gap-2">
              <i className="fas fa-link text-[var(--color-accent)]" />
              Quick Links
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <a href={`#${link.id}`} className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors flex items-center justify-center md:justify-start gap-2 group">
                    <i className="fas fa-chevron-right text-xs text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-center md:text-left">
            <h4 className="text-lg font-bold text-[var(--color-text)] mb-4 flex items-center justify-center md:justify-start gap-2">
              <i className="fas fa-tools text-[var(--color-accent)]" />
              Built With
            </h4>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              {footerBadges.map((badge) => (
                <img key={badge} src={badge} alt="Tech badge" className="rounded hover:scale-110 transition-transform" loading="lazy" />
              ))}
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-4">
              <i className="fas fa-code text-[var(--color-accent)]" /> Designed &amp; Built by Dhruv Thakar
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              <i className="fas fa-calendar-alt text-[var(--color-blue)]" /> Last updated: November 2025
            </p>
          </div>
          <div className="text-center md:text-left">
            <h4 className="text-lg font-bold text-[var(--color-text)] mb-4 flex items-center justify-center md:justify-start gap-2">
              <i className="fas fa-share-alt text-[var(--color-accent)]" />
              Connect With Me
            </h4>
            <div className="flex justify-center md:justify-start gap-4 mb-6">
              {heroSocials.slice(0, 3).map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-[var(--color-bg-card)] rounded-xl flex items-center justify-center text-xl text-[var(--color-text-muted)] hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)] transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(125,211,252,0.3)]"
                  aria-label={social.tooltip}
                >
                  <i className={social.icon} />
                </a>
              ))}
            </div>
            <div className="bg-[var(--color-bg-card)]/50 backdrop-blur-sm rounded-xl p-4 border border-[var(--color-border)]">
              <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-[var(--color-text-muted)] mb-2">
                <i className="fas fa-map-marker-alt text-[var(--color-accent)]" />
                <span>Oshawa, ON, Canada</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-[var(--color-text-muted)]">
                <i className="fas fa-briefcase text-[var(--color-blue)]" />
                <span>Open to Opportunities</span>
              </div>
            </div>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent mb-8" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-[var(--color-text-muted)] text-center md:text-left">
            <p>© 2025 Dhruv Thakar. All rights reserved.</p>
            <p className="text-xs mt-1">
              Made with <i className="fas fa-heart text-red-500 animate-pulse" /> and <i className="fas fa-coffee text-[var(--color-accent)]" />
            </p>
          </div>
          <a
            href="#home"
            className="group flex items-center gap-2 px-6 py-3 bg-[var(--color-bg-card)] hover:bg-[var(--color-orange)] rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] text-[var(--color-text)]"
          >
            <i className="fas fa-arrow-up group-hover:animate-bounce" />
            <span className="font-semibold">Back to Top</span>
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
