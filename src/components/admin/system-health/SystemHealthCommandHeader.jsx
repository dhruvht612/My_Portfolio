import { AnimatePresence, motion as Motion } from 'framer-motion'
import { Activity, Cpu, Gauge, Radar, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import AdminPageHeader from '../AdminPageHeader'
import StatusBadge from '../StatusBadge'
import { POLL_INTERVAL_MS } from '../../../hooks/useSystemHealth'

function LiveClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <p className="font-mono text-lg font-semibold tabular-nums tracking-tight text-slate-100 sm:text-xl">
      {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </p>
  )
}

/**
 * @param {{
 *   overall: { headline: string, tone: string, level: string }
 *   running: boolean
 *   initialComplete: boolean
 *   secondsSinceUpdate: number | null
 *   monitoredCount: number
 *   uptimeBlend: number | null
 *   onRefresh: () => void
 *   appVersion: string | null
 * }} props
 */
export default function SystemHealthCommandHeader({
  overall,
  running,
  initialComplete,
  secondsSinceUpdate,
  monitoredCount,
  uptimeBlend,
  onRefresh,
  appVersion,
}) {
  const intervalLabel = useMemo(() => `${Math.round(POLL_INTERVAL_MS / 1000)}s`, [])

  const orbClass =
    overall.level === 'down'
      ? 'from-red-500/40 via-rose-400/20 to-transparent shadow-[0_0_60px_rgba(248,113,113,0.28)]'
      : overall.level === 'degraded'
        ? 'from-amber-400/35 via-yellow-400/18 to-transparent shadow-[0_0_54px_rgba(251,191,36,0.22)]'
        : 'from-emerald-400/35 via-sky-400/20 to-transparent shadow-[0_0_54px_rgba(52,211,153,0.18)]'

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.09] bg-[rgba(6,10,18,0.65)] p-6 shadow-[0_0_0_1px_rgba(56,189,248,0.05)_inset] backdrop-blur-2xl md:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_-10%,rgba(56,189,248,0.14),transparent_55%)]" />
      <div className={`pointer-events-none absolute -top-28 right-[-10%] h-64 w-64 rounded-full bg-gradient-to-br ${orbClass} blur-3xl`} />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 gap-6">
          <Motion.div
            animate={{
              scale: running ? [1, 1.03, 1] : overall.level === 'down' ? [1, 1.06, 1] : [1, 1.02, 1],
            }}
            transition={{ repeat: Infinity, duration: overall.level === 'down' ? 1.35 : overall.level === 'degraded' ? 2 : 3.8, ease: 'easeInOut' }}
            className={`relative mt-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/[0.10] bg-[rgba(2,8,23,0.55)] rings-host`}
          >
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br opacity-80 ${orbClass}`} />
            <Radar className="relative h-7 w-7 text-white/90 drop-shadow-[0_0_12px_rgba(56,189,248,0.35)]" aria-hidden />
            <span
              className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-[rgba(2,8,23,1)] ${
                overall.level === 'down'
                  ? 'animate-pulse bg-red-400'
                  : overall.level === 'degraded'
                    ? 'animate-pulse bg-amber-400'
                    : 'bg-emerald-400'
              }`}
            />
          </Motion.div>

          <AdminPageHeader
            eyebrow="Command center"
            title="Infrastructure observability"
            description="Real-time probes, cinematic topology, anomaly-aware signals — built for elite on-call ergonomics."
          >
            <button
              type="button"
              onClick={onRefresh}
              disabled={running}
              className="group/theme inline-flex items-center gap-2 rounded-xl border border-white/[0.10] bg-gradient-to-r from-white/[0.07] to-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-100 shadow-[0_0_0_1px_rgba(56,189,248,0.08)] transition hover:border-sky-400/35 hover:shadow-[0_12px_40px_rgba(56,189,248,0.10)] disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${running ? 'animate-spin' : 'transition group-hover/theme:rotate-[-18deg]'}`} aria-hidden />
              Run probe
            </button>
          </AdminPageHeader>
        </div>

        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 lg:w-auto lg:min-w-[460px]">
          <MetricTile
            label="Operational state"
            value={
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone={overall.tone}>{overall.headline}</StatusBadge>
                <AnimatePresence initial={false}>
                  {running && initialComplete ? (
                    <Motion.span
                      key="up"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="text-[10px] font-semibold uppercase tracking-wide text-sky-400/90"
                    >
                      Scanning…
                    </Motion.span>
                  ) : null}
                </AnimatePresence>
              </div>
            }
            icon={<Sparkles className="h-4 w-4 text-sky-400/85" />}
          />
          <MetricTile
            label="Monitored services"
            value={<span className="font-mono text-2xl font-bold tabular-nums">{monitoredCount}</span>}
            icon={<ShieldCheck className="h-4 w-4 text-emerald-300/85" />}
          />
          <MetricTile
            label="Blended uptime"
            value={<span className="font-mono text-2xl font-bold tabular-nums">{uptimeBlend != null ? `${uptimeBlend}%` : '—'}</span>}
            icon={<Gauge className="h-4 w-4 text-amber-300/85" />}
            hint="recent window"
          />
          <MetricTile
            label="Live clock"
            value={<LiveClock />}
            icon={<Cpu className="h-4 w-4 text-violet-300/85" />}
            hint={`interval ${intervalLabel}`}
          />
        </div>
      </div>

      <div className="relative mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-5 text-[11px] text-slate-500">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="inline-flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-sky-400/75" aria-hidden />
            Telemetry cadence: <span className="font-mono text-slate-400">{intervalLabel}</span>
          </span>
          <span className="inline-flex items-center gap-2">
            Last ingest
            <span className="font-mono text-slate-400">
              {secondsSinceUpdate != null ? `${secondsSinceUpdate}s ago` : '—'}
            </span>
          </span>
        </div>
        {appVersion ? (
          <span className="font-mono text-[10px] text-slate-600">
            build <span className="text-slate-400">{appVersion}</span>
          </span>
        ) : null}
      </div>
    </div>
  )
}

function MetricTile({ label, value, icon, hint }) {
  return (
    <div className="group/metric rounded-xl border border-white/[0.08] bg-[rgba(2,8,23,0.45)] p-3 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] transition hover:border-sky-400/22 hover:bg-[rgba(2,10,26,0.55)]">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
        <span className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-1 text-slate-300/90">{icon}</span>
      </div>
      <div className="mt-2 min-h-[2.25rem]">{value}</div>
      {hint ? <p className="mt-1 text-[10px] text-slate-600">{hint}</p> : null}
    </div>
  )
}
