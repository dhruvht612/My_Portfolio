import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Cloud, CloudOff, Keyboard, Save } from 'lucide-react'

export default function EducationStickyFooter({
  currentStep,
  totalSteps,
  isLast,
  isFirst,
  isSubmitting,
  disabled,
  saveState,
  onBack,
  onNext,
  onSave,
}) {
  return (
    <motion.footer
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="edu-sticky-footer"
    >
      <div className="flex flex-wrap items-center gap-3">
        <AnimatePresence mode="wait">
          {saveState === 'saved' ? (
            <motion.span
              key="saved"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="inline-flex items-center gap-1.5 text-xs text-emerald-300/90"
            >
              <Cloud className="h-3.5 w-3.5" />
              Synced
            </motion.span>
          ) : saveState === 'dirty' ? (
            <motion.span
              key="dirty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="inline-flex items-center gap-1.5 text-xs text-amber-200/80"
            >
              <CloudOff className="h-3.5 w-3.5" />
              Unsaved changes
            </motion.span>
          ) : (
            <motion.span key="idle" className="text-xs text-slate-500">
              Step {currentStep + 1} of {totalSteps}
            </motion.span>
          )}
        </AnimatePresence>
        <span className="hidden items-center gap-1 text-[10px] text-slate-600 sm:inline-flex">
          <Keyboard className="h-3 w-3" />
          Ctrl+S to save on last step
        </span>
      </div>
      <div className="flex w-full flex-wrap gap-2 sm:w-auto">
        <button type="button" disabled={isFirst} onClick={onBack} className="edu-footer-btn-secondary flex-1 sm:flex-none">
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <button
          type="button"
          disabled={disabled || isSubmitting}
          onClick={onNext}
          className="edu-footer-btn-primary flex-1 sm:flex-none"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Saving…
            </span>
          ) : isLast ? (
            <>
              <Save className="h-4 w-4" />
              Save education
            </>
          ) : (
            <>
              Next
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </motion.footer>
  )
}
