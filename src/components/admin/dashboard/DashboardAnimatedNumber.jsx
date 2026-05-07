import { animate } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

/** Smooth count-up for numeric dashboard metrics. */
export default function DashboardAnimatedNumber({ value, className = '' }) {
  const [display, setDisplay] = useState(0)
  const prev = useRef(0)

  useEffect(() => {
    const target = typeof value === 'number' && !Number.isNaN(value) ? value : Number(value)
    if (Number.isNaN(target)) {
      return
    }
    const from = prev.current
    prev.current = target
    const controls = animate(from, target, {
      duration: 0.72,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
    })
    return () => controls.stop()
  }, [value])

  if (value === null || value === undefined || value === '—') return null
  if (typeof value === 'string' && value !== String(Number(value))) {
    return <span className={className}>{value}</span>
  }

  const n = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(n)) return <span className={className}>{value}</span>

  return <span className={`tabular-nums ${className}`}>{Math.round(display)}</span>
}
