import { useState } from 'react'
import { motion } from 'framer-motion'
import Tilt from 'react-parallax-tilt'
import { Briefcase, Building2, CheckCircle2, Compass, GraduationCap, MapPin, Sparkles } from 'lucide-react'
import { MEDIA } from '../constants/media'

const PROGRESS = 50
const MILESTONES = ['Year 1', 'Year 2', 'Year 3', 'Year 4']

function Education({ focusAreas, highlightCards }) {
  const [activeFocus, setActiveFocus] = useState(null)

  return (
    <section id="education" className="section-fade-in relative z-10 min-h-screen overflow-hidden px-6 py-24 text-[var(--color-text)]" aria-labelledby="education-heading">
      <motion.div
        className="max-w-6xl mx-auto relative z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.12 }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } } }}
      >
        <motion.div className="text-center mb-12" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-1 w-12 bg-gradient-to-r from-transparent to-[var(--color-accent)] rounded-full" />
            <GraduationCap className="h-10 w-10 text-[var(--color-accent)]" aria-hidden="true" />
            <div className="h-1 w-12 bg-gradient-to-l from-transparent to-[var(--color-blue)] rounded-full" />
          </div>
          <h2 id="education-heading" className="text-5xl md:text-6xl font-extrabold mb-4 animate-gradient">Education Journey</h2>
          <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto leading-relaxed">
            Growing from fundamentals to real-world engineering through projects, collaboration, and continuous iteration.
          </p>
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }} className="mb-12">
          <Tilt tiltMaxAngleX={6} tiltMaxAngleY={6} perspective={900} scale={1.01} transitionSpeed={350}>
            <article className="glass-card group relative p-8 md:p-12 rounded-2xl shadow-2xl hover:border-[var(--color-accent)]/45 hover:shadow-[0_0_45px_rgba(125,211,252,0.22)] transition-all duration-500">
              <div className="absolute -top-4 left-8">
                <span className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-blue)] text-[var(--color-bg)] px-5 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 border border-white/30">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                  </span>
                  Currently Enrolled
                </span>
              </div>
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
                <div className="relative flex-shrink-0">
                  <div className="absolute -inset-4 bg-gradient-to-br from-[var(--color-accent)]/25 to-[var(--color-blue)]/20 rounded-3xl blur-2xl" />
                  <img
                    src={MEDIA.ontarioTech}
                    alt="Ontario Tech University Logo"
                    className="relative w-32 h-32 rounded-2xl object-contain border-2 border-[var(--color-accent)]/30 bg-white p-3 shadow-2xl group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 text-center md:text-left space-y-5">
                  <div>
                    <h3 className="text-3xl font-bold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-accent)] transition-colors">Ontario Tech University</h3>
                    <p className="text-xl font-semibold bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-blue)] bg-clip-text text-transparent">Bachelor of Science in Computer Science</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-[var(--color-text-muted)]">
                    <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[var(--color-accent)]" /> Oshawa, Ontario, Canada</span>
                    <span className="flex items-center gap-2"><Building2 className="h-4 w-4 text-[var(--color-blue)]" /> Sep 2024 - Apr 2028</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--color-text-muted)]">Academic Progress</span>
                      <span className="text-[var(--color-accent)] font-semibold">Year 2 of 4 · You are here</span>
                    </div>
                    <div className="relative pt-4">
                      <div className="h-3 bg-[var(--color-bg)]/80 rounded-full overflow-hidden border border-white/10">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${PROGRESS}%` }}
                          viewport={{ once: true, amount: 0.6 }}
                          transition={{ duration: 1.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                          className="h-full bg-gradient-to-r from-[var(--color-accent)] via-[var(--color-blue)] to-teal-400 rounded-full shadow-[0_0_20px_rgba(56,189,248,0.45)]"
                        />
                        <motion.div
                          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                          animate={{ x: ['-100%', '240%'] }}
                          transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.1, ease: 'linear' }}
                        />
                      </div>
                      <div className="mt-2 grid grid-cols-4 text-[10px] text-[var(--color-text-muted)]">
                        {MILESTONES.map((year, idx) => (
                          <div key={year} className={`text-center ${idx === 1 ? 'text-[var(--color-accent)] font-semibold' : ''}`}>{year}</div>
                        ))}
                      </div>
                      <div className="absolute top-0 left-1/2 -translate-x-1/2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/40 text-[var(--color-accent)]">You are here</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[var(--color-text)] leading-relaxed">
                    Building a strong foundation in software engineering, data structures, and computational problem-solving while translating classroom theory into deployable applications.
                  </p>

                  <div className="pt-2">
                    <h4 className="text-sm font-semibold text-[var(--color-text-muted)] mb-3 uppercase tracking-wide">Key Focus Areas</h4>
                    <motion.div
                      className="flex flex-wrap gap-2"
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, amount: 0.4 }}
                      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
                    >
                      {focusAreas.map((focus) => (
                        <motion.button
                          key={focus}
                          type="button"
                          onClick={() => setActiveFocus((prev) => (prev === focus ? null : focus))}
                          variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                          className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                            activeFocus === focus
                              ? 'bg-blue-500/25 text-blue-100 border-blue-400/60 shadow-[0_0_20px_rgba(59,130,246,0.35)] scale-105'
                              : 'bg-blue-500/10 text-blue-200 border-blue-500/30 hover:bg-blue-500/20 hover:scale-105 hover:shadow-[0_0_16px_rgba(59,130,246,0.22)]'
                          }`}
                        >
                          {focus}
                        </motion.button>
                      ))}
                    </motion.div>
                  </div>
                </div>
              </div>
            </article>
          </Tilt>
        </motion.div>

        <motion.div className="grid md:grid-cols-3 gap-6 mb-10" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}>
          {highlightCards.map((card) => (
            <motion.article
              key={card.title}
              variants={{ hidden: { opacity: 0, y: 22, scale: 0.98 }, visible: { opacity: 1, y: 0, scale: 1 } }}
              className={`group bg-gradient-to-br ${card.accent} p-6 rounded-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_26px_rgba(255,255,255,0.12)] transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="flex items-center gap-4 mb-4">
                <motion.div
                  whileHover={{ rotate: [0, -6, 6, 0] }}
                  transition={{ duration: 0.45 }}
                  className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 text-[var(--color-text)]"
                >
                  {card.title === 'Foundations' && <GraduationCap className="h-7 w-7" />}
                  {card.title === 'Hands-On Learning' && <Briefcase className="h-7 w-7" />}
                  {card.title === 'Engineering Skills' && <Compass className="h-7 w-7" />}
                </motion.div>
                <h3 className="text-lg font-bold text-[var(--color-text)]">{card.title}</h3>
              </div>
              <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                {card.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-300 mt-0.5 flex-shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </motion.div>

        <motion.section
          variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
          className="rounded-2xl border border-white/10 bg-[var(--color-bg-card)]/40 backdrop-blur-md p-6 md:p-8 mb-8"
        >
          <h3 className="text-2xl font-bold mb-4 text-[var(--color-text)] flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[var(--color-accent)]" />
            What I&apos;ve Built So Far
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 p-4">
              <p className="text-2xl font-extrabold text-[var(--color-accent)]">15+</p>
              <p className="text-sm text-[var(--color-text-muted)]">Projects completed across coursework and independent builds</p>
            </div>
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 p-4">
              <p className="text-2xl font-extrabold text-teal-300">Multiple</p>
              <p className="text-sm text-[var(--color-text-muted)]">Hackathon and team-based engineering experiences</p>
            </div>
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 p-4">
              <p className="text-2xl font-extrabold text-purple-300">Real-world</p>
              <p className="text-sm text-[var(--color-text-muted)]">Applications focused on accessibility, AI, and usability</p>
            </div>
          </div>
        </motion.section>

        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="text-center">
          <p className="text-lg md:text-xl font-semibold bg-gradient-to-r from-[var(--color-accent)] via-blue-300 to-teal-300 bg-clip-text text-transparent">
            Focus: Building software that is technically rigorous, human-centered, and ready for real impact.
          </p>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default Education

