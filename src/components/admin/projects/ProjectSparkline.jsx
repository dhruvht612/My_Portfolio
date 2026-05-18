import { motion } from 'framer-motion'
import { sparklinePoints } from './projectInsights'

export default function ProjectSparkline({ row, className = '' }) {
  const pts = sparklinePoints(row)
  const max = Math.max(...pts, 1)
  const w = 64
  const h = 22
  const path = pts
    .map((v, i) => {
      const x = (i / (pts.length - 1)) * w
      const y = h - (v / max) * h
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <svg width={w} height={h} className={className} aria-hidden>
      <defs>
        <linearGradient id={`proj-spark-${row?.id || 'x'}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <motion.path
        d={path}
        fill="none"
        stroke={`url(#proj-spark-${row?.id || 'x'})`}
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  )
}
