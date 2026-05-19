import { useCallback, useRef } from 'react'
import { motion } from 'framer-motion'

export default function SkillsAmbient({ children, className = '' }) {
  const wrap = useRef(null)

  const onMove = useCallback((e) => {
    const el = wrap.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--adm-sk-mx', `${((e.clientX - r.left) / Math.max(r.width, 1)) * 100}%`)
    el.style.setProperty('--adm-sk-my', `${((e.clientY - r.top) / Math.max(r.height, 1)) * 100}%`)
  }, [])

  return (
    <motion.div
      ref={wrap}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      onMouseMove={onMove}
      className={`adm-sk-ambient-root relative isolate overflow-hidden rounded-2xl ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div className="adm-sk-ambient-orb adm-sk-ambient-orb-a" />
        <motion.div
          className="adm-sk-ambient-orb adm-sk-ambient-orb-b"
          animate={{ opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <div className="dash-ambient-grid absolute inset-0 opacity-[0.1]" />
        <div className="pointer-events-none absolute -inset-[18%] bg-[radial-gradient(680px_circle_at_var(--adm-sk-mx,50%)_var(--adm-sk-my,38%),rgba(56,189,248,0.1),transparent_58%)] transition-opacity duration-500" />
        <motion.div className="adm-sk-ambient-scanline absolute inset-0" />
        <div className="adm-sk-ambient-particles absolute inset-0" />
      </div>
      <div className="relative z-[1]">{children}</div>
    </motion.div>
  )
}
