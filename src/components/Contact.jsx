function Contact({ contactCards, heroSocials, altContactLinks }) {
  return (
    <section id="contact" className="py-20 px-6 bg-[#0f172a] relative overflow-hidden" aria-labelledby="contact-heading">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#14b8a6] rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#22d3ee] rounded-full blur-3xl" />
      </div>
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-1 w-12 bg-gradient-to-r from-transparent to-[#14b8a6] rounded-full" />
            <i className="fas fa-envelope text-5xl text-[#14b8a6] animate-pulse" />
            <div className="h-1 w-12 bg-gradient-to-l from-transparent to-[#22d3ee] rounded-full" />
          </div>
          <h2 id="contact-heading" className="text-5xl md:text-6xl font-extrabold mb-4 animate-gradient">
            Get In Touch
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Have a project idea or want to collaborate? Drop me a message and let&apos;s create something amazing together!
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="space-y-4">
              {contactCards.map((card) => (
                <div
                  key={card.title}
                  className="group bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-[#14b8a6]/20 hover:border-[#14b8a6]/50 hover:shadow-[0_0_30px_rgba(20,184,166,0.3)] transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${card.accent} rounded-xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-300`}>
                      <i className={`${card.icon} text-2xl text-[#14b8a6]`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">{card.title}</h3>
                      {card.href ? (
                        <a href={card.href} className="text-gray-400 hover:text-[#14b8a6] transition-colors text-sm">
                          {card.value}
                        </a>
                      ) : (
                        <p className="text-gray-400 text-sm">{card.value}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <i className="fas fa-share-alt text-[#14b8a6]" />
                Connect on Social Media
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {heroSocials.slice(0, 3).map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center gap-3 p-4 bg-gray-700/30 rounded-xl hover:bg-[#14b8a6] transition-all duration-300 hover:scale-110"
                  >
                    <i className={`${social.icon} text-3xl text-gray-400 group-hover:text-white transition-colors`} />
                    <span className="text-xs text-gray-400 group-hover:text-white font-semibold">{social.tooltip}</span>
                  </a>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-r from-[#14b8a6]/10 to-[#22d3ee]/10 backdrop-blur-sm p-6 rounded-2xl border border-[#14b8a6]/30">
              <p className="text-gray-300 text-center italic">
                <i className="fas fa-quote-left text-[#14b8a6] mr-2" />
                I typically respond within 24-48 hours
                <i className="fas fa-quote-right text-[#22d3ee] ml-2" />
              </p>
            </div>
          </div>
          <div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 md:p-10 rounded-2xl border border-gray-700 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <i className="fas fa-paper-plane text-[#14b8a6]" />
                Send Me a Message
              </h3>
              <form id="contact-form" action="https://formspree.io/f/xrbonqka" method="POST" className="space-y-6" aria-label="Contact form">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-300 mb-2">
                    <i className="fas fa-user text-[#14b8a6] mr-2" />
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    className="w-full px-4 py-3 text-white bg-gray-700/50 border-2 border-gray-600 rounded-xl focus:border-[#14b8a6] focus:ring-2 focus:ring-[#14b8a6]/50 transition-all outline-none"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
                    <i className="fas fa-envelope text-[#22d3ee] mr-2" />
                    Your Email
                  </label>
                  <input
                    type="email"
                    name="_replyto"
                    id="email"
                    required
                    className="w-full px-4 py-3 text-white bg-gray-700/50 border-2 border-gray-600 rounded-xl focus:border-[#22d3ee] focus:ring-2 focus:ring-[#22d3ee]/50 transition-all outline-none"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-300 mb-2">
                    <i className="fas fa-comment-dots text-[#14b8a6] mr-2" />
                    Your Message
                  </label>
                  <textarea
                    name="message"
                    id="message"
                    rows="6"
                    required
                    className="w-full px-4 py-3 text-white bg-gray-700/50 border-2 border-gray-600 rounded-xl focus:border-[#14b8a6] focus:ring-2 focus:ring-[#14b8a6]/50 transition-all outline-none resize-none"
                    placeholder="Tell me about your project or idea..."
                  />
                </div>
                <input type="text" name="_gotcha" className="hidden" aria-hidden="true" />
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-[#14b8a6] to-[#22d3ee] hover:from-[#22d3ee] hover:to-[#14b8a6] text-white font-bold rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  <span className="flex items-center justify-center gap-2">
                    <i className="fas fa-paper-plane" />
                    Send Message
                  </span>
                </button>
              </form>
              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <i className="fas fa-shield-alt text-[#14b8a6]" />
                    Secure &amp; Private
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="fas fa-bolt text-[#22d3ee]" />
                    Quick Response
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="fas fa-check-circle text-green-400" />
                    No Spam
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-6">Prefer a different way to connect?</p>
          <div className="flex flex-wrap justify-center gap-4">
            {altContactLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-6 py-3 bg-gray-800 border border-gray-700 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2 ${link.hover}`}
              >
                <i className={link.icon} />
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact

