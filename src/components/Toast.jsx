import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Toast notification. Auto-dismisses after `duration` ms.
 */
function Toast({ message, visible, onDismiss, duration = 3000 }) {
  useEffect(() => {
    if (!visible || !onDismiss) return
    const t = setTimeout(onDismiss, duration)
    return () => clearTimeout(t)
  }, [visible, onDismiss, duration])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: -12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-accent)]/40 shadow-lg shadow-[var(--color-accent)]/10 flex items-center gap-2 text-[var(--color-text)] font-medium"
        >
          <i className="fas fa-check-circle text-[var(--color-success)]" aria-hidden />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Toast
