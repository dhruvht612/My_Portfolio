import { MEDIA } from '../constants/media'

function Footer({ navLinks, heroSocials, footerBadges }) {
  return (
    <footer className="relative bg-[#0f172a] text-gray-300 pt-16 pb-8 overflow-hidden border-t border-gray-800">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-96 h-96 bg-[#14b8a6] rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#22d3ee] rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-transparent via-[#14b8a6]/5 to-transparent pointer-events-none" />
      </div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold animate-gradient mb-4">Let&apos;s Build Something Amazing Together</h3>
          <p className="text-gray-400 text-lg mb-8">Have a project in mind? Let&apos;s connect and make it happen!</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#contact"
              className="group relative px-8 py-4 bg-gradient-to-r from-[#14b8a6] to-[#22d3ee] rounded-xl font-bold text-white shadow-lg hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] transition-all duration-300 hover:scale-105"
            >
              <i className="fas fa-paper-plane mr-2" />
              Get In Touch
            </a>
            <a
              href="https://drive.google.com"
              className="px-8 py-4 border-2 border-[#14b8a6] text-[#14b8a6] rounded-xl font-bold hover:bg-[#14b8a6] hover:text-white transition-all duration-300 hover:scale-105"
            >
              <i className="fas fa-download mr-2" />
              Download Resume
            </a>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <img src={MEDIA.logo} alt="Dhruv Thakar Logo" className="w-12 h-12 rounded-full border-2 border-[#14b8a6]" />
              <h3 className="text-2xl font-bold animate-gradient">Dhruv Thakar</h3>
            </div>
            <p className="text-gray-400 mb-4 leading-relaxed">
              Computer Science student passionate about building innovative solutions and contributing to the tech community.
            </p>
            <p className="italic text-sm text-[#14b8a6] font-semibold">&quot;Building solutions, one line of code at a time.&quot;</p>
          </div>
          <div className="text-center md:text-left">
            <h4 className="text-lg font-bold text-white mb-4 flex items-center justify-center md:justify-start gap-2">
              <i className="fas fa-link text-[#14b8a6]" />
              Quick Links
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <a href={`#${link.id}`} className="text-gray-400 hover:text-[#14b8a6] transition-colors flex items-center justify-center md:justify-start gap-2 group">
                    <i className="fas fa-chevron-right text-xs text-[#14b8a6] opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-center md:text-left">
            <h4 className="text-lg font-bold text-white mb-4 flex items-center justify-center md:justify-start gap-2">
              <i className="fas fa-tools text-[#14b8a6]" />
              Built With
            </h4>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              {footerBadges.map((badge) => (
                <img key={badge} src={badge} alt="Tech badge" className="rounded hover:scale-110 transition-transform" loading="lazy" />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4">
              <i className="fas fa-code text-[#14b8a6]" /> Designed &amp; Built by Dhruv Thakar
            </p>
            <p className="text-xs text-gray-500 mt-1">
              <i className="fas fa-calendar-alt text-[#22d3ee]" /> Last updated: November 2025
            </p>
          </div>
          <div className="text-center md:text-left">
            <h4 className="text-lg font-bold text-white mb-4 flex items-center justify-center md:justify-start gap-2">
              <i className="fas fa-share-alt text-[#14b8a6]" />
              Connect With Me
            </h4>
            <div className="flex justify-center md:justify-start gap-4 mb-6">
              {heroSocials.slice(0, 3).map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center text-xl text-gray-400 hover:bg-[#14b8a6] hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(20,184,166,0.5)]"
                  aria-label={social.tooltip}
                >
                  <i className={social.icon} />
                </a>
              ))}
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
              <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-400 mb-2">
                <i className="fas fa-map-marker-alt text-[#14b8a6]" />
                <span>Oshawa, ON, Canada</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-400">
                <i className="fas fa-briefcase text-[#22d3ee]" />
                <span>Open to Opportunities</span>
              </div>
            </div>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-[#14b8a6] to-transparent mb-8" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500 text-center md:text-left">
            <p>© 2025 Dhruv Thakar. All rights reserved.</p>
            <p className="text-xs mt-1">
              Made with <i className="fas fa-heart text-red-500 animate-pulse" /> and <i className="fas fa-coffee text-[#14b8a6]" />
            </p>
          </div>
          <a
            href="#home"
            className="group flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gradient-to-r hover:from-[#14b8a6] hover:to-[#22d3ee] rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(20,184,166,0.3)]"
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

