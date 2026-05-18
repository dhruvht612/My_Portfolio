import { useCallback, useRef } from 'react'
import { motion } from 'framer-motion'

export default function SettingsAmbient({ children, className = '' }) {
  const wrap = useRef(null)

  const onMove = useCallback((e) => {
    const el = wrap.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--set-mx', `${((e.clientX - r.left) / Math.max(r.width, 1)) * 100}%`)
    el.style.setProperty('--set-my', `${((e.clientY - r.top) / Math.max(r.height, 1)) * 100}%`)
  }, [])

  return (
    <motion.div
      ref={wrap}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      onMouseMove={onMove}
      className={`set-ambient-root relative isolate overflow-hidden rounded-2xl ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="set-ambient-orb set-ambient-orb-a"
          animate={{ opacity: [0.38, 0.55, 0.38] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="set-ambient-orb set-ambient-orb-b"
          animate={{ opacity: [0.3, 0.48, 0.3], scale: [1, 1.04, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div className="set-hud-corner set-hud-corner-tl" animate={{ opacity: [0.2, 0.45, 0.2] }} transition={{ duration: 4, repeat: Infinity }} />
        <motion.div className="set-hud-corner set-hud-corner-br" animate={{ opacity: [0.15, 0.4, 0.15] }} transition={{ duration: 5, repeat: Infinity, delay: 0.8 }} />
        <motion.div className="dash-ambient-grid absolute inset-0 opacity-[0.1]" />
        <motion.div className="pointer-events-none absolute -inset-[20%] bg-[radial-gradient(700px_circle_at_var(--set-mx,50%)_var(--set-my,40%),rgba(56,189,248,0.1),transparent_58%)]" />
        <motion.div className="set-ambient-scanline pointer-events-none absolute inset-0" animate={{ backgroundPosition: ['0% 0%', '0% 100%'] }} transition={{ duration: 14, repeat: Infinity, ease: 'linear' }} />
        <motion.div className="set-ambient-particles pointer-events-none absolute inset-0" animate={{ opacity: [0.2, 0.38, 0.2] }} transition={{ duration: 16, repeat: Infinity }} />
        <motion.div className="dash-ambient-noise pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.05]" />
      </div>
      <motion.div className="set-ambient-shimmer pointer-events-none absolute inset-x-0 top-0 h-px" animate={{ opacity: [0.15, 0.5, 0.15] }} transition={{ duration: 6, repeat: Infinity }} />
      <div className="relative z-[1]">{children}</div>
    </motion.div>
  )
}
