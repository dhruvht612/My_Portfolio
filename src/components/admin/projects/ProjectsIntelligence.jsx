import { motion } from 'framer-motion'
import { BrainCircuit, TrendingUp } from 'lucide-react'
import { generateInsights, topCategories, topTechStacks } from './projectInsights'

const TONE = {
  sky: 'border-sky-400/25 bg-sky-400/[0.06] text-sky-200',
  violet: 'border-violet-400/25 bg-violet-400/[0.06] text-violet-200',
  cyan: 'border-cyan-400/25 bg-cyan-400/[0.06] text-cyan-200',
  amber: 'border-amber-400/25 bg-amber-400/[0.06] text-amber-200',
  emerald: 'border-emerald-400/25 bg-emerald-400/[0.06] text-emerald-200',
}

export default function ProjectsIntelligence({ rows }) {
  const insights = generateInsights(rows)
  const tech = topTechStacks(rows, 6)
  const cats = topCategories(rows).slice(0, 5)

  return (
    <aside className="space-y-3 lg:sticky lg:top-4 lg:self-start">
      <section className="proj-glass-card p-4">
        <header className="mb-3 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/15">
            <BrainCircuit className="h-4 w-4 text-violet-300" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/90">Assistant</p>
            <h3 className="text-sm font-semibold text-slate-100">Portfolio intelligence</h3>
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

      {tech.length ? (
        <section className="proj-glass-card p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Stack map</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tech.map(([name, count]) => (
              <span key={name} className="proj-stack-map-chip">
                {name}
                <span className="ml-1 opacity-60">{count}</span>
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {cats.length ? (
        <section className="proj-glass-card p-4">
          <p className="mb-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            <TrendingUp className="h-3 w-3" />
            Categories
          </p>
          <div className="space-y-1.5">
            {cats.map(([name, count]) => (
              <div key={name} className="flex items-center gap-2">
                <span className="w-16 truncate text-[11px] capitalize text-slate-400">{name}</span>
                <motion.div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-sky-500/70 to-violet-500/70"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (count / Math.max(rows.length, 1)) * 100)}%` }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  />
                </motion.div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </aside>
  )
}
