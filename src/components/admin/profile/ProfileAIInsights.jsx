import { motion } from 'framer-motion'
import { BrainCircuit } from 'lucide-react'
import { generateProfileInsights } from './profileInsights'

const TONE = {
  sky: 'border-sky-400/25 bg-sky-400/[0.06] text-sky-200',
  emerald: 'border-emerald-400/25 bg-emerald-400/[0.06] text-emerald-200',
  violet: 'border-violet-400/25 bg-violet-400/[0.06] text-violet-200',
  cyan: 'border-cyan-400/25 bg-cyan-400/[0.06] text-cyan-200',
  amber: 'border-amber-400/25 bg-amber-400/[0.06] text-amber-200',
}

export default function ProfileAIInsights({ values }) {
  const insights = generateProfileInsights(values)

  return (
    <section className="idf-glass-card p-4">
      <header className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/15">
          <BrainCircuit className="h-4 w-4 text-violet-300" />
        </span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/90">Intelligence</p>
          <h3 className="text-sm font-semibold text-slate-100">Identity insights</h3>
        </div>
      </header>
      <ul className="space-y-2">
        {insights.map((item, i) => (
          <motion.li
            key={item.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.06 }}
            whileHover={{ x: 2 }}
            className={`rounded-xl border px-3 py-2.5 transition-shadow hover:shadow-[0_0_20px_rgba(167,139,250,0.08)] ${TONE[item.tone] || TONE.violet}`}
          >
            <p className="text-xs font-semibold">{item.title}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{item.body}</p>
          </motion.li>
        ))}
      </ul>
    </section>
  )
}
