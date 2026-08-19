import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { reveal, VIEWPORT } from '../lib/motion'
import { useReducedMotion } from '../hooks/useReducedMotion'

const MotionDiv = motion.div

/* Travel distance and stagger step for section reveals. */
const RISE = 18
const STAGGER = 0.08

/**
 * Wraps content so it fades and slides up when it enters the viewport.
 * Use for section headers, blocks, or cards with optional stagger index.
 *
 * Variants come from the shared `reveal()` contract so section reveals speak the
 * same motion language as the hero and card interactions. Under
 * prefers-reduced-motion `reveal()` returns fully-visible, zero-duration
 * variants for BOTH states, so children can never be left at opacity 0.
 */
export function AnimatedSection({
  children,
  className = '',
  delayOrder = 0,
  once = VIEWPORT.once,
  amount = VIEWPORT.amount,
  ...props
}) {
  const reduced = useReducedMotion()

  const variants = useMemo(() => {
    const base = reveal(reduced, RISE)
    return {
      hidden: base.hidden,
      // `custom` carries delayOrder, so the stagger lives here rather than in
      // the shared helper. Reduced motion drops the delay along with the tween.
      visible: (index = 0) => ({
        ...base.visible,
        transition: {
          ...base.visible.transition,
          delay: reduced ? 0 : index * STAGGER,
        },
      }),
    }
  }, [reduced])

  return (
    <MotionDiv
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants}
      custom={delayOrder}
      {...props}
    >
      {children}
    </MotionDiv>
  )
}

export default AnimatedSection
