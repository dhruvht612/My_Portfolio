import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Download, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePortfolio } from '../../context/PortfolioContext'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useMagnetic } from '../../hooks/useMagnetic'
import { heroItem } from '../../lib/motion'
import RoleCarousel from '../hero/RoleCarousel'
import HeroStatCard from '../hero/HeroStatCard'
import CurrentlyBuilding from '../hero/CurrentlyBuilding'
import HeroSocials from '../hero/HeroSocials'

/* Entrance order: 0 badge, 1 name, 2 roles, 3 description, 4 stats, 5 CTAs,
   6 currently-building, 7 socials. The stats share slot 4 and are nudged by a
   fraction of a step each so they read as a sweep without pushing the tail of
   the sequence past ~1000ms. */
const STAT_STEP = 0.4

/* Hero exit drift. Completes before the section is fully off-screen.
   Under reduced motion the output ranges collapse to identity, so the hero holds
   opacity 1 / y 0 at every scroll position. useScroll cannot be called
   conditionally, so neutering the ranges — rather than dropping the `style` prop
   — is what guarantees the section is never left stranded mid-fade. */
const EXIT_RANGE = [0, 0.65]
const EXIT_OPACITY = [1, 0.25]
const EXIT_Y = [0, 40]
/* Stable module-level identity ranges (a fresh array each render is wasteful). */
const STILL_OPACITY = [1, 1]
const STILL_Y = [0, 0]

const AetherFlowHero = () => {
  const { heroRoles, currentlyBuilding, quickStats, heroSocials } = usePortfolio()
  const reduced = useReducedMotion()

  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const exitOpacity = useTransform(scrollYProgress, EXIT_RANGE, reduced ? STILL_OPACITY : EXIT_OPACITY)
  const exitY = useTransform(scrollYProgress, EXIT_RANGE, reduced ? STILL_Y : EXIT_Y)

  /* JS owns `transform` on these two buttons; the press feedback lives on a
     wrapper so framer-motion never fights the magnetic offset. */
  const projectsRef = useMagnetic()
  const resumeRef = useMagnetic()

  return (
    <motion.section
      ref={sectionRef}
      id="home"
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
      aria-label="Hero"
      style={{ opacity: exitOpacity, y: exitY }}
    >
      <div className="hero-hover-panel relative z-10 text-center p-6 max-w-3xl mx-auto">
        <motion.div
          {...heroItem(0, reduced)}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 mb-6 backdrop-blur-sm"
        >
          <Zap className="h-4 w-4 text-[var(--color-accent)]" />
          <span className="text-sm font-medium text-[var(--color-text)]">Open to Opportunities</span>
        </motion.div>

        <div className="relative mb-4 flex justify-center">
          <div className="hero-glow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          <motion.h1
            {...heroItem(1, reduced)}
            className="relative z-10 text-5xl md:text-8xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-[var(--color-text)] to-[var(--color-text-muted)]"
          >
            Dhruv Thakar
          </motion.h1>
        </div>

        {/* Rotating role line */}
        <motion.div
          {...heroItem(2, reduced)}
          className="mb-4"
          style={{ color: 'var(--color-accent)' }}
        >
          <RoleCarousel roles={heroRoles} className="text-xl md:text-2xl font-semibold" />
        </motion.div>

        <motion.p
          {...heroItem(3, reduced)}
          className="max-w-2xl mx-auto text-base md:text-lg text-[var(--color-text-muted)] mb-8 leading-relaxed"
        >
          I build accessible, human-centered digital experiences across web, data, and AI. Explore my projects, leadership journey, and the technologies I use to bring ideas to life.
        </motion.p>

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-10">
          {quickStats.map((stat, index) => (
            <motion.div key={stat.label} {...heroItem(4 + index * STAT_STEP, reduced)} className="h-full">
              <HeroStatCard
                value={stat.value}
                label={stat.label}
                detail={stat.detail}
                accent={stat.accent}
              />
            </motion.div>
          ))}
        </div>

        {/* CTA buttons */}
        <motion.div {...heroItem(5, reduced)} className="flex flex-wrap justify-center gap-3 mb-10">
          <motion.div className="inline-flex" whileTap={reduced ? undefined : { scale: 0.97 }}>
            <Link ref={projectsRef} to="/projects" className="theme-btn theme-btn-primary magnetic-btn px-7 py-3.5">
              View My Projects
              <ArrowRight className="magnetic-btn__icon h-4 w-4" />
            </Link>
          </motion.div>
          <motion.div className="inline-flex" whileTap={reduced ? undefined : { scale: 0.97 }}>
            <a
              ref={resumeRef}
              href="/Dhruv_Thakar_Software_Developer_Resume.pdf"
              download="Dhruv_Thakar_Software_Developer_Resume.pdf"
              className="theme-btn theme-btn-secondary magnetic-btn px-7 py-3.5"
            >
              <Download className="magnetic-btn__icon h-4 w-4" />
              Download Resume
            </a>
          </motion.div>
        </motion.div>

        {/* Currently building */}
        <motion.div {...heroItem(6, reduced)} className="mb-10 flex justify-center">
          <CurrentlyBuilding data={currentlyBuilding} />
        </motion.div>

        {/* Social links */}
        <motion.div {...heroItem(7, reduced)}>
          <HeroSocials socials={heroSocials} />
        </motion.div>
      </div>
    </motion.section>
  )
}

export default AetherFlowHero
