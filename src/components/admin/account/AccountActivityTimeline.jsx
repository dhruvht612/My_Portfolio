import { motion, AnimatePresence } from 'framer-motion'
import { CircleDot, LogIn, RefreshCw, Settings, User } from 'lucide-react'

const TYPE_META = {
  auth: { icon: LogIn, bar: 'bg-emerald-400', glow: 'shadow-[0_0_20px_rgba(52,211,153,0.15)]' },
  profile: { icon: User, bar: 'bg-sky-400', glow: 'shadow-[0_0_20px_rgba(56,189,248,0.12)]' },
  sync: { icon: RefreshCw, bar: 'bg-violet-400', glow: 'shadow-[0_0_20px_rgba(167,139,250,0.12)]' },
  settings: { icon: Settings, bar: 'bg-amber-400', glow: 'shadow-[0_0_20px_rgba(251,191,36,0.1)]' },
}

export default function AccountActivityTimeline({ events }) {
  return (
    <section className="acc-terminal-panel flex max-h-[min(480px,52vh)] flex-col overflow-hidden rounded-2xl">
      <div className="sticky top-0 z-10 border-b border-indigo-500/10 bg-[rgba(2,8,26,0.88)] px-4 py-3 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full border border-indigo-400/25 bg-indigo-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-200/90">
              <CircleDot className="h-3 w-3 animate-pulse text-indigo-300" aria-hidden />
              Live feed
            </span>
            <p className="mt-2 text-[12px] font-semibold tracking-tight text-slate-200">Account activity stream</p>
          </div>
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-right"
          >
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Events</p>
            <p className="font-mono text-[11px] text-slate-300">{events.length}</p>
          </motion.div>
        </div>
      </div>
      <div className="relative flex-1 overflow-y-auto overscroll-contain p-3">
        <div className="pointer-events-none absolute inset-0 acc-terminal-scan opacity-[0.04]" />
        {!events?.length ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-white/[0.06] bg-black/20 px-4 py-10 text-center font-mono text-xs text-slate-500"
          >
            <span className="text-indigo-400/80">$</span> awaiting activity…
          </motion.div>
        ) : (
          <ul className="relative space-y-0">
            <AnimatePresence initial={false}>
              {events.map((e, i) => {
                const meta = TYPE_META[e.type] || TYPE_META.settings
                const Icon = meta.icon
                return (
                  <motion.li
                    key={e.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="relative flex gap-3 pb-4 last:pb-0"
                  >
                    {i < events.length - 1 ? (
                      <span className="absolute left-[15px] top-8 bottom-0 w-px bg-gradient-to-b from-white/15 to-transparent" aria-hidden />
                    ) : null}
                    <span className={`relative z-[1] mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 ${meta.glow}`}>
                      <span className={`absolute inset-0 rounded-full opacity-40 ${meta.bar}`} style={{ filter: 'blur(6px)' }} />
                      <Icon className="relative h-3.5 w-3.5 text-slate-200" />
                    </span>
                    <motion.div
                      whileHover={{ borderColor: 'rgba(129, 140, 248, 0.2)' }}
                      className="min-w-0 flex-1 rounded-xl border border-white/[0.06] bg-[rgba(2,8,23,0.55)] px-3 py-2.5"
                    >
                      <motion.div
                        className="flex flex-wrap items-center gap-2"
                        animate={{ opacity: [0.9, 1, 0.9] }}
                        transition={{ duration: 4, repeat: Infinity, delay: i * 0.3 }}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${meta.bar}`} />
                        <p className="text-xs font-medium text-slate-200">{e.label}</p>
                        <span className="ml-auto font-mono text-[10px] text-slate-600">
                          {new Date(e.at).toLocaleTimeString()}
                        </span>
                      </motion.div>
                      <p className="mt-1 font-mono text-[11px] text-slate-500">{e.detail}</p>
                    </motion.div>
                  </motion.li>
                )
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </section>
  )
}
