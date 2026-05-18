import { motion } from 'framer-motion'
import { BrainCircuit } from 'lucide-react'
import { generateInboxInsights } from './notificationsConfig'

const TONE = {
  sky: 'border-sky-400/25 bg-sky-400/[0.06] text-sky-200',
  emerald: 'border-emerald-400/25 bg-emerald-400/[0.06] text-emerald-200',
  violet: 'border-violet-400/25 bg-violet-400/[0.06] text-violet-200',
  amber: 'border-amber-400/25 bg-amber-400/[0.06] text-amber-200',
}

export default function NotificationsAIInsights({ signals, state }) {
  const insights = generateInboxInsights(signals, state)

  return (
    <section className="notif-glass-card p-4">
      <header className="mb-3 flex items-center gap-2">
        <motion.span className="flex h-8 w-8 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/15" animate={{ boxShadow: ['0 0 0 rgba(139,92,246,0)', '0 0 18px rgba(139,92,246,0.22)', '0 0 0 rgba(139,92,246,0)'] }} transition={{ duration: 3, repeat: Infinity }}>
          <BrainCircuit className="h-4 w-4 text-violet-300" />
        </motion.span>
        <motion.div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/90">Copilot</p>
          <h3 className="text-sm font-semibold text-slate-100">Signal intelligence</h3>
        </motion.div>
      </header>
      <ul className="space-y-2">
        {insights.map((item, i) => (
          <motion.li
            key={item.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 + i * 0.05 }}
            whileHover={{ x: 2 }}
            className={`rounded-xl border px-3 py-2.5 ${TONE[item.tone] || TONE.sky}`}
          >
            <p className="text-xs font-semibold">{item.title}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{item.body}</p>
          </motion.li>
        ))}
      </ul>
    </section>
  )
}
