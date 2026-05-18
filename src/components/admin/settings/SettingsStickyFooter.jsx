import { AnimatePresence, motion } from 'framer-motion'
import { Cloud, CloudOff, Keyboard, RotateCcw, Save } from 'lucide-react'

export default function SettingsStickyFooter({ saveState, saving, isDirty, onReset, onSave }) {
  return (
    <motion.footer initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="set-sticky-footer">
      <motion.div className="flex flex-wrap items-center gap-3">
        <AnimatePresence mode="wait">
          {saveState === 'saved' ? (
            <motion.span key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="inline-flex items-center gap-1.5 text-xs text-emerald-300/90">
              <Cloud className="h-3.5 w-3.5" />
              Configuration synced
            </motion.span>
          ) : saveState === 'dirty' ? (
            <motion.span key="dirty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="inline-flex items-center gap-1.5 text-xs text-amber-200/80">
              <CloudOff className="h-3.5 w-3.5" />
              Unsaved changes
            </motion.span>
          ) : saving ? (
            <motion.span key="saving" className="inline-flex items-center gap-2 text-xs text-cyan-300/90">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-300" />
              Syncing workspace…
            </motion.span>
          ) : (
            <motion.span key="idle" className="text-xs text-slate-500">
              Control plane ready · local workspace store
            </motion.span>
          )}
        </AnimatePresence>
        <span className="hidden items-center gap-1 text-[10px] text-slate-600 sm:inline-flex">
          <Keyboard className="h-3 w-3" />
          ⌘K search · Ctrl+S save
        </span>
      </motion.div>
      <div className="flex w-full flex-wrap gap-2 sm:w-auto">
        <button type="button" disabled={saving} onClick={onReset} className="set-footer-btn-secondary flex-1 sm:flex-none">
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
        <motion.button
          type="button"
          disabled={saving || !isDirty}
          onClick={onSave}
          whileHover={{ scale: saving || !isDirty ? 1 : 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="set-footer-btn-primary flex-1 sm:flex-none"
        >
          {saving ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Saving…
            </span>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save configuration
            </>
          )}
        </motion.button>
      </div>
    </motion.footer>
  )
}
