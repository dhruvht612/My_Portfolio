import { motion } from 'framer-motion'
import { FolderGit2, Globe, Rocket, Star, Zap } from 'lucide-react'
import DashboardAnimatedNumber from '../dashboard/DashboardAnimatedNumber'

export default function ProjectsHero({ rows }) {
  const total = rows.length
  const live = rows.filter((r) => !r.is_disabled && r.live_url).length
  const featured = rows.filter((r) => r.is_featured).length
  const stacks = new Set(rows.flatMap((r) => r.tech_stack || []).filter(Boolean)).size

  const stats = [
    { icon: FolderGit2, label: 'Projects', value: total },
    { icon: Globe, label: 'Live demos', value: live },
    { icon: Star, label: 'Featured', value: featured },
    { icon: Zap, label: 'Technologies', value: stacks },
  ]

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="proj-hero-panel relative overflow-hidden rounded-2xl border border-white/[0.08] p-4 md:p-5"
    >
      <div className="proj-hero-banner pointer-events-none absolute inset-0" aria-hidden />
      <motion.div className="relative flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="proj-pill">
            <Rocket className="h-3.5 w-3.5" />
            Portfolio OS
          </span>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-white md:text-2xl">Product showcase</h2>
          <p className="mt-1 max-w-xl text-sm text-slate-400">
            Command center for shipped work — previews, deployment signals, stack intelligence, and portfolio analytics.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {stats.map(({ icon: Icon, label, value }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2 }}
              className="proj-metric-pill"
            >
              <Icon className="h-3.5 w-3.5 text-sky-400/80" />
              <p className="mt-1 text-[10px] text-slate-500">{label}</p>
              <p className="text-lg font-semibold tabular-nums text-slate-100">
                <DashboardAnimatedNumber value={value} />
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.section>
  )
}
