import { MEDIA } from '../constants/media'

/* Starfield: positions (%), size (px), animation delay (ms) – theme accent */
const STARFIELD = [
  { t: 8, l: 12, s: 1, d: 0 }, { t: 15, l: 88, s: 2, d: 400 }, { t: 22, l: 25, s: 1, d: 800 }, { t: 6, l: 72, s: 1, d: 1200 },
  { t: 35, l: 8, s: 2, d: 200 }, { t: 42, l: 92, s: 1, d: 600 }, { t: 28, l: 55, s: 1, d: 1000 }, { t: 18, l: 42, s: 2, d: 1400 },
  { t: 55, l: 18, s: 1, d: 300 }, { t: 62, l: 78, s: 2, d: 700 }, { t: 48, l: 35, s: 1, d: 1100 }, { t: 72, l: 62, s: 1, d: 500 },
  { t: 12, l: 5, s: 1, d: 900 }, { t: 38, l: 65, s: 2, d: 1300 }, { t: 78, l: 22, s: 1, d: 350 }, { t: 85, l: 85, s: 2, d: 750 },
  { t: 5, l: 48, s: 1, d: 150 }, { t: 45, l: 95, s: 1, d: 550 }, { t: 58, l: 45, s: 2, d: 950 }, { t: 92, l: 38, s: 1, d: 250 },
  { t: 25, l: 78, s: 1, d: 650 }, { t: 68, l: 8, s: 2, d: 1050 }, { t: 82, l: 55, s: 1, d: 450 }, { t: 32, l: 28, s: 1, d: 850 },
  { t: 52, l: 72, s: 2, d: 1250 }, { t: 75, l: 42, s: 1, d: 175 }, { t: 14, l: 62, s: 1, d: 575 }, { t: 88, l: 12, s: 1, d: 975 },
  { t: 40, l: 48, s: 2, d: 375 }, { t: 65, l: 88, s: 1, d: 775 }, { t: 8, l: 32, s: 1, d: 1175 }, { t: 95, l: 68, s: 1, d: 275 },
  { t: 50, l: 5, s: 1, d: 675 }, { t: 20, l: 92, s: 2, d: 1075 }, { t: 70, l: 28, s: 1, d: 475 }, { t: 30, l: 58, s: 1, d: 875 },
  { t: 60, l: 52, s: 1, d: 1275 }, { t: 10, l: 18, s: 2, d: 225 }, { t: 44, l: 82, s: 1, d: 625 }, { t: 86, l: 48, s: 1, d: 1025 },
  { t: 16, l: 38, s: 1, d: 425 }, { t: 54, l: 15, s: 1, d: 825 }, { t: 74, l: 72, s: 2, d: 1325 }, { t: 36, l: 52, s: 1, d: 325 },
  { t: 98, l: 25, s: 1, d: 725 }, { t: 2, l: 68, s: 1, d: 1125 }, { t: 64, l: 38, s: 1, d: 525 }, { t: 26, l: 8, s: 2, d: 925 },
]

