import { motion } from 'framer-motion'
import { BrainCircuit, TrendingUp } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import DashboardAnimatedNumber from '../dashboard/DashboardAnimatedNumber'

const TONE = {
  sky: 'border-sky-400/25 bg-sky-400/[0.06] text-sky-200',
  violet: 'border-violet-400/25 bg-violet-400/[0.06] text-violet-200',
  cyan: 'border-cyan-400/25 bg-cyan-400/[0.06] text-cyan-200',
  amber: 'border-amber-400/25 bg-amber-400/[0.06] text-amber-200',
  emerald: 'border-emerald-400/25 bg-emerald-400/[0.06] text-emerald-200',
}

export default function SkillsIntelligence({ metrics, insights }) {
  return (
    <aside className="space-y-3 lg:sticky lg:top-4 lg:self-start">
      <section className="adm-sk-glass-card p-4">
        <header className="mb-3 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-500/15">
            <BrainCircuit className="h-4 w-4 text-sky-300" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-300/90">Assistant</p>
            <h3 className="text-sm font-semibold text-slate-100">Stack intelligence</h3>
          </div>
        </header>
        <ul className="space-y-2">
          {insights.map((item, i) => (
            <motion.li
              key={item.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 + i * 0.05 }}
              className={`rounded-xl border px-3 py-2.5 ${TONE[item.tone] || TONE.sky}`}
            >
              <p className="text-xs font-semibold">{item.title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{item.body}</p>
            </motion.li>
          ))}
        </ul>
      </section>

      {metrics.distribution?.length > 0 ? (
        <section className="adm-sk-glass-card p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Level distribution</p>
          <motion.div className="mt-2 h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={metrics.distribution} dataKey="value" nameKey="name" innerRadius={32} outerRadius={48} paddingAngle={2} stroke="none">
                  {metrics.distribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(5,10,20,0.92)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
          <p className="mt-2 text-center text-lg font-bold text-slate-100">
            <DashboardAnimatedNumber value={metrics.capabilityScore} />
            <span className="text-sm text-slate-500"> score</span>
          </p>
        </section>
      ) : null}

      {metrics.groupAverages?.length > 0 ? (
        <section className="adm-sk-glass-card p-4">
          <p className="mb-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            <TrendingUp className="h-3 w-3" />
            Domain heatmap
          </p>
          <div className="space-y-2">
            {metrics.groupAverages.map((g) => (
              <div key={g.name}>
                <div className="mb-0.5 flex justify-between text-[11px]">
                  <span className="truncate text-slate-400">{g.name}</span>
                  <span className="font-semibold text-sky-300/90">{g.avg}%</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-sky-500/70 to-violet-500/70"
                    initial={{ width: 0 }}
                    animate={{ width: `${g.avg}%` }}
                    transition={{ duration: 0.55 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </aside>
  )
}
