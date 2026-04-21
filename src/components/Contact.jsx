import { useState, useCallback } from 'react'
import { useForm, ValidationError } from '@formspree/react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Copy, Globe, Mail, MapPin, Rocket, Send, Sparkles, Users } from 'lucide-react'
import AnimatedSection from './AnimatedSection'
import Toast from './Toast'
import AnimatedForm, { ContactTechOrbit } from './ui/modern-animated-sign-in'

const FORMSPREE_FORM_ID = import.meta.env.VITE_FORMSPREE_FORM_ID ?? 'mwpabokg'

function Contact({ contactCards, heroSocials, altContactLinks }) {
  const [state, handleSubmit] = useForm(FORMSPREE_FORM_ID)
  const [copyToastVisible, setCopyToastVisible] = useState(false)
  const isSubmitting = state.submitting
  const isSuccess = state.succeeded
  const socialIconMap = {
    GitHub: Globe,
    LinkedIn: Users,
    Email: Mail,
  }

  const copyEmail = useCallback(async () => {
    const emailCard = contactCards.find((c) => c.title === 'Email')
    const email = emailCard?.value ?? 'thakardhruvh@gmail.com'
    try {
      await navigator.clipboard.writeText(email)
      setCopyToastVisible(true)
    } catch {
      // fallback: open mailto
      window.location.href = `mailto:${email}`
    }
  }, [contactCards])

  return (
    <section id="contact" className="section-fade-in relative z-10 min-h-screen overflow-hidden px-6 py-24" aria-labelledby="contact-heading">
      <div className="max-w-6xl mx-auto relative z-10">
        <AnimatedSection className="text-center mb-12" delayOrder={0}>
          <h2 id="contact-heading" className="text-5xl md:text-6xl font-extrabold mb-4 animate-gradient">
            Let&apos;s Build Something Meaningful
          </h2>
          <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto leading-relaxed">
            Have an idea, internship opportunity, or ambitious product concept? I&apos;d love to collaborate and bring it to life.
          </p>
        </AnimatedSection>
        <div className="grid lg:grid-cols-2 gap-10 xl:gap-14">
          <div className="space-y-8">
            <div className="space-y-4">
              {contactCards.map((card, i) => {
                const isEmail = card.title === 'Email'
                return (
                  <AnimatedSection key={card.title} delayOrder={i} className="space-y-4">
                    <motion.div
                      role={isEmail ? 'button' : undefined}
                      tabIndex={isEmail ? 0 : undefined}
                      onClick={isEmail ? copyEmail : undefined}
                      onKeyDown={isEmail ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); copyEmail() } } : undefined}
                      whileHover={{ y: -3 }}
                      className={`glass-card group p-6 rounded-2xl hover:border-[var(--color-accent)]/50 hover:shadow-[0_0_30px_rgba(125,211,252,0.2)] transition-all duration-300 hover:scale-[1.02] ${isEmail ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <motion.div whileHover={{ rotate: [0, -6, 6, 0] }} transition={{ duration: 0.45 }} className={`w-14 h-14 bg-gradient-to-br ${card.accent} rounded-xl flex items-center justify-center border border-[var(--color-border)] group-hover:scale-110 transition-transform duration-300`}>
                          <i className={`${card.icon} text-2xl text-[var(--color-accent)]`} />
                        </motion.div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-[var(--color-text)] mb-1 flex items-center gap-2">
                            {card.title}
                            {isEmail && <Copy className="h-3.5 w-3.5 text-[var(--color-text-muted)] opacity-70 group-hover:opacity-100" aria-hidden />}
                          </h3>
                          {isEmail ? (
                            <span className="text-[var(--color-text-muted)] text-sm">{card.value}</span>
                          ) : card.href ? (
                            <a href={card.href} className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors text-sm">
                              {card.value}
                            </a>
                          ) : (
                            <p className="text-[var(--color-text-muted)] text-sm">{card.value}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </AnimatedSection>
                )
              })}
            </div>
            <div className="glass-card p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-[var(--color-text)] mb-6 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[var(--color-accent)]" />
                Connect on Social Media
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {heroSocials.slice(0, 3).map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center gap-3 p-4 bg-[var(--color-bg-card)]/40 border border-[var(--color-border)] rounded-xl hover:bg-[var(--color-blue)]/35 hover:border-[var(--color-accent)]/50 transition-all duration-300 hover:scale-110"
                    whileHover={{ y: -3, scale: 1.06 }}
                  >
                    {(() => {
                      const Icon = socialIconMap[social.tooltip] ?? Sparkles
                      return <Icon className="h-7 w-7 text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] transition-colors" />
                    })()}
                    <span className="text-xs text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] font-semibold">{social.tooltip}</span>
                  </motion.a>
                ))}
              </div>
            </div>
            <div className="glass-card-strong p-6 rounded-2xl shadow-[0_0_30px_rgba(65,105,225,0.12)]">
              <p className="text-[var(--color-text)] text-center italic">
                <i className="fas fa-quote-left text-[var(--color-accent)] mr-2" />
                I typically respond within 24-48 hours
                <i className="fas fa-quote-right text-[var(--color-blue)] ml-2" />
              </p>
            </div>
          </div>
          <div>
            <div className="relative bg-gradient-to-br from-[var(--color-bg-card)]/95 to-[var(--color-bg)]/95 p-8 md:p-10 rounded-2xl border border-[var(--color-border)] shadow-2xl backdrop-blur-md overflow-hidden">
              <div className="absolute -top-24 -right-16 w-56 h-56 rounded-full bg-[var(--color-accent)]/10 blur-3xl pointer-events-none" aria-hidden="true" />
              <div className="hidden lg:block h-52 mb-6">
                <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <div className="relative overflow-hidden rounded-2xl border border-[var(--color-accent)]/20 bg-gradient-to-br from-[var(--color-bg)]/70 to-[var(--color-bg-card)]/80 p-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-orange-500/10 pointer-events-none" />
                    <p className="relative text-lg font-bold text-[var(--color-text)] mb-2">Open to internships, collaborations, and ambitious product ideas.</p>
                    <p className="relative text-sm text-[var(--color-text-muted)] mb-4">If you&apos;re building something meaningful, let&apos;s ship it together.</p>
                    <a href="mailto:thakardhruvh@gmail.com" className="relative theme-btn theme-btn-primary px-4 py-2.5 text-sm inline-flex">
                      <Rocket className="h-4 w-4" />
                      Start a conversation
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                </motion.div>
              </div>
              <AnimatedForm
                header="Send Me a Message"
                subHeader="Share your idea, project details, or collaboration request."
                fields={[
                  { name: 'name', label: 'Your Name', required: true, type: 'text', placeholder: 'John Doe' },
                  { name: 'email', label: 'Your Email', required: true, type: 'email', placeholder: 'john@example.com' },
                  { name: 'message', label: 'Your Message', required: true, type: 'textarea', placeholder: 'Tell me about your project or idea...' },
                ]}
                submitButton="Send Message"
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                isSuccess={isSuccess}
                serverError={<ValidationError prefix="Form" field="FORM" errors={state.errors} className="text-sm font-medium text-rose-400" />}
                successMessage="Thanks for reaching out! I will respond soon."
              />
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-emerald-300 text-sm font-medium flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Message sent successfully — I&apos;ll get back to you shortly.
                </motion.div>
              )}
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
                {...(link.download ? { download: link.download } : {})}
                {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className={`px-6 py-3 bg-[var(--color-bg-card)]/60 backdrop-blur-sm border border-[var(--color-border)] rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_24px_rgba(125,211,252,0.15)] flex items-center gap-2 ${link.hover}`}
              >
                <Sparkles className="h-4 w-4" />
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
      <Toast message="Email copied to clipboard!" visible={copyToastVisible} onDismiss={() => setCopyToastVisible(false)} duration={3000} />
    </section>
  )
}

export default Contact

