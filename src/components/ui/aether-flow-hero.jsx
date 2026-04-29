import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Download, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePortfolio } from '../../context/PortfolioContext'

const ROLES = [
  'Computer Science Student',
  'Full-Stack Developer',
  'Community Builder',
  'Embedded Systems Enthusiast',
]

function useTypingEffect(strings, typingSpeed = 80, deletingSpeed = 40, pauseMs = 1800) {
  const [display, setDisplay] = useState('')
  const [roleIdx, setRoleIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const current = strings[roleIdx]
    let timeout

    if (!isDeleting && charIdx < current.length) {
      timeout = setTimeout(() => setCharIdx((c) => c + 1), typingSpeed)
    } else if (!isDeleting && charIdx === current.length) {
      timeout = setTimeout(() => setIsDeleting(true), pauseMs)
    } else if (isDeleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx((c) => c - 1), deletingSpeed)
    } else if (isDeleting && charIdx === 0) {
      setIsDeleting(false)
      setRoleIdx((i) => (i + 1) % strings.length)
    }

    setDisplay(current.slice(0, charIdx))
    return () => clearTimeout(timeout)
  }, [charIdx, isDeleting, roleIdx, strings, typingSpeed, deletingSpeed, pauseMs])

  return display
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2 + 0.3, duration: 0.7, ease: 'easeOut' },
  }),
}

const AetherFlowHero = () => {
  const { quickStats, heroSocials } = usePortfolio()
  const typedText = useTypingEffect(ROLES)

  return (
    <section id="home" className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden" aria-label="Hero">
      <div className="hero-hover-panel relative z-10 text-center p-6 max-w-3xl mx-auto">
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 mb-6 backdrop-blur-sm"
        >
          <Zap className="h-4 w-4 text-[var(--color-accent)]" />
          <span className="text-sm font-medium text-[var(--color-text)]">Open to Opportunities</span>
        </motion.div>

        <div className="relative mb-4 flex justify-center">
          <div className="hero-glow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="relative z-10 text-5xl md:text-8xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-[var(--color-text)] to-[var(--color-text-muted)]"
          >
            Dhruv Thakar
          </motion.h1>
        </div>

        {/* Typing subtitle */}
        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-xl md:text-2xl font-semibold mb-4"
          style={{ color: '#7dd3fc', minHeight: '1.8em' }}
          aria-live="polite"
        >
          {typedText}
          <span
            style={{
              display: 'inline-block',
              width: '2px',
              height: '1.1em',
              background: '#7dd3fc',
              marginLeft: '3px',
              verticalAlign: 'text-bottom',
              animation: 'blink-cursor 0.75s step-end infinite',
            }}
            aria-hidden
          />
        </motion.p>

        <motion.p
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="max-w-2xl mx-auto text-base md:text-lg text-[var(--color-text-muted)] mb-8 leading-relaxed"
        >
          I build accessible, human-centered digital experiences across web, data, and AI. Explore my projects, leadership journey, and the technologies I use to bring ideas to life.
        </motion.p>

        {/* Quick stats strip */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex justify-center gap-6 md:gap-10 mb-10"
        >
          {quickStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className={`text-2xl md:text-3xl font-extrabold ${stat.accent}`}>{stat.value}</p>
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA buttons */}
        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible" className="flex flex-wrap justify-center gap-3 mb-10">
          <Link to="/projects" className="theme-btn theme-btn-primary px-7 py-3.5">
            View My Projects
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="/Dhruv_Thakar_Software_Developer_Resume.pdf"
            download="Dhruv_Thakar_Software_Developer_Resume.pdf"
            className="theme-btn theme-btn-secondary px-7 py-3.5"
          >
            <Download className="h-4 w-4" />
            Download Resume
          </a>
        </motion.div>

        {/* Social links */}
        <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible" className="flex justify-center gap-3">
          {heroSocials.map((social) => (
            <a
              key={social.tooltip}
              href={social.href}
              target={social.href.startsWith('mailto') ? undefined : '_blank'}
              rel={social.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
              className={`w-11 h-11 flex items-center justify-center rounded-xl bg-[var(--color-bg-card)]/60 border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)]/50 hover:bg-[var(--color-accent)]/10 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 ${social.ring} focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]`}
              aria-label={social.label}
              title={social.tooltip}
            >
              <i className={`${social.icon} text-lg`} aria-hidden />
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default AetherFlowHero
