import { motion } from 'framer-motion'
import { Calendar, GitBranch, Layers, Sparkles } from 'lucide-react'
import ProjectSparkline from './ProjectSparkline'
import ProjectTechStack from './ProjectTechStack'
import { projectMetrics, sparklinePoints } from './projectInsights'

export default function ProjectExpandedPanel({ row }) {
  const metrics = projectMetrics(row)
  const features = (row.features || []).filter(Boolean)
  const trendLabel = metrics.trend > 0 ? 'Rising' : metrics.trend < 0 ? 'Cooling' : 'Stable'

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 22 }}
      className="overflow-hidden"
    >
      <div className="proj-expanded-panel border-t border-white/[0.06] p-4 md:p-5">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-300/90">Overview</p>
            <p className="text-sm leading-relaxed text-slate-400">{row.description}</p>
            {features.length ? (
              <ul className="space-y-1.5">
                {features.slice(0, 5).map((f) => (
                  <li key={f} className="flex gap-2 text-xs text-slate-400">
                    <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-violet-400" />
                    {f}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-300/90">Analytics</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Views', value: metrics.views },
                { label: 'Engagement', value: `${metrics.engagement}%` },
                { label: 'Clicks', value: metrics.clicks },
              ].map(({ label, value }) => (
                <div key={label} className="proj-mini-stat">
                  <p className="text-[10px] text-slate-500">{label}</p>
                  <p className="text-sm font-semibold text-slate-100">{value}</p>
                </div>
              ))}
            </div>
            <ProjectSparkline row={row} />
            <p className="text-[11px] text-slate-500">
              Trend: <span className="text-sky-300">{trendLabel}</span> · Portfolio rank #{metrics.rank}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-300/90">Architecture</p>
            <ProjectTechStack stack={row.tech_stack} max={12} />
            {(row.categories || []).length ? (
              <div className="flex flex-wrap gap-1">
                {row.categories.map((c) => (
                  <span key={c} className="proj-cat-chip">
                    {c}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="space-y-2 text-xs text-slate-500">
              {row.live_url ? (
                <p className="flex items-center gap-1.5 truncate">
                  <Layers className="h-3.5 w-3.5 shrink-0" />
                  {row.live_url}
                </p>
              ) : null}
              {row.code_url ? (
                <p className="flex items-center gap-1.5 truncate">
                  <GitBranch className="h-3.5 w-3.5 shrink-0" />
                  {row.code_url}
                </p>
              ) : null}
              <p className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Order #{row.display_order ?? 0} · {sparklinePoints(row).length} activity points
              </p>
            </div>
          </div>
        </div>
        <p className="mt-4 rounded-lg border border-violet-400/15 bg-violet-500/[0.06] px-3 py-2 text-[11px] text-slate-400">
          <span className="font-medium text-violet-200">AI summary:</span> {row.title} showcases{' '}
          {(row.tech_stack || []).slice(0, 3).join(', ') || 'your stack'} with{' '}
          {row.is_disabled ? 'in-development status' : 'live deployment readiness'} — ideal for visitors exploring{' '}
          {(row.categories || [])[0] || 'your work'}.
        </p>
      </div>
    </motion.div>
  )
}
