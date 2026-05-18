import { motion } from 'framer-motion'
import { BrainCircuit, Cpu, Sparkles, Terminal } from 'lucide-react'
import { generateSettingsInsights } from './settingsConfig'

export default function SettingsHeroPanel({ settings, syncState }) {
  const headline = generateSettingsInsights(settings)[0]
  const motionLabel =
    settings.motionIntensity === 'high' ? 'High' : settings.motionIntensity === 'low' ? 'Reduced' : 'Balanced'

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 90, damping: 18 }}
      className="set-hero-panel relative overflow-hidden rounded-2xl border border-white/[0.08] p-4 md:p-5"
    >
      <motion.div className="set-hero-banner pointer-events-none absolute inset-0" animate={{ opacity: [0.85, 1, 0.85] }} transition={{ duration: 7, repeat: Infinity }} aria-hidden />
      <motion.div className="set-hud-rail pointer-events-none absolute left-0 top-4 bottom-4 w-px" animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 3, repeat: Infinity }} />
      <motion.div className="set-hud-rail pointer-events-none absolute right-0 top-4 bottom-4 w-px" animate={{ opacity: [0.15, 0.45, 0.15] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }} />

      <motion.div className="relative space-y-3" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="set-pill">
            <Terminal className="h-3.5 w-3.5" aria-hidden />
            Control OS
          </span>
          <span className="set-pill set-pill-live">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Workspace systems operational
          </span>
          <span className="set-pill set-pill-sync">
            <Cpu className="h-3 w-3" aria-hidden />
            {syncState === 'syncing' ? 'Syncing…' : syncState === 'saved' ? 'Synced' : 'Live config'}
          </span>
        </div>

        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white md:text-2xl">Workspace configuration</h2>
          <p className="mt-1 text-sm text-slate-400">
            Engineering control plane · {settings.theme} theme · {motionLabel.toLowerCase()} motion engine
          </p>
        </div>

        {headline ? (
          <motion.div
            key={headline.title}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="set-insight-snippet flex gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-2.5"
          >
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden />
            <div>
              <p className="text-xs font-medium text-cyan-100">{headline.title}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{headline.body}</p>
            </div>
          </motion.div>
        ) : null}

        <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
          <span className="set-status-chip">Motion engine running at {motionLabel.toLowerCase()} mode</span>
          <span className="set-status-chip text-emerald-300/90">Developer environment synced successfully</span>
          <span className="set-status-chip">
            AI system {settings.aiFiltering ? 'filtering active' : 'pass-through'}
          </span>
        </div>
      </motion.div>

      <div className="relative mt-3 flex items-center gap-2 border-t border-white/[0.06] pt-3 text-[10px] uppercase tracking-[0.16em] text-slate-500">
        <BrainCircuit className="h-3.5 w-3.5 text-cyan-400/80" />
        Configuration command center · realtime diagnostics
      </div>
    </motion.section>
  )
}
