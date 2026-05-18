import { useCallback, useRef } from 'react'
import { motion } from 'framer-motion'

export default function AccountAmbient({ children, className = '' }) {
  const wrap = useRef(null)

  const onMove = useCallback((e) => {
    const el = wrap.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--acc-mx', `${((e.clientX - r.left) / Math.max(r.width, 1)) * 100}%`)
    el.style.setProperty('--acc-my', `${((e.clientY - r.top) / Math.max(r.height, 1)) * 100}%`)
  }, [])

  return (
    <motion.div
      ref={wrap}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      onMouseMove={onMove}
      className={`acc-ambient-root relative isolate overflow-hidden rounded-2xl ${className}`}
    >
      <motion.div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="acc-ambient-orb acc-ambient-orb-a"
          animate={{ opacity: [0.4, 0.58, 0.4] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="acc-ambient-orb acc-ambient-orb-b"
          animate={{ opacity: [0.32, 0.5, 0.32], scale: [1, 1.05, 1] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="dash-ambient-grid absolute inset-0 opacity-[0.12]" />
        <motion.div className="pointer-events-none absolute -inset-[20%] bg-[radial-gradient(680px_circle_at_var(--acc-mx,50%)_var(--acc-my,38%),rgba(99,102,241,0.12),transparent_58%)] transition-opacity duration-500" />
        <motion.div className="pointer-events-none absolute -inset-[20%] bg-[radial-gradient(520px_circle_at_calc(var(--acc-mx,50%)_+_12%)_calc(var(--acc-my,40%)_+_8%),rgba(56,189,248,0.08),transparent_55%)]" />
        <motion.div
          className="acc-ambient-scan pointer-events-none absolute inset-0"
          animate={{ opacity: [0.02, 0.05, 0.02] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="acc-ambient-pulse pointer-events-none absolute left-1/2 top-0 h-32 w-32 -translate-x-1/2 rounded-full bg-indigo-400/10 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="acc-ambient-particles pointer-events-none absolute inset-0"
          animate={{ opacity: [0.25, 0.4, 0.25] }}
          transition={{ duration: 14, repeat: Infinity }}
        />
        <motion.div
          className="dash-ambient-noise pointer-events-none absolute inset-0 mix-blend-overlay"
          animate={{ opacity: [0.04, 0.06, 0.04] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </motion.div>
      <motion.div
        className="acc-ambient-shimmer pointer-events-none absolute inset-x-0 top-0 h-px"
        animate={{ opacity: [0.2, 0.55, 0.2], x: ['-30%', '30%', '-30%'] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="acc-ambient-shimmer pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-40"
        animate={{ opacity: [0.1, 0.35, 0.1] }}
        transition={{ duration: 7, repeat: Infinity, delay: 1.2 }}
      />
      <motion.div
        className="acc-ambient-scanline pointer-events-none absolute inset-0"
        animate={{ backgroundPosition: ['0% 0%', '0% 100%'] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      />
      <div className="relative z-[1]">{children}</div>
    </motion.div>
  )
}
