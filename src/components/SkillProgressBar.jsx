import { useEffect, useRef, useState } from 'react'

/**
 * Progress bar that fills to `percent` when it enters the viewport (IntersectionObserver).
 */
function SkillProgressBar({ percent, label, className = '' }) {
  const barRef = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = barRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true)
      },
      { threshold: 0.2, rootMargin: '0px 0px -20px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={barRef} className={className}>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-medium text-[var(--color-text)]">{label}</span>
        <span className="text-xs font-semibold text-[var(--color-accent)] tabular-nums">{percent}%</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-blue)] transition-all duration-1000 ease-out"
          style={{ width: inView ? `${percent}%` : '0%' }}
        />
      </div>
    </div>
  )
}

export default SkillProgressBar
