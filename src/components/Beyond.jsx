import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import Tilt from 'react-parallax-tilt'
import {
  CalendarRange,
  Check,
  Crown,
  Flame,
  Rocket,
  Sparkles,
  Telescope,
  UsersRound,
} from 'lucide-react'
import SpaceBackground from './SpaceBackground'

const STAT_ICONS = {
  Crown,
  UsersRound,
  CalendarRange,
  Flame,
}

const TITLE_ICONS = {
  Rocket,
  Telescope,
}

function parseStatValue(raw) {
  const s = String(raw).trim()
  const m = s.match(/^(\d+)(.*)$/)
  if (!m) return { target: 0, suffix: s }
  return { target: Number(m[1]), suffix: m[2] ?? '' }
}

function BeyondStatCard({ stat, index }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.45 })
  const { target, suffix } = useMemo(() => parseStatValue(stat.value), [stat.value])
  const [display, setDisplay] = useState(0)
  const Icon = STAT_ICONS[stat.icon] || Sparkles

  useEffect(() => {
    if (!isInView) return
    const duration = 1600
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - (1 - t) ** 3
      setDisplay(Math.round(target * eased))
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [isInView, target])

  return (
    <motion.div
      ref={ref}
      variants={{
        hidden: { opacity: 0, y: 28 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.55, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] } },
      }}
      className="group relative"
    >
      <div
        className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${stat.gradient} opacity-60 blur-xl transition-opacity duration-500 group-hover:opacity-100`}
        aria-hidden
      />
      <div className="relative glass rounded-2xl border border-white/[0.08] bg-[var(--color-bg-card)]/45 px-4 py-6 text-center backdrop-blur-xl transition-all duration-300 hover:border-[var(--color-accent)]/35 hover:shadow-[0_20px_50px_rgba(65,105,225,0.18)] md:px-5 md:py-7">
        <div className="mb-3 flex justify-center">
          <motion.span
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-[var(--color-accent)] shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:border-[var(--color-accent)]/40"
            whileHover={{ rotate: [0, -6, 6, 0] }}
            transition={{ duration: 0.45 }}
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </motion.span>
        </div>
        <div className="relative inline-block">
          <span
            className="pointer-events-none absolute inset-0 -z-10 blur-2xl"
            style={{
              background: 'radial-gradient(circle, rgba(125,211,252,0.35) 0%, transparent 70%)',
            }}
            aria-hidden
          />
          <p className="bg-gradient-to-br from-white via-[var(--color-accent)] to-fuchsia-400 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent md:text-4xl">
            {display}
            {suffix}
          </p>
        </div>
        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)] md:text-xs">{stat.label}</p>
      </div>
    </motion.div>
  )
}

function GoalProgress({ progress, label }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.35 })

  return (
    <div ref={ref} className="mt-8 border-t border-white/10 pt-6">
      <div className="mb-2 flex justify-between text-xs text-[var(--color-text-muted)] md:text-sm">
        <span>{label}</span>
        <span className="bg-gradient-to-r from-rose-400 to-amber-400 bg-clip-text font-semibold text-transparent">{progress}%</span>
      </div>
      <div className="relative h-2.5 overflow-hidden rounded-full bg-white/[0.08]">
        <motion.div
          className="relative h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-orange-400"
          initial={{ width: 0 }}
          animate={{ width: isInView ? `${progress}%` : 0 }}
          transition={{ duration: 1.15, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
        <motion.div
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          animate={isInView ? { x: ['-100%', '200%'] } : {}}
          transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 0.6, ease: 'linear' }}
          aria-hidden
        />
      </div>
    </div>
  )
}

function GoalCard({ goal, index }) {
  const TitleIcon = TITLE_ICONS[goal.titleIcon] || Sparkles

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 40, scale: 0.97 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.65, delay: 0.15 + index * 0.12, ease: [0.25, 0.46, 0.45, 0.94] },
        },
      }}
      className="relative flex min-h-0 flex-1"
    >
      <Tilt
        tiltMaxAngleX={10}
        tiltMaxAngleY={10}
        perspective={900}
        scale={1.02}
        transitionSpeed={400}
        className="h-full w-full"
      >
        <article className="beyond-goal-card group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-[var(--color-bg-card)]/40 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-[var(--color-accent)]/45 hover:shadow-[0_32px_80px_rgba(65,105,225,0.28)] md:p-8">
          <div
            className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent opacity-90`}
            aria-hidden
          />
          <div className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br ${goal.accent} opacity-[0.35]`} aria-hidden />

          <div className="relative mb-6 flex flex-wrap items-start justify-between gap-3">
            <span className="inline-flex items-center rounded-full border border-[var(--color-accent)]/35 bg-[var(--color-bg)]/60 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--color-accent)] shadow-[0_0_20px_rgba(125,211,252,0.15)] backdrop-blur-sm">
              {goal.badge}
            </span>
          </div>

          <div className="relative mb-6 flex items-center gap-4">
            <motion.span
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.07] text-[var(--color-text)] shadow-lg"
              whileHover={{ scale: 1.08, rotate: -3 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            >
              <TitleIcon className="h-7 w-7 text-[var(--color-accent)]" strokeWidth={1.5} aria-hidden />
            </motion.span>
            <h3 className="text-2xl font-extrabold tracking-tight text-[var(--color-text)] md:text-3xl">{goal.title}</h3>
          </div>

          <ul className="relative space-y-3.5">
            {goal.bullets.map((bullet) => (
              <motion.li
                key={bullet}
                className="group/li flex gap-3 text-sm leading-relaxed text-[#c8d4e4] transition-colors duration-200 hover:text-[var(--color-text)] md:text-base"
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-[var(--color-accent)]/25 bg-[var(--color-accent)]/10 text-[var(--color-accent)] transition-all duration-300 group-hover/li:border-[var(--color-accent)]/60 group-hover/li:bg-[var(--color-accent)]/20">
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                </span>
                <span>{bullet}</span>
              </motion.li>
            ))}
          </ul>

          {typeof goal.progress === 'number' && <GoalProgress progress={goal.progress} label={goal.progressLabel} />}

          {goal.vision && (
            <div className="relative mt-6 border-t border-white/10 pt-5">
              <p className="flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <Sparkles className="h-4 w-4 text-amber-300" aria-hidden />
                <span>Vision:</span>
                <span className="bg-gradient-to-r from-fuchsia-300 to-pink-200 bg-clip-text font-semibold text-transparent">{goal.vision}</span>
              </p>
            </div>
          )}
        </article>
      </Tilt>
    </motion.div>
  )
}

function Beyond({ beyondStats, goals }) {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const blobY = useTransform(scrollYProgress, [0, 1], [0, -40])

  return (
    <section
      ref={sectionRef}
      id="beyond"
      className="relative overflow-hidden bg-[var(--color-bg)] py-24 text-[var(--color-text)] md:py-28"
      aria-labelledby="beyond-heading"
    >
      <SpaceBackground />
      <div className="beyond-grid-bg pointer-events-none absolute inset-0 opacity-[0.35]" aria-hidden />
      <div className="beyond-noise pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden />

      <motion.div style={{ y: blobY }} className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-20 top-1/4 h-[min(28rem,70vw)] w-[min(28rem,70vw)] rounded-full bg-[#4169e1]/25 blur-[100px]" />
        <div className="absolute right-[-10%] top-[15%] h-[min(22rem,55vw)] w-[min(22rem,55vw)] rounded-full bg-fuchsia-500/20 blur-[90px]" />
        <div className="absolute bottom-[10%] left-1/3 h-[min(20rem,50vw)] w-[min(20rem,50vw)] rounded-full bg-amber-400/15 blur-[80px]" />
        <motion.div
          className="absolute left-[20%] top-[60%] h-40 w-40 rounded-full bg-[var(--color-accent)]/20 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-[25%] top-[35%] h-52 w-52 rounded-full bg-purple-500/15 blur-3xl"
          animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg)] via-transparent to-[var(--color-bg)] pointer-events-none" aria-hidden />

      <motion.div
        className="relative z-10 mx-auto max-w-6xl px-5 md:px-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.12 }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
        }}
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 24 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
          }}
          className="mb-16 text-center md:mb-20"
        >
          <div className="mb-5 inline-flex items-center gap-3">
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-[var(--color-accent)] md:w-14" />
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-accent)]">
              Leadership & impact
            </span>
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-[var(--color-blue)] md:w-14" />
          </div>
          <h2 id="beyond-heading" className="mb-5 text-4xl font-extrabold tracking-tight md:text-6xl md:leading-[1.1]">
            <span className="bg-gradient-to-br from-white via-[var(--color-text)] to-[var(--color-accent)] bg-clip-text text-transparent">
              Beyond the Classroom
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-[#b8c5d8] md:text-lg">
            I lead, organize, and show up for the community—turning campus energy into real initiatives, stronger teams, and measurable reach.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1, delayChildren: 0.06 } },
          }}
          className="mb-16 grid grid-cols-2 gap-3 md:mb-20 md:grid-cols-4 md:gap-5"
        >
          {beyondStats.map((stat, i) => (
            <BeyondStatCard key={stat.label} stat={stat} index={i} />
          ))}
        </motion.div>

        <div className="relative">
          <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-[var(--color-accent)]/50 via-fuchsia-500/30 to-purple-500/40 md:block" aria-hidden />
          <motion.div
            className="pointer-events-none absolute left-1/2 top-[42%] hidden h-3 w-3 -translate-x-1/2 rounded-full bg-[var(--color-accent)] shadow-[0_0_24px_rgba(125,211,252,0.9)] md:block"
            animate={{ scale: [1, 1.2, 1], opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.18 }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.18, delayChildren: 0.08 } },
            }}
            className="flex flex-col gap-10 md:flex-row md:items-stretch md:gap-10"
          >
            {goals.map((goal, index) => (
              <GoalCard key={goal.title} goal={goal} index={index} />
            ))}
          </motion.div>

          <div className="relative mt-10 md:hidden" aria-hidden>
            <div className="mx-auto h-16 w-px bg-gradient-to-b from-[var(--color-accent)]/60 to-purple-500/40" />
          </div>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: { opacity: 0, y: 16 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
          }}
          className="relative mt-16 text-center md:mt-20"
        >
          <div className="mx-auto max-w-3xl rounded-2xl border border-white/[0.08] bg-[var(--color-bg-card)]/35 px-6 py-5 backdrop-blur-md md:px-10 md:py-6">
            <p className="text-lg font-semibold tracking-tight text-[var(--color-text)] md:text-xl">
              <span className="mr-2 inline-block" aria-hidden>
                ⚡
              </span>
              <span className="bg-gradient-to-r from-[var(--color-accent)] via-fuchsia-300 to-amber-300 bg-clip-text text-transparent">
                Vision: Leading innovation at the intersection of AI and real-world impact
              </span>
            </p>
            <p className="mt-2 text-sm text-[var(--color-text-muted)] md:text-base">
              Building technology that scales empathy, clarity, and opportunity—not just code.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default Beyond
