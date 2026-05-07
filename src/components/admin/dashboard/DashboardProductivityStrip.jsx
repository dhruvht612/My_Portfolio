import { Flame, Focus, ListTodo } from 'lucide-react'
import { motion as Motion } from 'framer-motion'

export default function DashboardProductivityStrip({ dailyFocus, streakLabel, backlogNote }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-2xl border border-white/[0.08] bg-[rgba(5,11,22,0.55)] p-5 backdrop-blur-xl ring-1 ring-inset ring-emerald-400/10"
      >
        <div className="flex items-center gap-2 text-emerald-300/90">
          <Focus className="h-5 w-5" aria-hidden />
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Daily focus</p>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-200">{dailyFocus}</p>
      </Motion.div>

      <Motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="rounded-2xl border border-white/[0.08] bg-[rgba(5,11,22,0.55)] p-5 backdrop-blur-xl ring-1 ring-inset ring-orange-400/12"
      >
        <div className="flex items-center gap-2 text-orange-300/90">
          <Flame className="h-5 w-5" aria-hidden />
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Momentum</p>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-200">{streakLabel}</p>
      </Motion.div>

      <Motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="rounded-2xl border border-white/[0.08] bg-[rgba(5,11,22,0.55)] p-5 backdrop-blur-xl ring-1 ring-inset ring-sky-400/10"
      >
        <div className="flex items-center gap-2 text-sky-300/85">
          <ListTodo className="h-5 w-5" aria-hidden />
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Backlog optics</p>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-200">{backlogNote}</p>
      </Motion.div>
    </div>
  )
}
