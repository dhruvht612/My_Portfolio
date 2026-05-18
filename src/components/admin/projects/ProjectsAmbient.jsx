import { useCallback, useRef } from 'react'
import { motion } from 'framer-motion'

export default function ProjectsAmbient({ children, className = '' }) {
  const wrap = useRef(null)

  const onMove = useCallback((e) => {
    const el = wrap.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--proj-mx', `${((e.clientX - r.left) / Math.max(r.width, 1)) * 100}%`)
    el.style.setProperty('--proj-my', `${((e.clientY - r.top) / Math.max(r.height, 1)) * 100}%`)
  }, [])

  return (
    <motion.div
      ref={wrap}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      onMouseMove={onMove}
      className={`proj-ambient-root relative isolate overflow-hidden rounded-2xl ${className}`}
    >
      <motion.div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="proj-ambient-orb proj-ambient-orb-a" />
        <motion.div
          className="proj-ambient-orb proj-ambient-orb-b"
          animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.05, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="dash-ambient-grid absolute inset-0 opacity-[0.12]" />
        <div className="pointer-events-none absolute -inset-[18%] bg-[radial-gradient(680px_circle_at_var(--proj-mx,50%)_var(--proj-my,38%),rgba(99,102,241,0.1),transparent_58%)] transition-opacity duration-500" />
        <div className="dash-ambient-noise pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.045]" />
        <div className="dash-ambient-scan pointer-events-none absolute inset-0 opacity-[0.03]" />
        <div className="proj-ambient-particles pointer-events-none absolute inset-0" />
      </motion.div>
      <div className="relative z-[1]">{children}</div>
    </motion.div>
  )
}
