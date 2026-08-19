/**
 * Shared motion contract.
 *
 * Single source of truth for easing curves, durations, viewport config and the
 * two entrance helpers used across the portfolio. Every helper collapses to a
 * fully-visible, zero-duration result when `reduced` is true so content is
 * NEVER left stuck at opacity 0 under prefers-reduced-motion.
 */

/** Easing curves as framer-motion cubic-bezier arrays. */
export const EASE = {
  emphasized: [0.22, 1, 0.36, 1],
  standard: [0.65, 0, 0.35, 1],
  out: [0.25, 0.46, 0.45, 0.94],
}

/** Durations in seconds (framer-motion units). */
export const DUR = {
  fast: 0.18,
  base: 0.32,
  slow: 0.6,
}

/** Shared whileInView viewport config. */
export const VIEWPORT = { once: true, amount: 0.2 }

/* Hero sequence timing. index 6 => 0.06 + 6 * 0.07 + 0.42 = 0.90s total. */
const HERO_BASE_DELAY = 0.06
const HERO_STEP = 0.07
const HERO_DURATION = 0.42
const HERO_RISE = 14

/**
 * Per-item hero entrance props. Spread onto a `motion.*` element.
 *
 * @param {number} index    0..N sequencing position within the hero.
 * @param {boolean} reduced true when prefers-reduced-motion is active.
 * @returns {{ initial: any, animate: object, transition: object }}
 */
export function heroItem(index = 0, reduced = false) {
  if (reduced) {
    return {
      initial: false,
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0 },
    }
  }

  return {
    initial: { opacity: 0, y: HERO_RISE },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: HERO_DURATION,
      delay: HERO_BASE_DELAY + index * HERO_STEP,
      ease: EASE.emphasized,
    },
  }
}

/**
 * whileInView reveal variants.
 *
 * @param {boolean} reduced true when prefers-reduced-motion is active.
 * @param {number} y        travel distance in px (default 18).
 * @returns {{ hidden: object, visible: object }}
 */
export function reveal(reduced = false, y = 18) {
  if (reduced) {
    return {
      hidden: { opacity: 1, y: 0 },
      visible: { opacity: 1, y: 0, transition: { duration: 0 } },
    }
  }

  return {
    hidden: { opacity: 0, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: EASE.emphasized },
    },
  }
}
