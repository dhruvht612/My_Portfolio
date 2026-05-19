import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Command, X } from 'lucide-react'

export default function ProfileCommandPalette({ open, onClose, steps, current, onSelect }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close command palette"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Identity command palette"
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="idf-command-palette fixed left-1/2 top-[18%] z-[61] w-[min(92vw,420px)] -translate-x-1/2 overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
              <Command className="h-4 w-4 text-violet-300" />
              <span className="text-sm font-medium text-slate-200">Identity navigation</span>
              <button type="button" onClick={onClose} className="ml-auto rounded-lg p-1 text-slate-500 hover:text-slate-300">
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="max-h-64 overflow-y-auto p-2">
              {steps.map((step, i) => (
                <li key={step.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(i)
                      onClose()
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-white/[0.06] ${
                      i === current ? 'bg-violet-500/15 text-violet-100' : 'text-slate-300'
                    }`}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-xs font-bold">
                      {i + 1}
                    </span>
                    <span>
                      <span className="block text-[10px] uppercase tracking-wider text-slate-500">{step.eyebrow}</span>
                      {step.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="border-t border-white/[0.06] px-4 py-2 text-[10px] text-slate-500">
              Alt+1–4 jump steps · Ctrl+S save on final step
            </p>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}
