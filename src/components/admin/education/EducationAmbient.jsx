import { useCallback, useRef } from 'react'
import { motion } from 'framer-motion'

export default function EducationAmbient({ children, className = '' }) {
  const wrap = useRef(null)

  const onMove = useCallback((e) => {
    const el = wrap.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--edu-mx', `${((e.clientX - r.left) / Math.max(r.width, 1)) * 100}%`)
    el.style.setProperty('--edu-my', `${((e.clientY - r.top) / Math.max(r.height, 1)) * 100}%`)
  }, [])

  return (
    <motion.div
      ref={wrap}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      onMouseMove={onMove}
      className={`edu-ambient-root relative isolate overflow-hidden rounded-2xl ${className}`}
    >
      <motion.div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="edu-ambient-orb edu-ambient-orb-a" />
        <motion.div
          className="edu-ambient-orb edu-ambient-orb-b"
          animate={{ opacity: [0.35, 0.55, 0.35], scale: [1, 1.06, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="dash-ambient-grid absolute inset-0 opacity-[0.14]" />
        <motion.div className="pointer-events-none absolute -inset-[20%] bg-[radial-gradient(720px_circle_at_var(--edu-mx,50%)_var(--edu-my,40%),rgba(56,189,248,0.11),transparent_58%)] transition-opacity duration-500" />
        <div className="dash-ambient-noise pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.05]" />
        <div className="dash-ambient-scan pointer-events-none absolute inset-0 opacity-[0.035]" />
        <div className="edu-ambient-particles pointer-events-none absolute inset-0" />
      </motion.div>
      <div className="relative z-[1]">{children}</div>
    </motion.div>
  )
}
