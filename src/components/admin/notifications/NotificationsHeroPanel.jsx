import { motion } from 'framer-motion'
import { BrainCircuit, Radio, Sparkles, Terminal } from 'lucide-react'
import { generateInboxInsights } from './notificationsConfig'

export default function NotificationsHeroPanel({ signals, state, monitoring }) {
  const active = signals.filter((s) => !state.archived.includes(s.id))
  const unread = active.filter((s) => !state.read.includes(s.id) && !state.resolved.includes(s.id))
  const actionCount = active.filter(
    (s) => !state.resolved.includes(s.id) && (s.aiClass === 'Action required' || s.severity === 'critical'),
  ).length
  const headline = generateInboxInsights(signals, state)[0]

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 90, damping: 18 }}
      className="notif-hero-panel relative overflow-hidden rounded-2xl border border-white/[0.08] p-4 md:p-5"
    >
      <motion.div className="notif-hero-banner pointer-events-none absolute inset-0" animate={{ opacity: [0.88, 1, 0.88] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
      <motion.div className="relative space-y-3">
        <motion.div className="flex flex-wrap items-center gap-2">
          <span className="notif-pill">
            <Terminal className="h-3.5 w-3.5" aria-hidden />
            Signal OS
          </span>
          <span className="notif-pill notif-pill-live">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {monitoring ? 'Realtime signal monitoring active' : 'Monitoring paused'}
          </span>
          <span className="notif-pill notif-pill-alert">
            <Radio className="h-3 w-3" aria-hidden />
            {unread.length} active signal{unread.length === 1 ? '' : 's'}
          </span>
        </motion.div>

        <motion.div>
          <h2 className="text-xl font-semibold tracking-tight text-white md:text-2xl">Operational inbox</h2>
          <p className="mt-1 text-sm text-slate-400">
            AI-classified workspace feed · {actionCount} alert{actionCount === 1 ? '' : 's'} require attention
          </p>
        </motion.div>

        {headline ? (
          <motion.div
            key={headline.title}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="notif-insight-snippet flex gap-2 rounded-xl border border-violet-400/20 bg-violet-400/[0.06] px-3 py-2.5"
          >
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" aria-hidden />
            <motion.div>
              <p className="text-xs font-medium text-violet-100">{headline.title}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{headline.body}</p>
            </motion.div>
          </motion.div>
        ) : null}

        <motion.div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
          <span className="notif-status-chip">AI filtering engine running normally</span>
          <span className="notif-status-chip text-emerald-300/90">Priority routing armed</span>
          <span className="notif-status-chip">Inbox health nominal</span>
        </motion.div>
      </motion.div>

      <motion.div className="relative mt-3 flex items-center gap-2 border-t border-white/[0.06] pt-3 text-[10px] uppercase tracking-[0.16em] text-slate-500">
        <BrainCircuit className="h-3.5 w-3.5 text-violet-400/80" />
        Operational command feed · live mesh ingest
      </motion.div>
    </motion.section>
  )
}
