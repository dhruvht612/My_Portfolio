import { motion } from 'framer-motion'

const defaultVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

/**
 * Wraps content so it fades and slides up when it enters the viewport.
 * Use for section headers, blocks, or cards with optional stagger index.
 */
export function AnimatedSection({
  children,
  className = '',
  delayOrder = 0,
  once = true,
  amount = 0.2,
  ...props
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={defaultVariants}
      custom={delayOrder}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * Container for staggered children. Use with AnimatedSection on each child for stagger.
 */
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default AnimatedSection
