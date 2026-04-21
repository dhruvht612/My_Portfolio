import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Tilt from 'react-parallax-tilt'
import { Link } from 'react-router-dom'
import { BrainCircuit, Code2, Compass, Download, Mail, MapPin, Rocket, Sparkles, UserRound } from 'lucide-react'
import { MEDIA } from '../constants/media'
import AnimatedSection from './AnimatedSection'

const MotionDiv = motion.div

function About({ aboutTab, setAboutTab, aboutTabs, aboutCounters }) {
  const tabOptions = [
    { id: 'story', label: 'My Story' },
    { id: 'interests', label: 'Interests' },
    { id: 'facts', label: 'Fun Facts' },
  ]
  const tabRefs = useRef([])
  const statsRef = useRef(null)
  const [animatedCounts, setAnimatedCounts] = useState(() => aboutCounters.map(() => 0))
  const [hasCounted, setHasCounted] = useState(false)
  const activeTabIndex = tabOptions.findIndex((tab) => tab.id === aboutTab)

  useEffect(() => {
    const onKeyDown = (event) => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return
      if (!tabRefs.current.includes(document.activeElement)) return

      event.preventDefault()
      const currentIndex = tabOptions.findIndex((tab) => tab.id === aboutTab)
      let nextIndex = currentIndex
      if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabOptions.length
      if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabOptions.length) % tabOptions.length
      if (event.key === 'Home') nextIndex = 0
      if (event.key === 'End') nextIndex = tabOptions.length - 1

      setAboutTab(tabOptions[nextIndex].id)
      tabRefs.current[nextIndex]?.focus()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [aboutTab, setAboutTab, tabOptions])

  useEffect(() => {
    if (!statsRef.current || hasCounted) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setHasCounted(true)
        const duration = 1400
        const start = performance.now()

        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1)
          const eased = 1 - (1 - progress) * (1 - progress)
          setAnimatedCounts(aboutCounters.map((counter) => Math.round(counter.target * eased)))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.25 }
    )

    observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [aboutCounters, hasCounted])

  const counterIcons = useMemo(
    () => ({
      Projects: 'fas fa-folder-open',
      'Technologies Mastered': 'fas fa-microchip',
      'Years of Experience': 'fas fa-briefcase',
      'Leadership Roles': 'fas fa-users',
    }),
    []
  )
  const signatureInterests = [
    { title: 'AI Products', copy: 'Designing practical AI flows that solve real user pain points.', icon: BrainCircuit },
    { title: 'Full-Stack Systems', copy: 'Building polished frontend experiences backed by reliable APIs.', icon: Code2 },
    { title: 'Startup Execution', copy: 'Turning rough ideas into shipped, testable products quickly.', icon: Rocket },
    { title: 'Hackathons', copy: 'Shipping under pressure with strong teams and clear priorities.', icon: Sparkles },
  ]

  return (
    <section id="about" className="section-fade-in relative z-10 min-h-screen overflow-hidden px-6 py-24 text-[var(--color-text)]" aria-labelledby="about-heading">
      <div className="max-w-6xl mx-auto relative z-10">
        <AnimatedSection className="text-center mb-12" delayOrder={0}>
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-1 w-12 bg-gradient-to-r from-transparent to-[var(--color-accent)] rounded-full" />
            <UserRound className="h-10 w-10 text-[var(--color-accent)]" aria-hidden="true" />
            <div className="h-1 w-12 bg-gradient-to-l from-transparent to-[var(--color-blue)] rounded-full" />
          </div>
          <h2 id="about-heading" className="text-5xl md:text-6xl font-extrabold mb-4 animate-gradient">
            About Me
          </h2>
          <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto leading-relaxed">
            Building meaningful software with product thinking, technical depth, and leadership mindset.
          </p>
        </AnimatedSection>
        <div className="grid md:grid-cols-5 gap-12 mb-20">
          <AnimatedSection className="md:col-span-2 flex flex-col items-center" delayOrder={0}>
            <Tilt tiltMaxAngleX={7} tiltMaxAngleY={7} perspective={900} scale={1.02} transitionSpeed={350} className="w-full">
              <div className="relative mb-6 group">
                <div className="absolute -inset-6 bg-gradient-to-br from-[var(--color-accent)]/30 via-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl" />
                <img
                  src={MEDIA.profile}
                  alt="Dhruv Thakar standing near Niagara Falls"
                  className="relative mx-auto w-64 h-64 rounded-2xl object-cover shadow-2xl transition-all duration-500 group-hover:scale-[1.03] group-hover:shadow-[0_0_42px_rgba(125,211,252,0.3)] border border-white/10"
                  loading="lazy"
                />
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs rounded-full bg-[var(--color-bg)]/75 text-[var(--color-text)] border border-[var(--color-border)] backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  Niagara Falls, ON
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {['CS Student', 'Director @ CCubed', 'Full-Stack Developer'].map((badge) => (
                    <span key={badge} className="px-3 py-1 rounded-full text-[11px] font-semibold border border-[var(--color-accent)]/35 bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </Tilt>
            <AnimatedSection className="w-full space-y-4 mb-8" delayOrder={1}>
              <div className="glass p-4 rounded-xl hover:border-[var(--color-accent)]/50 transition-all">
                <div className="flex items-center gap-3">
                  <Compass className="h-6 w-6 text-[var(--color-accent)]" />
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">Education</p>
                    <p className="text-sm font-semibold">Ontario Tech University</p>
                  </div>
                </div>
              </div>
              <div className="glass p-4 rounded-xl hover:border-[var(--color-accent-hover)]/50 transition-all">
                <div className="flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-[var(--color-accent-hover)]" />
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">Location</p>
                    <p className="text-sm font-semibold">Oshawa, Ontario</p>
                  </div>
                </div>
              </div>
              <div className="glass p-4 rounded-xl hover:border-[var(--color-accent)]/50 transition-all">
                <div className="flex items-center gap-3">
                  <Mail className="h-6 w-6 text-[var(--color-accent)]" />
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">Email</p>
                    <p className="text-xs font-semibold">thakardhruvh@gmail.com</p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent mb-6" />
            <div className="w-full space-y-3">
              <a
                href="/DhruvThakar_2026.pdf"
                download="DhruvThakar_2026.pdf"
                className="theme-btn theme-btn-primary block w-full py-3 px-6 text-center focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)]"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download Resume
              </a>
              <Link
                to="/contact"
                className="theme-btn theme-btn-secondary block w-full py-3 px-6 text-center focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                Get In Touch
              </Link>
            </div>
          </AnimatedSection>
          <AnimatedSection className="md:col-span-3 space-y-6" delayOrder={1}>
            <div className="max-w-xl mb-6">
              <div className="relative grid grid-cols-3 p-1 rounded-xl bg-[var(--color-bg-card)]/55 border border-[var(--color-border)]">
                <div
                  className="absolute top-1 bottom-1 rounded-lg bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/40 transition-all duration-300 ease-out"
                  style={{
                    width: 'calc(33.333% - 0.5rem)',
                    left: `calc(${Math.max(activeTabIndex, 0) * 33.333}% + 0.25rem)`,
                  }}
                  aria-hidden="true"
                />
              {tabOptions.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                    id={`about-tab-${tab.id}`}
                    ref={(el) => {
                      if (el) tabRefs.current[tabOptions.findIndex((t) => t.id === tab.id)] = el
                    }}
                    role="tab"
                    aria-selected={aboutTab === tab.id}
                    aria-controls={`about-panel-${tab.id}`}
                    tabIndex={aboutTab === tab.id ? 0 : -1}
                  className={`about-tab relative z-10 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    aboutTab === tab.id ? 'text-[var(--color-accent)]' : 'text-[var(--color-text)]'
                  }`}
                  onClick={() => setAboutTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
              </div>
            </div>
            <div className="glass-strong rounded-xl p-6 border border-[var(--glass-border)] min-h-[360px]">
              <AnimatePresence mode="wait">
              {aboutTab === 'story' && (
                <MotionDiv
                  key="story"
                  id="about-panel-story"
                  role="tabpanel"
                  aria-labelledby="about-tab-story"
                  className="space-y-4"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <p className="text-xl md:text-2xl font-bold leading-tight bg-gradient-to-r from-[var(--color-accent)] via-blue-300 to-purple-300 bg-clip-text text-transparent">
                    I build technology that feels intuitive, useful, and impossible to ignore.
                  </p>
                  <div className="space-y-3 text-[#c0cde0]">
                    <p><span className="text-[var(--color-text)] font-semibold">Who I am:</span> Dhruv Thakar, a Computer Science student and community-first builder focused on real outcomes.</p>
                    <p><span className="text-[var(--color-text)] font-semibold">What I build:</span> Full-stack, AI-enhanced products that blend strong engineering with clean UX.</p>
                    <p><span className="text-[var(--color-text)] font-semibold">What I’m aiming for:</span> To lead teams shipping impactful software at the intersection of product, AI, and accessibility.</p>
                  </div>
                </MotionDiv>
              )}
              {aboutTab === 'interests' && (
                <MotionDiv
                  key="interests"
                  id="about-panel-interests"
                  role="tabpanel"
                  aria-labelledby="about-tab-interests"
                  className="grid sm:grid-cols-2 gap-4"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  {signatureInterests.map((interest) => (
                    <MotionDiv key={interest.title} className="glass p-5 rounded-xl hover:border-[var(--color-accent)]/50 transition-all hover:scale-[1.02]" whileHover={{ y: -3 }}>
                      <div className="flex items-start gap-3">
                        <interest.icon className="h-7 w-7 text-[var(--color-accent)] mt-0.5" />
                        <div>
                          <h4 className="font-bold text-white mb-2">{interest.title}</h4>
                          <p className="text-sm text-[var(--color-text-muted)]">{interest.copy}</p>
                        </div>
                      </div>
                    </MotionDiv>
                  ))}
                </MotionDiv>
              )}
              {aboutTab === 'facts' && (
                <MotionDiv
                  key="facts"
                  id="about-panel-facts"
                  role="tabpanel"
                  aria-labelledby="about-tab-facts"
                  className="space-y-4"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  {aboutTabs.facts.map((fact) => (
                    <div key={fact.title} className="flex items-start gap-4 bg-[var(--color-bg-card)]/50 backdrop-blur-sm p-5 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-blue)] rounded-full flex items-center justify-center text-2xl">{fact.emoji}</div>
                      <div>
                        <h4 className="font-bold text-white mb-1">{fact.title}</h4>
                        <p className="text-sm text-[var(--color-text-muted)]">{fact.copy}</p>
                      </div>
                    </div>
                  ))}
                </MotionDiv>
              )}
              </AnimatePresence>
            </div>
          </AnimatedSection>
        </div>
        <AnimatedSection className="grid grid-cols-2 md:grid-cols-4 gap-6" delayOrder={2}>
          {aboutCounters.map((counter, idx) => (
            <div
              key={counter.label}
              ref={idx === 0 ? statsRef : null}
              className="p-6 rounded-xl border border-[var(--color-accent)]/30 text-center bg-[var(--color-bg-card)]/60 backdrop-blur-sm hover:scale-105 hover:border-[var(--color-accent)]/45 transition-all"
            >
              <i className={`${counterIcons[counter.label] ?? 'fas fa-chart-line'} text-lg text-[var(--color-accent)] mb-3`} aria-hidden="true" />
              <div className={`text-4xl font-bold mb-2 ${counter.accent}`}>
                {animatedCounts[idx]}{counter.suffix ?? ''}
              </div>
              <div className="text-sm text-[var(--color-text-muted)]">{counter.label}</div>
            </div>
          ))}
        </AnimatedSection>
      </div>
    </section>
  )
}

export default About