function Hero({ typedText, heroSocials, quickStats }) {
  return (
    <section
      id="home"
      className="min-h-screen flex flex-col justify-center text-[var(--color-text)] px-6 relative overflow-hidden"
      role="banner"
      aria-labelledby="main-heading"
    >
      {/* Space background */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-[15%] left-[10%] w-[min(24rem,80vw)] h-[min(24rem,80vw)] rounded-full bg-[var(--color-blue)] opacity-[0.12] blur-[80px] animate-float-slow" />
        <div className="absolute top-[40%] right-[5%] w-[min(20rem,70vw)] h-[min(20rem,70vw)] rounded-full bg-[var(--color-accent)] opacity-[0.1] blur-[70px] animate-float-slower" />
        <div className="absolute bottom-[20%] left-[20%] w-[min(18rem,60vw)] h-[min(18rem,60vw)] rounded-full bg-[var(--color-orange)] opacity-[0.08] blur-[60px] animate-float-reverse" />
        {STARFIELD.map((star, i) => (
          <div
            key={i}
            className="hero-star animate-twinkle"
            style={{ top: `${star.t}%`, left: `${star.l}%`, width: star.s, height: star.s, animationDelay: `${star.d}ms` }}
          />
        ))}
        <div
          className="absolute top-[15%] left-0 w-24 h-0.5 rotate-[-45deg] animate-shooting-star opacity-0"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--color-accent) 40%, var(--color-accent) 60%, transparent)',
            boxShadow: '0 0 10px 2px var(--color-accent)',
          }}
        />
      </div>

      {/* Split layout: image left, content right (stacked on mobile) */}
      <div className="max-w-6xl mx-auto w-full relative z-10 pt-6 sm:pt-10 pb-16 flex flex-col md:flex-row md:items-center md:gap-14 lg:gap-16">
        {/* Left: profile image + orbit */}
        <div
          className="flex justify-center md:justify-end md:flex-shrink-0 animate-hero-reveal"
          style={{ animationDelay: '0ms' }}
        >
          <div className="relative inline-block">
            <div className="absolute inset-0 rounded-full blur-2xl opacity-50 animate-pulse bg-[var(--color-blue-soft)]" />
            <div className="absolute inset-[-20px] rounded-full border border-[var(--color-accent)]/20 border-dashed pointer-events-none" aria-hidden="true" />
            <img
              src={MEDIA.profile}
              alt="Dhruv Thakar, Computer Science student"
              className="relative w-44 h-44 md:w-52 md:h-52 rounded-full shadow-2xl border-4 border-[var(--color-accent)] hover:scale-105 transition-transform duration-500"
              loading="eager"
            />
          </div>
        </div>

        {/* Right: headline, tagline, CTAs, stats, socials */}
        <div className="flex-1 text-center md:text-left">
          <p
            className="text-[var(--color-accent)] text-base md:text-lg font-medium mb-2 animate-hero-reveal"
            style={{ animationDelay: '100ms' }}
          >
            Hello, I&apos;m
          </p>
          <h1
            id="main-heading"
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-3 animate-hero-reveal"
            style={{ animationDelay: '200ms' }}
          >
            <span className="bg-gradient-to-r from-[var(--color-accent)] via-[var(--color-blue)] to-[var(--color-accent)] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              Dhruv Thakar
            </span>
          </h1>
          <p
            className="text-xl md:text-2xl font-semibold text-[var(--color-text-muted)] mb-6 h-10 flex flex-wrap items-center justify-center md:justify-start gap-1 animate-hero-reveal"
            style={{ animationDelay: '300ms' }}
          >
            <span className="text-[var(--color-accent)]">{typedText}</span>
            <span className="text-[var(--color-accent)] animate-pulse">|</span>
          </p>

          {/* Single primary CTA + text link */}
          <div
            className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-8 animate-hero-reveal"
            style={{ animationDelay: '400ms' }}
          >
            <a
              href="#projects"
              className="group inline-flex items-center gap-2 bg-[var(--color-orange)] hover:bg-[var(--color-orange-hover)] text-white font-bold px-7 py-3.5 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_24px_rgba(249,115,22,0.4)] focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]"
            >
              View My Projects
              <i className="fas fa-arrow-right group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
            </a>
            <a
              href="#contact"
              className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] font-semibold underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] rounded"
            >
              Get in touch
            </a>
          </div>

          {/* Compact stats line */}
          <div
            className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-1 mb-8 text-sm text-[var(--color-text-muted)] animate-hero-reveal"
            style={{ animationDelay: '500ms' }}
          >
            {quickStats.map((stat, i) => (
              <span key={stat.label} className="flex items-center gap-1.5">
                <span className={`font-bold ${stat.accent}`}>{stat.value}</span>
                <span>{stat.label}</span>
                {i < quickStats.length - 1 && <span className="text-[var(--color-border)] hidden sm:inline">·</span>}
              </span>
            ))}
          </div>

          {/* Socials */}
          <div
            className="flex justify-center md:justify-start gap-3 animate-hero-reveal"
            style={{ animationDelay: '600ms' }}
            role="list"
            aria-label="Social links"
          >
            {heroSocials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]"
                aria-label={social.label}
                role="listitem"
              >
                <i className={`${social.icon} text-lg`} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <a href="#about" className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors animate-bounce" aria-label="Scroll to about">
          <i className="fas fa-chevron-down text-xl" />
        </a>
      </div>
    </section>
  )
}

export default Hero
