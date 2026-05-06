import { ChevronDown, CircleDot } from 'lucide-react'
import { AnimatePresence, motion as Motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'

const rail = {
  info: { bar: 'bg-sky-400', text: 'text-sky-200', glow: 'shadow-[0_0_26px_rgba(56,189,248,0.12)]' },
  warning: { bar: 'bg-amber-400', text: 'text-amber-200', glow: 'shadow-[0_0_26px_rgba(251,191,36,0.12)]' },
  critical: { bar: 'bg-red-400', text: 'text-red-200', glow: 'shadow-[0_0_26px_rgba(248,113,113,0.12)]' },
}

function severityLabel(sev) {
  if (sev === 'critical') return 'CRIT'
  if (sev === 'warning') return 'WARN'
  return 'INFO'
}

export default function TerminalActivityFeed({ events, running }) {
  const scrollRef = useRef(null)
  const [pinned, setPinned] = useState(/** @type {string|null} */ (null))
  const pinnedEvent = useMemo(() => events.find((e) => e.id === pinned) || null, [events, pinned])

  useEffect(() => {
    if (!scrollRef.current) return
    const el = scrollRef.current
    // Keep latest stream visible unless user scrolled up intentionally — default “tail -f”.
    el.scrollTop = 0
  }, [events])

  return (
    <div className="obs-glass-panel flex max-h-[min(620px,60vh)] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[rgba(4,11,22,0.70)] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.35)] ring-1 ring-inset ring-white/[0.04]">
      <div className="sticky top-0 z-10 border-b border-emerald-500/10 bg-[rgba(2,10,26,0.85)] px-4 py-3 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-200/90">
                <CircleDot className={`h-3 w-3 ${running ? 'animate-pulse text-emerald-300' : 'text-emerald-400/80'}`} aria-hidden />
                Live mesh
              </span>
              <span className="hidden text-[11px] text-slate-500 sm:inline">/var/log/observe/stream.log</span>
            </div>
            <p className="mt-2 text-[12px] font-semibold tracking-tight text-slate-200">Realtime infrastructure activity</p>
          </div>
          <Motion.div
            animate={{ opacity: running ? [0.55, 1, 0.55] : 1 }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-right"
          >
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Buffer</p>
            <p className="font-mono text-[11px] text-slate-300">{events.length} events</p>
          </Motion.div>
        </div>
      </div>

      <div ref={scrollRef} className="relative flex-1 overflow-y-auto overscroll-contain p-2">
        <div className="pointer-events-none absolute inset-0 obs-terminal-scan opacity-[0.05]" />
        {!events?.length ? (
          <div className="relative rounded-xl border border-white/[0.06] bg-black/20 px-4 py-10 text-center font-mono text-xs text-slate-500">
            <span className="text-sky-400/80">$</span> awaiting first ingest window…
          </div>
        ) : (
          <ul className="relative space-y-2">
            {events.map((e) => {
              const sev = rail[e.severity] || rail.info
              const open = pinned === e.id
              return (
                <li key={e.id} className="relative">
                  <button
                    type="button"
                    onClick={() => setPinned((p) => (p === e.id ? null : e.id))}
                    className={`group/row flex w-full gap-3 rounded-xl border border-white/[0.06] bg-[rgba(2,8,23,0.55)] px-3 py-2.5 text-left transition hover:border-sky-400/18 hover:bg-[rgba(2,12,30,0.62)] ${open ? 'border-sky-400/25 ring-1 ring-sky-400/10' : ''}`}
                  >
                    <span className={`mt-1 h-7 w-1 shrink-0 rounded-full ${sev.bar} ${sev.glow}`} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`font-mono text-[10px] font-bold uppercase tracking-wider ${sev.text}`}>{severityLabel(e.severity)}</span>
                        <span className="font-mono text-[10px] text-slate-600">{new Date(e.at).toLocaleTimeString()}</span>
                        <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-slate-600">
                          details <ChevronDown className={`h-3.5 w-3.5 transition ${open ? 'rotate-180' : ''}`} aria-hidden />
                        </span>
                      </div>
                      <p className="mt-1 text-[13px] leading-snug text-slate-200">{e.message}</p>
                      <AnimatePresence initial={false}>
                        {open ? (
                          <Motion.div
                            key="expand"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-2 rounded-lg border border-white/[0.06] bg-black/25 px-3 py-2 font-mono text-[10px] text-slate-400">
                              <p>
                                <span className="text-slate-600">uuid</span> {e.id}
                              </p>
                              <p className="mt-1">
                                <span className="text-slate-600">timestamp</span> {e.at}
                              </p>
                              <p className="mt-2 text-slate-500">
                                This stream is synthesized from differential health snapshots — deterministic, reproducible telemetry.
                              </p>
                            </div>
                          </Motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <AnimatePresence initial={false}>
        {pinnedEvent ? (
          <Motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="border-t border-white/[0.07] bg-[rgba(2,8,23,0.65)] px-4 py-3 backdrop-blur-md"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Pinned datum</p>
            <p className="mt-1 font-mono text-[11px] text-slate-300">{pinnedEvent.message}</p>
          </Motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
