import { useEffect, useRef } from 'react'

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)'
const COARSE_QUERY = '(pointer: coarse)'

/* How much of the remaining distance is covered each frame. */
const LERP = 0.2
/* Below this, snap and stop the loop. */
const EPSILON = 0.08

function clamp(value, limit) {
  if (value > limit) return limit
  if (value < -limit) return -limit
  return value
}

/**
 * Magnetic pointer pull.
 *
 * Attach the returned ref to an element. The element is translated toward the
 * pointer via `translate3d` written directly on the node inside a single rAF —
 * no React state, no re-render. Automatically inert under
 * prefers-reduced-motion or a coarse pointer, and re-arms if either media
 * query changes. All listeners and the rAF are torn down on unmount.
 *
 * @param {{ strength?: number, max?: number }} [options]
 * @returns {import('react').RefObject<HTMLElement>}
 */
export function useMagnetic({ strength = 0.3, max = 8 } = {}) {
  const ref = useRef(null)
  const optionsRef = useRef({ strength, max })

  useEffect(() => {
    optionsRef.current.strength = strength
    optionsRef.current.max = max
  }, [strength, max])

  useEffect(() => {
    const node = ref.current
    if (!node || typeof window === 'undefined' || !window.matchMedia) return undefined

    const reducedQuery = window.matchMedia(REDUCED_QUERY)
    const coarseQuery = window.matchMedia(COARSE_QUERY)

    let armed = false
    let frame = 0
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0

    const write = () => {
      if (currentX === 0 && currentY === 0) {
        // Hand the element back to CSS once it is fully at rest.
        node.style.transform = ''
        return
      }
      node.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`
    }

    const tick = () => {
      frame = 0
      currentX += (targetX - currentX) * LERP
      currentY += (targetY - currentY) * LERP

      const settled =
        Math.abs(targetX - currentX) < EPSILON && Math.abs(targetY - currentY) < EPSILON

      if (settled) {
        currentX = targetX
        currentY = targetY
      }

      write()

      if (!settled) schedule()
    }

    const schedule = () => {
      if (frame) return
      frame = window.requestAnimationFrame(tick)
    }

    const onPointerMove = (event) => {
      const rect = node.getBoundingClientRect()
      const { strength: pull, max: limit } = optionsRef.current
      targetX = clamp((event.clientX - (rect.left + rect.width / 2)) * pull, limit)
      targetY = clamp((event.clientY - (rect.top + rect.height / 2)) * pull, limit)
      schedule()
    }

    const release = () => {
      targetX = 0
      targetY = 0
      schedule()
    }

    const stopFrame = () => {
      if (!frame) return
      window.cancelAnimationFrame(frame)
      frame = 0
    }

    const arm = () => {
      if (armed) return
      armed = true
      node.addEventListener('pointermove', onPointerMove)
      node.addEventListener('pointerleave', release)
      node.addEventListener('pointercancel', release)
      node.addEventListener('blur', release)
    }

    const disarm = () => {
      if (!armed) return
      armed = false
      node.removeEventListener('pointermove', onPointerMove)
      node.removeEventListener('pointerleave', release)
      node.removeEventListener('pointercancel', release)
      node.removeEventListener('blur', release)
      stopFrame()
      targetX = 0
      targetY = 0
      currentX = 0
      currentY = 0
      write()
    }

    const evaluate = () => {
      if (reducedQuery.matches || coarseQuery.matches) disarm()
      else arm()
    }

    evaluate()
    reducedQuery.addEventListener?.('change', evaluate)
    coarseQuery.addEventListener?.('change', evaluate)

    return () => {
      reducedQuery.removeEventListener?.('change', evaluate)
      coarseQuery.removeEventListener?.('change', evaluate)
      disarm()
    }
  }, [])

  return ref
}

export default useMagnetic
