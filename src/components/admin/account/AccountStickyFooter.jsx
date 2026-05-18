import { AnimatePresence, motion } from 'framer-motion'
import { Cloud, CloudOff, Keyboard, RotateCcw, Save } from 'lucide-react'

export default function AccountStickyFooter({
  saveState,
  saving,
  disabled,
  onReset,
  onSave,
  supabaseConfigured,
}) {
  return (
    <motion.footer
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="acc-sticky-footer"
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
              Profile synced
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
          ) : saving ? (
            <motion.span key="saving" className="inline-flex items-center gap-2 text-xs text-sky-300/90">
              <span className="acc-save-shimmer h-3.5 w-3.5 rounded-full border-2 border-sky-400/30 border-t-sky-300" />
              Syncing identity…
            </motion.span>
          ) : (
            <motion.span key="idle" className="text-xs text-slate-500">
              Identity workspace ready
            </motion.span>
          )}
        </AnimatePresence>
        <span className="hidden items-center gap-1 text-[10px] text-slate-600 sm:inline-flex">
          <Keyboard className="h-3 w-3" />
          ⌘K palette · Ctrl+S save
        </span>
        {!supabaseConfigured ? (
          <span className="text-[10px] text-amber-200/80">Configure Supabase to enable live sync</span>
        ) : null}
      </div>
      <motion.div
        className="flex w-full flex-wrap gap-2 sm:w-auto"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
      >
        <motion.button
          variants={{ hidden: { opacity: 0, y: 4 }, visible: { opacity: 1, y: 0 } }}
          type="button"
          disabled={saving}
          onClick={onReset}
          className="acc-footer-btn-secondary flex-1 sm:flex-none"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </motion.button>
        <motion.button
          variants={{ hidden: { opacity: 0, y: 4 }, visible: { opacity: 1, y: 0 } }}
          type="button"
          disabled={disabled || saving}
          onClick={onSave}
          whileHover={{ scale: disabled || saving ? 1 : 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="acc-footer-btn-primary flex-1 sm:flex-none"
        >
          {saving ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Saving…
            </span>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save profile
            </>
          )}
        </motion.button>
      </motion.div>
    </motion.footer>
  )
}
