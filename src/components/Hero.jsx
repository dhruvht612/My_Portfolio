import { MEDIA } from '../constants/media'

function Hero({ typedText, heroSocials, quickStats }) {
  return (
    <section
      id="home"
      className="min-h-screen flex flex-col justify-center items-center text-[var(--color-text)] px-6 text-center relative overflow-hidden"
      role="banner"
      aria-labelledby="main-heading"
    >
      <div className="max-w-4xl relative z-10 pt-6 sm:pt-10 pb-16 w-full">
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 rounded-full blur-2xl opacity-50 animate-pulse bg-[var(--color-blue-soft)]" />
          <img
            src={MEDIA.profile}
            alt="Professional headshot of Dhruv Thakar, Computer Science student"
            className="relative mx-auto w-40 h-40 md:w-48 md:h-48 rounded-full shadow-2xl border-4 border-[var(--color-accent)] hover:scale-105 transition-transform duration-500"
            loading="eager"
          />
        </div>
        <div className="space-y-4">
          <p className="text-[var(--color-accent)] text-lg font-medium">Hello Everyone, I am </p>
          <h1 id="main-heading" className="text-5xl md:text-7xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-[var(--color-accent)] via-[var(--color-blue)] to-[var(--color-accent)] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              Dhruv Thakar
            </span>
          </h1>
          <div className="text-2xl md:text-3xl font-semibold text-[var(--color-text)] mb-6 h-12">
            <span className="text-[var(--color-text-muted)]">I&apos;m a </span>
            <span className="text-[var(--color-accent)]">{typedText}</span>
            <span className="text-[var(--color-accent)] animate-pulse">|</span>
          </div>
          <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Passionate about building <span className="text-[var(--color-accent)] font-semibold">intelligent</span>,{' '}
            <span className="text-[var(--color-accent-hover)] font-semibold">efficient</span>, and <span className="text-[var(--color-accent)] font-semibold">meaningful</span> tech solutions. Turning ideas
            into reality through code, creativity, and collaboration.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <a
            href="#projects"
            className="group relative inline-flex items-center gap-2 bg-[var(--color-orange)] hover:bg-[var(--color-orange-hover)] text-white font-bold px-8 py-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]"
          >
            <i className="fas fa-rocket" aria-hidden="true" />
            View My Projects
            <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 bg-transparent border-2 border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)] font-bold px-8 py-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]"
          >
            <i className="fas fa-envelope" aria-hidden="true" />
            Get In Touch
          </a>
        </div>
        <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-10">
          {quickStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className={`text-3xl md:text-4xl font-bold mb-1 ${stat.accent}`}>{stat.value}</div>
              <div className="text-sm text-[var(--color-text-muted)]">{stat.label}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-4 mb-12" role="list" aria-label="Social media links">
          {heroSocials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-12 h-12 flex items-center justify-center bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-accent)] rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]"
              aria-label={social.label}
              role="listitem"
            >
              <i className={`${social.icon} text-xl`} aria-hidden="true" />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {social.tooltip}
              </span>
            </a>
          ))}
        </div>
        <div className="animate-bounce mt-8">
          <a href="#about" className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors" aria-label="Scroll to about section">
            <i className="fas fa-chevron-down text-2xl animate-pulse" />
          </a>
        </div>
      </div>
    </section>
  )
}

export default Hero

