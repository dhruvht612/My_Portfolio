import { motion } from 'framer-motion'
import { BrainCircuit, Layers3, Link2, Radar, Sparkles, Zap } from 'lucide-react'
import DashboardAnimatedNumber from '../dashboard/DashboardAnimatedNumber'

export default function SkillsHero({ metrics }) {
  const stats = [
    { icon: Layers3, label: 'Capabilities', value: metrics.totalSkills },
    { icon: Zap, label: 'Capability score', value: metrics.capabilityScore },
    { icon: BrainCircuit, label: 'Domains', value: metrics.totalGroups },
    { icon: Link2, label: 'Project linked', value: metrics.linked },
  ]

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="adm-sk-hero-panel relative overflow-hidden rounded-2xl border border-white/[0.08] p-4 md:p-5"
    >
      <div className="adm-sk-hero-banner pointer-events-none absolute inset-0" aria-hidden />
      <div className="adm-sk-hud-corner adm-sk-hud-tl" />
      <motion.div
        className="adm-sk-hud-corner adm-sk-hud-tr"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 4, repeat: Infinity }}
        aria-hidden
      />

      <div className="relative flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="adm-sk-pill">
            <Sparkles className="h-3.5 w-3.5" />
            Capability OS
          </span>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-white md:text-2xl">
            Engineering intelligence
          </h2>
          <p className="mt-1 max-w-xl text-sm text-slate-400">
            Orchestrate skill groups, proficiency signals, and project linkages that power your public capability workspace.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="adm-sk-status-chip">
              <span className="adm-sk-pulse-dot" />
              Indexing active
            </span>
            <span className="adm-sk-status-chip">Avg proficiency {metrics.avgProf}%</span>
            <span className="adm-sk-status-chip flex items-center gap-1">
              <Radar className="h-3 w-3" />
              {metrics.expert} expert-level
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {stats.map(({ icon: Icon, label, value }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2 }}
              className="adm-sk-metric-pill"
            >
              <Icon className="h-3.5 w-3.5 text-sky-400/80" />
              <p className="mt-1 text-[10px] text-slate-500">{label}</p>
              <p className="text-lg font-semibold tabular-nums text-slate-100">
                <DashboardAnimatedNumber value={value} />
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
