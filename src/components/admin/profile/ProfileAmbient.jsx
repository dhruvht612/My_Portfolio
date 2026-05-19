import { useCallback, useRef } from 'react'
import { motion } from 'framer-motion'

export default function ProfileAmbient({ children, className = '' }) {
  const wrap = useRef(null)

  const onMove = useCallback((e) => {
    const el = wrap.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--idf-mx', `${((e.clientX - r.left) / Math.max(r.width, 1)) * 100}%`)
    el.style.setProperty('--idf-my', `${((e.clientY - r.top) / Math.max(r.height, 1)) * 100}%`)
  }, [])

  return (
    <motion.div
      ref={wrap}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      onMouseMove={onMove}
      className={`idf-ambient-root relative isolate overflow-hidden rounded-2xl ${className}`}
    >
      <motion.div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="idf-ambient-orb idf-ambient-orb-a"
          animate={{ opacity: [0.4, 0.65, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="idf-ambient-orb idf-ambient-orb-b"
          animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.05, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="idf-ambient-orb idf-ambient-orb-c"
          animate={{ x: [0, 12, 0], y: [0, -8, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div className="dash-ambient-grid absolute inset-0 opacity-[0.12]" />
        <motion.div className="pointer-events-none absolute -inset-[20%] bg-[radial-gradient(720px_circle_at_var(--idf-mx,50%)_var(--idf-my,40%),rgba(167,139,250,0.12),transparent_58%)] transition-opacity duration-500" />
        <div className="dash-ambient-noise pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.05]" />
        <motion.div className="dash-ambient-scan pointer-events-none absolute inset-0 opacity-[0.04]" />
        <div className="idf-ambient-particles pointer-events-none absolute inset-0" />
      </motion.div>
      <motion.div className="relative z-[1]">{children}</motion.div>
    </motion.div>
  )
}
