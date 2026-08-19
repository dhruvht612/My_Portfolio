import { useEffect, useRef, useState } from 'react'

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)'
const COARSE_QUERY = '(pointer: coarse)'
const NARROW_QUERY = '(max-width: 767.98px)'

/* Fraction of the remaining distance covered each frame — lower trails softer. */
const LERP = 0.12
const EPSILON = 0.4

/**
 * Soft radial glow that eases toward the cursor.
 *
 * Decorative only: fixed, pointer-events none, aria-hidden. Position is written
 * as CSS custom properties (--cx / --cy) on the node inside a single rAF, so it
 * never re-renders React. Renders null under prefers-reduced-motion, a coarse
 * pointer, or below 768px, and re-evaluates when any of those change.
 */
export default function CursorGlow({ size = 520, opacity = 0.14 }) {
  const ref = useRef(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined

    const queries = [
      window.matchMedia(REDUCED_QUERY),
      window.matchMedia(COARSE_QUERY),
      window.matchMedia(NARROW_QUERY),
    ]

    const evaluate = () => setEnabled(!queries.some((query) => query.matches))

    evaluate()
    queries.forEach((query) => query.addEventListener?.('change', evaluate))

    return () => {
      queries.forEach((query) => query.removeEventListener?.('change', evaluate))
    }
  }, [])

  useEffect(() => {
    if (!enabled) return undefined

    const node = ref.current
    if (!node) return undefined

    let frame = 0
    let seeded = false
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0

    const write = () => {
      node.style.setProperty('--cx', `${currentX.toFixed(1)}px`)
      node.style.setProperty('--cy', `${currentY.toFixed(1)}px`)
    }

    const tick = () => {
      frame = 0
      currentX += (targetX - currentX) * LERP
      currentY += (targetY - currentY) * LERP
      write()
      if (Math.abs(targetX - currentX) > EPSILON || Math.abs(targetY - currentY) > EPSILON) {
        schedule()
      }
    }

    const schedule = () => {
      if (frame) return
      frame = window.requestAnimationFrame(tick)
    }

    const onPointerMove = (event) => {
      targetX = event.clientX
      targetY = event.clientY
      if (!seeded) {
        seeded = true
        currentX = targetX
        currentY = targetY
        write()
        node.style.opacity = String(opacity)
      }
      schedule()
    }

    const onPointerOut = (event) => {
      if (event.relatedTarget || event.target !== document.documentElement) return
      node.style.opacity = '0'
      seeded = false
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('pointerout', onPointerOut, { passive: true })

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerout', onPointerOut)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [enabled, opacity])

  if (!enabled) return null

  return (
    <div
      ref={ref}
      className="cursor-glow"
      aria-hidden="true"
      style={{ width: size, height: size, opacity: 0 }}
    />
  )
}
