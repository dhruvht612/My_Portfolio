import { useCallback, useRef } from 'react'

/**
 * Cinematic ambient layer behind the observability dashboard.
 * Pointer events disabled so nested UI stays clickable.
 */
export default function ObservabilityAmbient({ intensity = 'operational', children }) {
  const wrap = useRef(null)

  const onMove = useCallback(
    /** @param {React.MouseEvent<HTMLDivElement>} e */
    (e) => {
      const el = wrap.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const x = ((e.clientX - r.left) / Math.max(r.width, 1)) * 100
      const y = ((e.clientY - r.top) / Math.max(r.height, 1)) * 100
      el.style.setProperty('--mx', `${x}%`)
      el.style.setProperty('--my', `${y}%`)
    },
    []
  )

  const glow =
    intensity === 'critical'
      ? 'from-red-500/25 via-fuchsia-500/10 to-transparent'
      : intensity === 'degraded'
        ? 'from-amber-400/20 via-orange-500/10 to-transparent'
        : 'from-sky-500/20 via-cyan-500/10 to-transparent'

  const pulse =
    intensity === 'critical' ? 'obs-ambient-pulse-fast' : intensity === 'degraded' ? 'obs-ambient-pulse-mid' : 'obs-ambient-pulse-slow'

  return (
    <div
      ref={wrap}
      onMouseMove={onMove}
      className={`obs-ambient-root relative isolate ${pulse}`}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        <div className={`obs-ambient-grid absolute inset-0 opacity-[0.35] ${intensity === 'critical' ? 'obs-grid-tint-red' : intensity === 'degraded' ? 'obs-grid-tint-amber' : ''}`} />
        <div
          className={`obs-ambient-radial pointer-events-none absolute -inset-[20%] bg-[radial-gradient(600px_circle_at_var(--mx,50%)_var(--my,40%),rgba(56,189,248,0.10),transparent_55%)] transition-opacity duration-500 ${glow}`}
        />
        <div className="obs-ambient-noise pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.07]" />
        <div className="obs-ambient-scan pointer-events-none absolute inset-0 opacity-[0.06]" />
      </div>
      <div className="relative z-[1]">{children}</div>
    </div>
  )
}
