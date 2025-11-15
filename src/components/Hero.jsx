import { MEDIA } from '../constants/media'

function Hero({ typedText, heroSocials, quickStats }) {
  return (
    <section
      id="home"
      className="min-h-screen flex flex-col justify-center items-center bg-[#0f172a] text-white px-6 text-center relative overflow-hidden"
      role="banner"
      aria-labelledby="main-heading"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1a1f3a] to-[#111827]" aria-hidden="true" />
      <div className="absolute inset-0 opacity-30" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#14b8a6] rounded-full mix-blend-multiply filter blur-3xl animate-[blob_20s_infinite]" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#22d3ee] rounded-full mix-blend-multiply filter blur-3xl animate-[blob_20s_infinite] animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-[#06b6d4] rounded-full mix-blend-multiply filter blur-3xl animate-[blob_20s_infinite] animation-delay-4000" />
      </div>
      <div className="absolute inset-0 overflow-hidden opacity-40" aria-hidden="true">
        <div className="absolute inset-0" />
      </div>
      <div className="max-w-4xl relative z-10 pt-10 pb-16">
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-[#22d3ee] to-[#14b8a6] rounded-full blur-2xl opacity-50 animate-pulse" />
          <img
            src={MEDIA.profile}
            alt="Professional headshot of Dhruv Thakar, Computer Science student"
            className="relative mx-auto w-40 h-40 md:w-48 md:h-48 rounded-full shadow-2xl border-4 border-[#14b8a6] hover:scale-105 transition-transform duration-500"
            loading="eager"
          />
        </div>
        <div className="space-y-4">
          <p className="text-[#14b8a6] text-lg font-medium">👋 Hello, I&apos;m</p>
          <h1 id="main-heading" className="text-5xl md:text-7xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-[#22d3ee] via-[#14b8a6] to-[#22d3ee] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              Dhruv Thakar
            </span>
          </h1>
          <div className="text-2xl md:text-3xl font-semibold text-white mb-6 h-12">
            <span className="text-gray-400">I&apos;m a </span>
            <span className="text-[#22d3ee]">{typedText}</span>
            <span className="text-[#22d3ee] animate-pulse">|</span>
          </div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Passionate about building <span className="text-[#22d3ee] font-semibold">intelligent</span>,{' '}
            <span className="text-[#14b8a6] font-semibold">efficient</span>, and <span className="text-[#22d3ee] font-semibold">meaningful</span> tech solutions. Turning ideas
            into reality through code, creativity, and collaboration.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <a
            href="#projects"
            className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-[#22d3ee] to-[#14b8a6] hover:from-[#06b6d4] hover:to-[#0d9488] text-[#0f172a] font-bold px-8 py-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] focus:outline-none focus:ring-2 focus:ring-[#22d3ee] focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            <i className="fas fa-rocket" aria-hidden="true" />
            View My Projects
            <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 bg-transparent border-2 border-[#22d3ee] text-[#22d3ee] hover:bg-[#22d3ee] hover:text-[#0f172a] font-bold px-8 py-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#22d3ee] focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            <i className="fas fa-envelope" aria-hidden="true" />
            Get In Touch
          </a>
        </div>
        <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-10">
          {quickStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className={`text-3xl md:text-4xl font-bold mb-1 ${stat.accent}`}>{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
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
              className={`group relative w-12 h-12 flex items-center justify-center bg-gray-800/50 hover:bg-gray-700 text-gray-400 hover:text-white rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 ${social.ring} focus:ring-offset-2 focus:ring-offset-gray-900`}
              aria-label={social.label}
              role="listitem"
            >
              <i className={`${social.icon} text-xl`} aria-hidden="true" />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {social.tooltip}
              </span>
            </a>
          ))}
        </div>
        <div className="animate-bounce mt-8">
          <a href="#about" className="text-gray-400 hover:text-[#22d3ee] transition-colors" aria-label="Scroll to about section">
            <i className="fas fa-chevron-down text-2xl animate-pulse" />
          </a>
        </div>
      </div>
    </section>
  )
}

export default Hero

