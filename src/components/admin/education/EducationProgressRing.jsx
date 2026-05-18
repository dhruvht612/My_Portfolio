import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { yearFromProgress } from './educationInsights'

const R = 54
const C = 2 * Math.PI * R

export default function EducationProgressRing({ percent = 0, isActive }) {
  const p = Math.max(0, Math.min(100, Number(percent) || 0))
  const offset = C - (p / 100) * C
  const year = yearFromProgress(p)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let frame
    const start = performance.now()
    const from = display
    const dur = 720
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur)
      const eased = 1 - (1 - t) ** 3
      setDisplay(Math.round(from + (p - from) * eased))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- animate toward new target only
  }, [p])

  return (
    <div className="edu-progress-ring relative flex flex-col items-center">
      <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
        <circle cx="70" cy="70" r={R} fill="none" stroke="rgba(148,163,184,0.12)" strokeWidth="10" />
        <motion.circle
          cx="70"
          cy="70"
          r={R}
          fill="none"
          stroke="url(#eduRingGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: offset }}
          transition={{ type: 'spring', stiffness: 60, damping: 18 }}
          className="edu-ring-glow"
        />
        <defs>
          <linearGradient id="eduRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="55%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center text-center"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.12 }}
      >
        <span className="text-3xl font-bold tabular-nums text-sky-100">{display}%</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Complete</span>
        <span className="mt-1 text-xs text-violet-300/90">Year {year} of 4</span>
        {isActive ? (
          <span className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-200">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Enrolled
          </span>
        ) : (
          <span className="mt-1.5 text-[10px] text-slate-500">Alumni / paused</span>
        )}
      </motion.div>
    </div>
  )
}
