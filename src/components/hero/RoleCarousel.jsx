import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { DUR, EASE } from '../../lib/motion'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { cn } from '../../lib/utils'

const MotionSpan = motion.span

/* Absolutely positioned so a role change can never reflow the hero copy below.
   The .role-carousel class reserves the height (min-height 1.6em / 3.2em on
   narrow screens, which covers the two-line wrap of 'Full-Stack Developer'). */
const LAYER = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const SLIDE = 10

/**
 * Elegant crossfade role rotator. Renders text only — the caller owns font
 * size and colour.
 *
 * @param {string[]} roles         roles to cycle through.
 * @param {number}   interval      ms between changes (default 2600).
 * @param {string}   className     merged onto the root.
 */
export default function RoleCarousel({ roles = [], interval = 2600, className = '' }) {
  const reduced = useReducedMotion()
  // Index is read modulo the list length rather than reset in an effect, so a
  // changed `roles` array can never render undefined and never costs an extra
  // render pass.
  const [index, setIndex] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    // Under reduced motion we never rotate: a silently changing aria-live
    // region is hostile, and roles[0] is already the final visible state.
    if (reduced || roles.length <= 1 || !Number.isFinite(interval) || interval <= 0) {
      return
    }

    const clear = () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    const start = () => {
      clear()
      timerRef.current = setInterval(() => {
        setIndex((i) => (i + 1) % roles.length)
      }, interval)
    }

    const onVisibility = () => {
      if (document.hidden) clear()
      else start()
    }

    if (!document.hidden) start()
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      clear()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reduced, roles, interval])

  if (!roles.length) return null

  const role = roles[index % roles.length]

  if (reduced) {
    return <span className={cn('role-carousel', className)}>{roles[0]}</span>
  }

  return (
    <span className={cn('role-carousel', className)}>
      {/* One stable live region: same DOM node for the whole lifetime, its text
          swapped in place, so screen readers announce the role once instead of
          reading the entering/leaving spans as separate nodes. */}
      <span className="sr-only" aria-live="polite">
        {role}
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <MotionSpan
          key={`${index}-${role}`}
          aria-hidden="true"
          style={LAYER}
          initial={{ opacity: 0, y: SLIDE }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -SLIDE }}
          transition={{ duration: DUR.base, ease: EASE.emphasized }}
        >
          {role}
        </MotionSpan>
      </AnimatePresence>
    </span>
  )
}
