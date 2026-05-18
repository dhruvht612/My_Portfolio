import { AnimatePresence, motion } from 'framer-motion'
import { Archive, Check, ChevronDown, Pin, Star, X } from 'lucide-react'
import { SEVERITY, formatRelativeTime } from './notificationsConfig'

export default function NotificationsSignalCard({
  signal,
  state,
  expanded,
  onToggle,
  onArchive,
  onResolve,
  onPin,
  onImportant,
  tick,
}) {
  const sev = SEVERITY[signal.severity] || SEVERITY.medium
  const isRead = state.read.includes(signal.id)
  const isResolved = state.resolved.includes(signal.id)
  const isPinned = state.pinned.includes(signal.id)
  const isImportant = state.important.includes(signal.id)
  const relTime = formatRelativeTime(signal.at - (tick % 15) * 1000)

  return (
    <motion.li layout className="relative">
      <span className="absolute left-[15px] top-10 bottom-0 w-px bg-gradient-to-b from-white/15 to-transparent" aria-hidden />
      <motion.article
        layout
        className={`notif-signal-card group ${sev.border} ${sev.glow} ${expanded ? 'notif-signal-card-open' : ''} ${!isRead ? 'notif-signal-unread' : ''}`}
        whileHover={{ y: -2 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      >
        <motion.button type="button" onClick={onToggle} className="flex w-full gap-3 p-3.5 text-left md:p-4">
          <span className={`relative z-[1] mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-slate-900/80`}>
            <span className={`absolute inset-0 rounded-full opacity-40 ${sev.bar}`} style={{ filter: 'blur(6px)' }} />
            <motion.span className={`h-2 w-2 rounded-full ${sev.bar}`} animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 2, repeat: Infinity }} />
          </span>
          <motion.div className="min-w-0 flex-1">
            <motion.div className="flex flex-wrap items-center gap-2">
              <span className={`font-mono text-[10px] font-bold uppercase tracking-wider ${sev.text}`}>{sev.label}</span>
              <span className="notif-ai-class">{signal.aiClass}</span>
              {isPinned ? <Pin className="h-3 w-3 text-amber-300" /> : null}
              {isImportant ? <Star className="h-3 w-3 text-amber-300 fill-amber-300/40" /> : null}
              {isResolved ? <span className="text-[10px] text-emerald-400">Resolved</span> : null}
              <span className="ml-auto font-mono text-[10px] text-slate-600">{relTime}</span>
            </motion.div>
            <p className="mt-1 text-sm font-semibold text-slate-100">{signal.title}</p>
            <p className="mt-1 line-clamp-2 text-sm text-slate-400">{signal.detail}</p>
            <motion.div className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-slate-500">
              <span className="notif-meta-chip">{signal.source}</span>
              <span className="notif-meta-chip">{signal.category}</span>
              <span className="notif-meta-chip text-cyan-400/80">Signal updated {relTime}</span>
            </motion.div>
          </motion.div>
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} className="shrink-0 text-slate-500">
            <ChevronDown className="h-5 w-5" />
          </motion.span>
        </motion.button>

        <AnimatePresence initial={false}>
          {expanded ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-white/[0.06] px-4 pb-4"
            >
              <motion.div className="pt-3 space-y-3">
                <motion.div className="rounded-lg border border-violet-400/15 bg-violet-500/[0.06] px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-300/90">AI analysis</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                    Classified as <strong className="text-slate-300">{signal.aiClass}</strong> from {signal.source}. Priority lane{' '}
                    {sev.label.toLowerCase()} — route to {signal.category} workspace if action is required.
                  </p>
                </motion.div>
                <motion.div className="grid gap-2 sm:grid-cols-2">
                  <motion.div className="rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2 font-mono text-[11px] text-slate-500">
                    <span className="text-cyan-400/80">›</span> Ingested {new Date(signal.at).toLocaleString()}
                  </motion.div>
                  <motion.div className="rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2 font-mono text-[11px] text-slate-500">
                    <span className="text-cyan-400/80">›</span> Monitoring active
                  </motion.div>
                </motion.div>
                <motion.div className="flex flex-wrap gap-2">
                  <ActionBtn icon={Check} label="Resolve" onClick={onResolve} tone="emerald" />
                  <ActionBtn icon={Archive} label="Archive" onClick={onArchive} />
                  <ActionBtn icon={Pin} label={isPinned ? 'Unpin' : 'Pin'} onClick={onPin} />
                  <ActionBtn icon={Star} label={isImportant ? 'Unmark' : 'Important'} onClick={onImportant} tone="amber" />
                  <ActionBtn icon={X} label="Dismiss" onClick={onArchive} tone="muted" />
                </motion.div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.article>
    </motion.li>
  )
}

function ActionBtn({ icon: Icon, label, onClick, tone = 'sky' }) {
  const cls =
    tone === 'emerald'
      ? 'notif-action-emerald'
      : tone === 'amber'
        ? 'notif-action-amber'
        : tone === 'muted'
          ? 'notif-action-muted'
          : 'notif-action-sky'
  return (
    <motion.button type="button" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={(e) => { e.stopPropagation(); onClick() }} className={`notif-action-btn ${cls}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </motion.button>
  )
}
