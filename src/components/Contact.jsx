import { useForm, ValidationError } from '@formspree/react'

const FORMSPREE_FORM_ID = import.meta.env.VITE_FORMSPREE_FORM_ID ?? 'mwpabokg'

function Contact({ contactCards, heroSocials, altContactLinks }) {
  const [state, handleSubmit] = useForm(FORMSPREE_FORM_ID)
  const isSubmitting = state.submitting
  const isSuccess = state.succeeded

  return (
    <section id="contact" className="py-20 px-6 bg-[var(--color-bg)] relative overflow-hidden" aria-labelledby="contact-heading">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-bg-elevated)]/50 to-[var(--color-bg-elevated)]" aria-hidden="true" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[var(--color-blue)] rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--color-accent)] rounded-full blur-3xl" />
      </div>
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-1 w-12 bg-gradient-to-r from-transparent to-[var(--color-accent)] rounded-full" />
            <i className="fas fa-envelope text-5xl text-[var(--color-accent)] animate-pulse" />
            <div className="h-1 w-12 bg-gradient-to-l from-transparent to-[var(--color-blue)] rounded-full" />
          </div>
          <h2 id="contact-heading" className="text-5xl md:text-6xl font-extrabold mb-4 animate-gradient">
            Get In Touch
          </h2>
          <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto">
            Have a project idea or want to collaborate? Drop me a message and let&apos;s create something amazing together!
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="space-y-4">
              {contactCards.map((card) => (
                <div
                  key={card.title}
                  className="group bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg)] p-6 rounded-2xl border border-[var(--color-accent)]/20 hover:border-[var(--color-accent)]/50 hover:shadow-[0_0_30px_rgba(125,211,252,0.2)] transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${card.accent} rounded-xl flex items-center justify-center border border-[var(--color-border)] group-hover:scale-110 transition-transform duration-300`}>
                      <i className={`${card.icon} text-2xl text-[var(--color-accent)]`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[var(--color-text)] mb-1">{card.title}</h3>
                      {card.href ? (
                        <a href={card.href} className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors text-sm">
                          {card.value}
                        </a>
                      ) : (
                        <p className="text-[var(--color-text-muted)] text-sm">{card.value}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg)] p-8 rounded-2xl border border-[var(--color-border)]">
              <h3 className="text-xl font-bold text-[var(--color-text)] mb-6 flex items-center gap-2">
                <i className="fas fa-share-alt text-[var(--color-accent)]" />
                Connect on Social Media
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {heroSocials.slice(0, 3).map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center gap-3 p-4 bg-[var(--color-bg-card)]/50 rounded-xl hover:bg-[var(--color-blue)] transition-all duration-300 hover:scale-110"
                  >
                    <i className={`${social.icon} text-3xl text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] transition-colors`} />
                    <span className="text-xs text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] font-semibold">{social.tooltip}</span>
                  </a>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-r from-[var(--color-accent)]/10 to-[var(--color-blue)]/10 backdrop-blur-sm p-6 rounded-2xl border border-[var(--color-accent)]/30">
              <p className="text-[var(--color-text)] text-center italic">
                <i className="fas fa-quote-left text-[var(--color-accent)] mr-2" />
                I typically respond within 24-48 hours
                <i className="fas fa-quote-right text-[var(--color-blue)] ml-2" />
              </p>
            </div>
          </div>
          <div>
            <div className="bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg)] p-8 md:p-10 rounded-2xl border border-[var(--color-border)] shadow-2xl">
              <h3 className="text-2xl font-bold text-[var(--color-text)] mb-6 flex items-center gap-2">
                <i className="fas fa-paper-plane text-[var(--color-accent)]" />
                Send Me a Message
              </h3>
              <form id="contact-form" method="POST" className="space-y-6" aria-label="Contact form" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                    <i className="fas fa-user text-[var(--color-accent)] mr-2" />
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    className="w-full px-4 py-3 text-[var(--color-text)] bg-[var(--color-bg-card)]/50 border-2 border-[var(--color-border)] rounded-xl focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/50 transition-all outline-none"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                    <i className="fas fa-envelope text-[var(--color-blue)] mr-2" />
                    Your Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    className="w-full px-4 py-3 text-[var(--color-text)] bg-[var(--color-bg-card)]/50 border-2 border-[var(--color-border)] rounded-xl focus:border-[var(--color-orange)] focus:ring-2 focus:ring-[var(--color-orange)]/50 transition-all outline-none"
                    placeholder="john@example.com"
                  />
                </div>
                <ValidationError
                  prefix="Email"
                  field="email"
                  errors={state.errors}
                  className="text-sm text-rose-400"
                />
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                    <i className="fas fa-comment-dots text-[var(--color-accent)] mr-2" />
                    Your Message
                  </label>
                  <textarea
                    name="message"
                    id="message"
                    rows="6"
                    required
                    className="w-full px-4 py-3 text-[var(--color-text)] bg-[var(--color-bg-card)]/50 border-2 border-[var(--color-border)] rounded-xl focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/50 transition-all outline-none resize-none"
                    placeholder="Tell me about your project or idea..."
                  />
                </div>
                <ValidationError
                  prefix="Message"
                  field="message"
                  errors={state.errors}
                  className="text-sm text-rose-400"
                />
                <input type="text" name="_gotcha" className="hidden" aria-hidden="true" />
                <button
                  type="submit"
                  disabled={isSubmitting || isSuccess}
                  className="w-full py-4 bg-[var(--color-orange)] hover:bg-[var(--color-orange-hover)] text-white font-bold rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(249,115,22,0.3)] focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center justify-center gap-2">
                    <i className="fas fa-paper-plane" />
                    {isSubmitting ? 'Sending...' : isSuccess ? 'Message Sent' : 'Send Message'}
                  </span>
                </button>
                <div className="min-h-[1.5rem]" aria-live="polite">
                  {isSuccess ? (
                    <p className="text-sm font-medium text-emerald-400">Thanks for reaching out! I will respond soon.</p>
                  ) : (
                    <ValidationError
                      prefix="Form"
                      field="FORM"
                      errors={state.errors}
                      className="text-sm font-medium text-rose-400"
                    />
                  )}
                </div>
              </form>
              <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
                <div className="flex flex-wrap justify-center gap-4 text-xs text-[var(--color-text-muted)]">
                  <span className="flex items-center gap-1">
                    <i className="fas fa-shield-alt text-[var(--color-accent)]" />
                    Secure &amp; Private
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="fas fa-bolt text-[var(--color-blue)]" />
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
          <p className="text-[var(--color-text-muted)] mb-6">Prefer a different way to connect?</p>
          <div className="flex flex-wrap justify-center gap-4">
            {altContactLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-6 py-3 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2 ${link.hover}`}
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

