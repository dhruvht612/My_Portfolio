import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import SettingsModulePanel from './SettingsModulePanel'

export default function SettingsModuleCard({ module, icon: Icon, settings, onChange, expanded, onToggle }) {
  const status = module.statusFn(settings)
  const toneClass = `set-module-${module.tone}`

  return (
    <motion.article
      layout
      className={`set-module-card ${toneClass} ${expanded ? 'set-module-card-open' : ''}`}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
    >
      <motion.div className="set-module-glow pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <button type="button" onClick={onToggle} className="relative flex w-full items-start gap-3 p-4 text-left">
        <motion.span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" whileHover={{ scale: 1.04 }}>
          <Icon className="h-5 w-5 text-cyan-300/90" />
        </motion.span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-slate-100">{module.title}</h3>
            <span className="set-module-status">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {module.statusLabel}: {status}
            </span>
          </div>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">{module.subtitle}</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">{module.copy}</p>
        </div>
        <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
          <ChevronDown className="h-5 w-5 text-slate-500" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} className="overflow-hidden px-4 pb-4">
            <SettingsModulePanel moduleId={module.id} settings={settings} onChange={onChange} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.article>
  )
}
