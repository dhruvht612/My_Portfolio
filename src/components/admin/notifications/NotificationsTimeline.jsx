import { motion } from 'framer-motion'
import { CircleDot } from 'lucide-react'
import NotificationsEmptyState from './NotificationsEmptyState'
import NotificationsSignalCard from './NotificationsSignalCard'

export default function NotificationsTimeline({
  signals,
  state,
  expandedId,
  onToggle,
  onArchive,
  onResolve,
  onPin,
  onImportant,
  tick,
}) {
  return (
    <section className="notif-timeline-panel flex flex-col overflow-hidden rounded-2xl">
      <motion.div className="sticky top-0 z-10 border-b border-violet-500/10 bg-[rgba(2,8,26,0.9)] px-4 py-3 backdrop-blur-md">
        <motion.div className="flex items-center justify-between gap-3">
          <motion.div>
            <span className="inline-flex items-center gap-1 rounded-full border border-violet-400/25 bg-violet-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-violet-200/90">
              <CircleDot className="h-3 w-3 animate-pulse text-violet-300" aria-hidden />
              Live feed
            </span>
            <p className="mt-2 text-[12px] font-semibold tracking-tight text-slate-200">Operational activity timeline</p>
          </motion.div>
          <motion.div animate={{ opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 2 }} className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-right">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Signals</p>
            <p className="font-mono text-[11px] text-slate-300">{signals.length}</p>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div className="relative flex-1 overflow-y-auto overscroll-contain p-3 md:p-4">
        <motion.div className="pointer-events-none absolute inset-0 notif-terminal-scan opacity-[0.04]" />
        {!signals.length ? (
          <NotificationsEmptyState />
        ) : (
          <ul className="relative space-y-3">
            {signals.map((signal, i) => (
              <NotificationsSignalCard
                key={signal.id}
                signal={signal}
                state={state}
                expanded={expandedId === signal.id}
                onToggle={() => onToggle(signal.id)}
                onArchive={() => onArchive(signal.id)}
                onResolve={() => onResolve(signal.id)}
                onPin={() => onPin(signal.id)}
                onImportant={() => onImportant(signal.id)}
                tick={tick + i}
              />
            ))}
          </ul>
        )}
      </motion.div>
    </section>
  )
}
