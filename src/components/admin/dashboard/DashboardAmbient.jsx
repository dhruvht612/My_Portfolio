import { useCallback, useRef } from 'react'

/** Subtle cinematic canvas for admin dashboard route. */
export default function DashboardAmbient({ children }) {
  const wrap = useRef(null)

  const onMove = useCallback(
    /** @param {React.MouseEvent<HTMLDivElement>} e */
    (e) => {
      const el = wrap.current
      if (!el) return
      const r = el.getBoundingClientRect()
      el.style.setProperty('--dmx', `${((e.clientX - r.left) / Math.max(r.width, 1)) * 100}%`)
      el.style.setProperty('--dmy', `${((e.clientY - r.top) / Math.max(r.height, 1)) * 100}%`)
    },
    []
  )

  return (
    <div ref={wrap} onMouseMove={onMove} className="dash-ambient-root relative isolate">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        <div className="dash-ambient-grid absolute inset-0 opacity-[0.18]" />
        <div className="pointer-events-none absolute -inset-[18%] bg-[radial-gradient(760px_circle_at_var(--dmx,50%)_var(--dmy,35%),rgba(56,189,248,0.09),transparent_58%)] transition-opacity duration-500" />
        <div className="dash-ambient-noise pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.06]" />
        <div className="dash-ambient-scan pointer-events-none absolute inset-0 opacity-[0.045]" />
      </div>
      <div className="relative z-[1]">{children}</div>
    </div>
  )
}
