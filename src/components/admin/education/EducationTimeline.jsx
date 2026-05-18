import { motion } from 'framer-motion'
import { buildTimeline } from './educationInsights'

export default function EducationTimeline({ values }) {
  const nodes = buildTimeline(values?.progress_percent, values?.highlights)

  return (
    <section className="edu-glass-card p-4">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/90">Trajectory</p>
          <h3 className="text-sm font-semibold text-slate-100">Academic timeline</h3>
        </div>
        <span className="text-[11px] text-slate-500">{values?.progress_percent ?? 0}% path</span>
      </header>
      <ol className="edu-timeline relative space-y-0 pl-1">
        {nodes.map((node, i) => (
          <motion.li
            key={node.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="edu-timeline-item relative flex gap-3 pb-5 last:pb-0"
          >
            <span
              className={`edu-timeline-node z-[1] mt-0.5 flex h-3 w-3 shrink-0 rounded-full border-2 ${
                node.done
                  ? 'border-cyan-400 bg-cyan-400/30 shadow-[0_0_12px_rgba(34,211,238,0.45)]'
                  : node.active
                    ? 'border-sky-400 bg-sky-400/20 animate-pulse'
                    : 'border-slate-600 bg-slate-800/80'
              }`}
            />
            <div className="min-w-0 flex-1 pt-[-2px]">
              <p className={`text-xs font-medium ${node.done || node.active ? 'text-slate-200' : 'text-slate-500'}`}>
                {node.label}
              </p>
              {node.type === 'achievement' ? (
                <p className="text-[10px] text-violet-300/70">Milestone card</p>
              ) : node.active ? (
                <p className="text-[10px] text-sky-400/80">You are here</p>
              ) : node.done ? (
                <p className="text-[10px] text-emerald-400/70">Complete</p>
              ) : (
                <p className="text-[10px] text-slate-600">Upcoming</p>
              )}
            </div>
          </motion.li>
        ))}
      </ol>
    </section>
  )
}
