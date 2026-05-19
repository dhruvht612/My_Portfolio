import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Cloud,
  CloudOff,
  Eye,
  Keyboard,
  RefreshCw,
  Save,
  Sparkles,
} from 'lucide-react'

export default function ProfileStickyFooter({
  currentStep,
  totalSteps,
  isLast,
  isFirst,
  isSubmitting,
  disabled,
  saveState,
  indexing,
  onBack,
  onNext,
  onDraftSave,
  onPreview,
  onOpenCommand,
}) {
  return (
    <motion.footer
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="idf-sticky-footer"
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-3">
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
              Public identity synced
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
          ) : indexing ? (
            <motion.span key="index" className="inline-flex items-center gap-1.5 text-xs text-violet-300/80">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              AI indexing…
            </motion.span>
          ) : (
            <motion.span key="idle" className="text-xs text-slate-500">
              Step {currentStep + 1} of {totalSteps}
            </motion.span>
          )}
        </AnimatePresence>
        <button
          type="button"
          onClick={onOpenCommand}
          className="hidden items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-[10px] text-slate-500 transition-colors hover:border-violet-400/30 hover:text-slate-300 sm:inline-flex"
        >
          <Keyboard className="h-3 w-3" />
          ⌘K
        </button>
      </div>
      <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:flex-nowrap">
        <button type="button" disabled={disabled || isSubmitting} onClick={onPreview} className="idf-footer-btn-secondary">
          <Eye className="h-4 w-4" />
          Preview
        </button>
        <button type="button" disabled={disabled || isSubmitting} onClick={onDraftSave} className="idf-footer-btn-secondary">
          <Save className="h-4 w-4" />
          Save draft
        </button>
        <button type="button" disabled={isFirst} onClick={onBack} className="idf-footer-btn-secondary">
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <button
          type="button"
          disabled={disabled || isSubmitting}
          onClick={onNext}
          className="idf-footer-btn-primary"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Syncing…
            </span>
          ) : isLast ? (
            <>
              <Sparkles className="h-4 w-4" />
              Publish identity
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
