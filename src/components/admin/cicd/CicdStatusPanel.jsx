import { motion as Motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { CICD_COPY, TIME_RANGES } from '../../../constants/cicdStrings'
import { CountUp, Skeleton } from './CicdPrimitives'
import { healthToken } from './statusTokens'

/**
 * Section 1 — the page's headline verdict.
 *
 * Left column states health in words; right column carries the four rates and
 * the run-volume histogram. The histogram is intentionally low-contrast: it is
 * context for the rates, not the subject of the panel.
 */
export default function CicdStatusPanel({ summary, activity, range, onRangeChange, activityLoading, loading }) {
  const token = healthToken(summary?.level || 'healthy')

  const body =
    summary?.level === 'critical'
      ? CICD_COPY.status.criticalBody
      : summary?.level === 'degraded'
        ? CICD_COPY.status.degradedBody
        : CICD_COPY.status.healthyBody

  const rates = [
    { label: CICD_COPY.metrics.buildSuccess, value: summary?.buildSuccessPct, decimals: 1 },
    { label: CICD_COPY.metrics.deploySuccess, value: summary?.deploySuccessPct, decimals: 1 },
    { label: CICD_COPY.metrics.testPass, value: summary?.testPassPct, decimals: 1 },
    { label: CICD_COPY.metrics.productionUptime, value: summary?.uptimePct, decimals: 2 },
  ]

  return (
    <section
      aria-label={CICD_COPY.status.panelTitle}
      className="relative overflow-hidden rounded-2xl border border-white/[0.09] bg-[rgba(6,10,18,0.62)] shadow-[0_16px_50px_rgba(0,0,0,0.32)] backdrop-blur-xl"
    >
      <div
        className={`pointer-events-none absolute -top-24 left-[-6%] h-56 w-56 rounded-full blur-3xl ${
          summary?.level === 'critical'
            ? 'bg-rose-500/15'
            : summary?.level === 'degraded'
              ? 'bg-amber-400/12'
              : 'bg-emerald-400/10'
        }`}
        aria-hidden
      />

      <div className="relative grid grid-cols-1 gap-6 p-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-8 lg:p-6">
        {/* Verdict */}
        <div className="flex min-w-0 flex-col justify-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">{CICD_COPY.status.panelTitle}</p>

          {loading ? (
            <Skeleton className="mt-3 h-9 w-44" />
          ) : (
            <div className="mt-2.5 flex items-center gap-3">
              <span className={`relative flex h-3 w-3 items-center justify-center`} aria-hidden>
                <Motion.span
                  className={`absolute h-3 w-3 rounded-full ${token.dot} opacity-40`}
                  animate={{ scale: [1, 1.9, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ repeat: Infinity, duration: 2.8, ease: 'easeOut' }}
                />
                <span className={`h-2.5 w-2.5 rounded-full ${token.dot}`} />
              </span>
              <h2 className={`text-3xl font-bold uppercase tracking-tight ${token.text}`}>{token.label}</h2>
            </div>
          )}

          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">{loading ? <Skeleton className="h-4 w-64" /> : body}</p>

          <div className="mt-5 inline-flex w-fit items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.02] px-2.5 py-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400/70" aria-hidden />
            Gates enforced on every promotion to production
          </div>
        </div>

        {/* Rates + histogram */}
        <div className="min-w-0">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3.5 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {rates.map((rate) => (
              <div key={rate.label} className="min-w-0">
                <dt className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{rate.label}</dt>
                <dd className="mt-1 font-mono text-xl font-bold tabular-nums text-slate-100">
                  {loading ? <Skeleton className="h-6 w-16" /> : <CountUp value={rate.value ?? 0} decimals={rate.decimals} suffix="%" />}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 border-t border-white/[0.06] pt-4">
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{CICD_COPY.metrics.activityTitle}</p>
              <RangeSelector value={range} onChange={onRangeChange} />
            </div>
            <ActivityHistogram data={activity} loading={activityLoading || loading} />
          </div>
        </div>
      </div>
    </section>
  )
}

/** 24H / 7D / 30D switch. A radiogroup, so arrow keys move between options. */
function RangeSelector({ value, onChange }) {
  return (
    <div role="radiogroup" aria-label="Activity time range" className="inline-flex rounded-lg border border-white/[0.08] bg-white/[0.02] p-0.5">
      {TIME_RANGES.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`rounded-[6px] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 ${
              active ? 'bg-sky-500/20 text-sky-200 ring-1 ring-sky-400/30' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Run-volume bars with failures stacked on top in amber.
 *
 * Hand-rolled rather than charted: at this size a library would add weight for
 * axes and legends the panel deliberately does not show.
 */
function ActivityHistogram({ data, loading }) {
  const reduced = useReducedMotion()
  const [hover, setHover] = useState(null)

  const max = useMemo(() => Math.max(1, ...(data || []).map((d) => d.runs)), [data])

  if (loading) {
    return (
      <div className="flex h-16 items-end gap-[3px]" aria-hidden>
        {Array.from({ length: 24 }).map((_, i) => (
          <Skeleton key={i} className="flex-1" style={{ height: `${30 + ((i * 37) % 60)}%` }} />
        ))}
      </div>
    )
  }

  if (!data?.length) return <div className="h-16" aria-hidden />

  const total = data.reduce((sum, d) => sum + d.runs, 0)
  const failures = data.reduce((sum, d) => sum + d.failures, 0)
  const point = hover != null ? data[hover] : null

  const bucketLabel = (t) =>
    new Date(t).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric' })

  return (
    <div>
      {/* Bars are decorative; the caption below is the accessible readout, and it
          doubles as the hover detail so 30 tooltips are not needed. */}
      <div className="relative flex h-16 items-end gap-[3px]" onMouseLeave={() => setHover(null)} aria-hidden>
        {data.map((bucket, i) => {
          const heightPct = (bucket.runs / max) * 100
          const failPct = bucket.runs ? (bucket.failures / bucket.runs) * 100 : 0
          const active = hover === i
          return (
            <Motion.div
              key={bucket.t}
              onMouseEnter={() => setHover(i)}
              className="flex h-full flex-1 cursor-default items-end"
              initial={reduced ? false : { scaleY: 0 }}
              animate={{ scaleY: 1 }}
              style={{ transformOrigin: 'bottom' }}
              transition={reduced ? { duration: 0 } : { duration: 0.45, delay: i * 0.008, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className={`flex w-full flex-col justify-end overflow-hidden rounded-[2px] transition-colors duration-150 ${
                  active ? 'bg-sky-400/60' : 'bg-sky-400/25'
                }`}
                style={{ height: `${Math.max(6, heightPct)}%` }}
              >
                {bucket.failures ? <div className="w-full bg-amber-400/70" style={{ height: `${Math.max(12, failPct)}%` }} /> : null}
              </div>
            </Motion.div>
          )
        })}
      </div>

      <p className="mt-2 min-h-[1rem] text-[10px] text-slate-600" aria-live="polite">
        {point ? (
          <>
            <span className="text-slate-400">{bucketLabel(point.t)}</span>
            {' · '}
            <span className="font-mono text-slate-300">{point.runs}</span> runs
            {point.failures ? (
              <>
                {' · '}
                <span className="font-mono text-amber-400/90">{point.failures}</span> failed
              </>
            ) : null}
          </>
        ) : (
          <>
            <span className="font-mono text-slate-500">{total}</span> runs
            {failures ? (
              <>
                {' · '}
                <span className="font-mono text-amber-400/80">{failures}</span> failed
              </>
            ) : null}
          </>
        )}
      </p>
    </div>
  )
}
