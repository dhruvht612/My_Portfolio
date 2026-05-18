import { useCallback, useRef } from 'react'
import { motion } from 'framer-motion'

export default function NotificationsAmbient({ children, className = '' }) {
  const wrap = useRef(null)

  const onMove = useCallback((e) => {
    const el = wrap.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--notif-mx', `${((e.clientX - r.left) / Math.max(r.width, 1)) * 100}%`)
    el.style.setProperty('--notif-my', `${((e.clientY - r.top) / Math.max(r.height, 1)) * 100}%`)
  }, [])

  return (
    <motion.div
      ref={wrap}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      onMouseMove={onMove}
      className={`notif-ambient-root relative isolate overflow-hidden rounded-2xl ${className}`}
    >
      <motion.div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div className="notif-ambient-orb notif-ambient-orb-a" animate={{ opacity: [0.35, 0.52, 0.35] }} transition={{ duration: 9, repeat: Infinity }} />
        <motion.div className="notif-ambient-orb notif-ambient-orb-b" animate={{ opacity: [0.28, 0.45, 0.28] }} transition={{ duration: 11, repeat: Infinity }} />
        <motion.div className="notif-hud-corner notif-hud-corner-tl" animate={{ opacity: [0.2, 0.42, 0.2] }} transition={{ duration: 4, repeat: Infinity }} />
        <motion.div className="notif-hud-corner notif-hud-corner-br" animate={{ opacity: [0.12, 0.38, 0.12] }} transition={{ duration: 5, repeat: Infinity, delay: 0.6 }} />
        <motion.div className="dash-ambient-grid absolute inset-0 opacity-[0.11]" />
        <motion.div className="pointer-events-none absolute -inset-[20%] bg-[radial-gradient(680px_circle_at_var(--notif-mx,50%)_var(--notif-my,38%),rgba(167,139,250,0.1),transparent_58%)]" />
        <motion.div className="notif-ambient-scanline pointer-events-none absolute inset-0" animate={{ backgroundPosition: ['0% 0%', '0% 100%'] }} transition={{ duration: 13, repeat: Infinity, ease: 'linear' }} />
        <motion.div className="notif-ambient-particles pointer-events-none absolute inset-0" animate={{ opacity: [0.22, 0.38, 0.22] }} transition={{ duration: 15, repeat: Infinity }} />
        <motion.div className="dash-ambient-noise pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.05]" />
      </motion.div>
      <motion.div className="notif-ambient-shimmer pointer-events-none absolute inset-x-0 top-0 h-px" animate={{ opacity: [0.15, 0.48, 0.15] }} transition={{ duration: 5.5, repeat: Infinity }} />
      <motion.div className="relative z-[1]">{children}</motion.div>
    </motion.div>
  )
}
