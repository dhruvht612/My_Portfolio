import { motion } from 'framer-motion'
import { ArrowRight, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2 + 0.5,
      duration: 0.8,
      ease: 'easeInOut',
    },
  }),
}

const AetherFlowHero = () => {
  return (
    <section id="home" className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden" aria-label="Hero">
      <div className="hero-hover-panel relative z-10 text-center p-6">
        <motion.div
          custom={0}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 mb-6 backdrop-blur-sm"
        >
          <Zap className="h-4 w-4 text-[var(--color-accent)]" />
          <span className="text-sm font-medium text-[var(--color-text)]">Computer Science Student · Full-Stack Developer</span>
        </motion.div>

        <motion.h1
          custom={1}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="text-5xl md:text-8xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-[var(--color-text)] to-[var(--color-text-muted)]"
        >
          Dhruv Thakar
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="max-w-2xl mx-auto text-lg text-[var(--color-text-muted)] mb-10"
        >
          I build accessible, human-centered digital experiences across web, data, and AI. Explore my projects, leadership journey, and the technologies I use to bring ideas to life.
        </motion.p>

        <motion.div custom={3} variants={fadeUpVariants} initial="hidden" animate="visible">
          <Link to="/projects" className="theme-btn theme-btn-primary px-8 py-4 mx-auto">
            View My Projects
            <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default AetherFlowHero
