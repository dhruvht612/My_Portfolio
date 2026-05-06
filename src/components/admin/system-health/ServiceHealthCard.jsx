import { AnimatePresence, motion as Motion } from 'framer-motion'
import { ChevronDown, Terminal } from 'lucide-react'
import { useMemo, useState } from 'react'
import StatusBadge from '../StatusBadge'

const toneByStatus = {
  operational: 'green',
  degraded: 'amber',
  down: 'red',
  not_configured: 'gray',
}

const labelByStatus = {
  operational: 'Operational',
  degraded: 'Degraded',
  down: 'Down',
  not_configured: 'Not configured',
}

function MiniSparkline({ points, stroke, gradientId }) {
  if (!points?.length) return <div className="h-10 w-full rounded-lg border border-white/[0.05] bg-white/[0.02]" />
  const W = 140
  const H = 36
  const gid = gradientId || 'spark-default'
  const ms = points.map((p) => p.ms).filter((x) => x != null)
  if (!ms.length) return <div className="h-10 w-full rounded-lg border border-white/[0.05] bg-white/[0.02]" />
  const min = Math.min(...ms)
  const max = Math.max(...ms)
  const span = Math.max(1, max - min)
  const d = points
    .map((p, i) => {
      if (p.ms == null) return null
      const x = (i / Math.max(points.length - 1, 1)) * W
      const y = H - ((p.ms - min) / span) * (H - 4) - 2
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .filter(Boolean)
    .join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-10 w-full" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L ${W} ${H} L 0 ${H} Z`} fill={`url(#${gid})`} opacity={0.65} />
      <path d={d} fill="none" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

function UptimeRing({ pct, stroke }) {
  const p = Math.max(0, Math.min(100, pct ?? 0))
  const r = 16
  const c = 2 * Math.PI * r
  const off = c * (1 - p / 100)
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden>
      <circle cx="22" cy="22" r={r} fill="rgba(2,8,23,0.35)" stroke="rgba(148,163,184,0.12)" strokeWidth="3" />
      <Motion.circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        stroke={stroke}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: off }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        transform="rotate(-90 22 22)"
        style={{ filter: 'drop-shadow(0 0 6px rgba(56,189,248,0.18))' }}
      />
    </svg>
  )
}

/** @param {'database'|'auth'|'storage'|'frontend'|'api'} serviceKey */
export default function ServiceHealthCard({ serviceKey, title, description, icon: Icon, result, uptimePct, history, loading, relatedEvents }) {
  const { status, latencyMs, error, checkedAt } = result
  const tone = toneByStatus[status] || 'gray'
  const badgeLabel = labelByStatus[status] || status
  const [open, setOpen] = useState(false)

  const stroke =
    tone === 'red' ? '#f87171' : tone === 'amber' ? '#fbbf24' : tone === 'green' ? '#34d399' : '#94a3b8'

  const sparkStroke = tone === 'red' ? '#fb7185' : tone === 'amber' ? '#fbbf24' : '#38bdf8'

  const tail = history?.slice(-12) || []

  const statusMix = useMemo(() => {
    const h = history || []
    if (!h.length) return null
    const buckets = { operational: 0, degraded: 0, down: 0 }
    for (const pt of h) {
      buckets[pt.status] = (buckets[pt.status] || 0) + 1
    }
    return buckets
  }, [history])

  return (
    <Motion.article
      layout
      initial={false}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 430, damping: 30 }}
      className={`group/card obs-glass-panel relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[rgba(5,11,22,0.72)] shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl ring-1 ring-inset ring-white/[0.04] ${
        status === 'down'
          ? 'hover:border-red-400/30 hover:shadow-[0_18px_60px_rgba(248,113,113,0.10)]'
          : status === 'degraded'
            ? 'hover:border-amber-400/26 hover:shadow-[0_18px_60px_rgba(251,191,36,0.10)]'
            : 'hover:border-sky-400/25 hover:shadow-[0_18px_60px_rgba(56,189,248,0.10)]'
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-30%,rgba(56,189,248,0.10),transparent_55%)] opacity-60 transition-opacity group-hover/card:opacity-100" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay obs-grain" />

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative w-full p-5 text-left"
        aria-expanded={open}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            {Icon ? (
              <span
                className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/[0.10] bg-white/[0.03] text-sky-200/90 shadow-[0_0_22px_rgba(56,189,248,0.10)] transition group-hover/card:border-sky-400/25`}
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span
                  className={`absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ring-2 ring-[rgba(5,11,22,1)] ${
                    status === 'operational' ? 'bg-emerald-400' : status === 'degraded' ? 'bg-amber-400' : status === 'down' ? 'bg-red-400' : 'bg-slate-500'
                  }`}
                />
              </span>
            ) : null}
            <div className="min-w-0">
              <h3 className="text-sm font-semibold tracking-tight text-slate-100">{title}</h3>
              {description ? <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{description}</p> : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <StatusBadge tone={tone}>{badgeLabel}</StatusBadge>
            <ChevronDown className={`h-4 w-4 text-slate-500 transition ${open ? 'rotate-180' : ''}`} aria-hidden />
          </div>
        </div>

        <div className="relative mt-5 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_140px] sm:items-end">
          <div>
            {loading ? (
              <div className="space-y-2">
                <div className="h-10 w-32 animate-pulse rounded-lg bg-white/[0.06]" />
                <div className="h-3 w-44 animate-pulse rounded bg-white/[0.05]" />
              </div>
            ) : (
              <>
                {status === 'not_configured' ? (
                  <p className="text-sm text-slate-500">
                    Not configured yet.{' '}
                    <span className="font-mono text-[11px] text-sky-300/80">VITE_API_URL</span> enables API probing.
                  </p>
                ) : (
                  <>
                    <Motion.p
                      key={latencyMs ?? 'na'}
                      initial={{ opacity: 0.65, filter: 'blur(2px)' }}
                      animate={{ opacity: 1, filter: 'blur(0px)' }}
                      transition={{ duration: 0.35 }}
                      className="font-mono text-3xl font-bold tabular-nums tracking-tight text-slate-50"
                    >
                      {latencyMs != null ? `${latencyMs}` : '—'}
                      <span className="ml-1 text-base font-semibold text-slate-500">ms</span>
                    </Motion.p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Last checked{' '}
                      <span className="font-mono text-slate-400">
                        {checkedAt ? new Date(checkedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}
                      </span>
                    </p>
                    {error && status === 'down' ? (
                      <p className="mt-2 line-clamp-3 font-mono text-[11px] text-red-300/90">{error}</p>
                    ) : null}
                  </>
                )}
              </>
            )}
          </div>

          <div className="flex items-end justify-between gap-3 sm:flex-col sm:items-end">
            <div className="w-full sm:w-auto">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">Trajectory</p>
              <MiniSparkline points={tail} stroke={sparkStroke} gradientId={`sparkfill-${serviceKey}`} />
            </div>
            <div className="flex items-center gap-2">
              <UptimeRing pct={uptimePct ?? 0} stroke={stroke} />
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">Stability</p>
                <p className="font-mono text-sm font-semibold text-slate-100">{uptimePct != null ? `${uptimePct}%` : '—'}</p>
                <p className="text-[10px] text-slate-600">recent checks</p>
              </div>
            </div>
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <Motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="border-t border-white/[0.07] bg-[rgba(2,8,23,0.45)]"
          >
            <div className="space-y-4 p-5">
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 ring-1 ring-inset ring-white/[0.04]">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Probe history</p>
                  <ul className="mt-3 max-h-[140px] space-y-1.5 overflow-y-auto pr-1 font-mono text-[10px] text-slate-400">
                    {tail.length ? (
                      tail
                        .slice()
                        .reverse()
                        .map((pt, idx) => (
                          <li key={idx} className="flex items-center justify-between gap-3 border-b border-white/[0.04] py-1.5 last:border-0">
                            <span className="text-slate-500">{new Date(pt.t).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                            <span className="tabular-nums text-slate-300">{pt.ms != null ? `${pt.ms}ms` : 'fail'}</span>
                            <span
                              className={`uppercase tracking-wide ${pt.status === 'operational' ? 'text-emerald-400/85' : pt.status === 'degraded' ? 'text-amber-300/90' : 'text-red-300/90'}`}
                            >
                              {pt.status}
                            </span>
                          </li>
                        ))
                    ) : (
                      <li className="py-8 text-center text-slate-600">Waiting for samples…</li>
                    )}
                  </ul>
                </div>
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 ring-1 ring-inset ring-white/[0.04]">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Operational mix</p>
                  {statusMix ? (
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg border border-emerald-400/15 bg-emerald-500/5 px-2 py-2">
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-600">Operational</p>
                        <p className="mt-1 font-mono text-sm text-emerald-200/90">{statusMix.operational}</p>
                      </div>
                      <div className="rounded-lg border border-amber-400/18 bg-amber-500/5 px-2 py-2">
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-600">Degraded</p>
                        <p className="mt-1 font-mono text-sm text-amber-200/90">{statusMix.degraded}</p>
                      </div>
                      <div className="rounded-lg border border-red-400/18 bg-red-500/5 px-2 py-2">
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-600">Down</p>
                        <p className="mt-1 font-mono text-sm text-red-200/90">{statusMix.down}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-6 text-center font-mono text-[11px] text-slate-600">Gathering classifications…</p>
                  )}
                  <p className="mt-3 text-[10px] text-slate-600">
                    Service key <span className="font-mono text-slate-400">{serviceKey}</span>
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.07] bg-black/25 px-4 py-3 ring-1 ring-inset ring-sky-500/10">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <Terminal className="h-3.5 w-3.5 text-sky-400/80" aria-hidden />
                  Stream preview
                </div>
                <ul className="mt-3 max-h-[120px] space-y-2 overflow-y-auto font-mono text-[10px] leading-relaxed text-slate-400">
                  {relatedEvents?.length ? (
                    relatedEvents.slice(0, 6).map((e) => (
                      <li key={e.id} className="border-b border-white/[0.05] pb-2 last:border-0">
                        <span className="text-slate-600">{new Date(e.at).toLocaleTimeString()}</span> — {e.message}
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-600">No correlated events yet.</li>
                  )}
                </ul>
              </div>
            </div>
          </Motion.div>
        ) : null}
      </AnimatePresence>
    </Motion.article>
  )
}
