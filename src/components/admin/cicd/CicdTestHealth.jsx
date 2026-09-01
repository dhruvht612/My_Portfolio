import { AnimatePresence, motion as Motion } from 'framer-motion'
import { FlaskConical, Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { CICD_COPY } from '../../../constants/cicdStrings'
import { CicdPanel, Meter, Skeleton } from './CicdPrimitives'
import { formatCount, formatDuration, formatPct } from './statusTokens'

/**
 * Section 5 — suite pass rates.
 *
 * The meter is the primary read; the counts underneath are the audit trail.
 * A suite with failures expands to name them, because "8 failed" without the
 * names is a number the reader can do nothing with.
 */
export default function CicdTestHealth({ suites, loading }) {
  const [openId, setOpenId] = useState(null)

  return (
    <CicdPanel title={CICD_COPY.tests.title} subtitle={CICD_COPY.tests.subtitle} icon={FlaskConical}>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : (
        <ul className="space-y-2.5">
          {suites?.map((suite) => (
            <SuiteRow key={suite.id} suite={suite} open={openId === suite.id} onToggle={() => setOpenId((p) => (p === suite.id ? null : suite.id))} />
          ))}
        </ul>
      )}
    </CicdPanel>
  )
}

function SuiteRow({ suite, open, onToggle }) {
  const reduced = useReducedMotion()
  const failed = suite.total - suite.passed
  const pct = suite.total ? (suite.passed / suite.total) * 100 : 0

  // Colour follows the failure count, not the percentage: 99.4% sounds fine but
  // still means eight broken tests, so anything non-zero gets amber.
  const tone = failed === 0 ? '#34d399' : pct >= 97 ? '#fbbf24' : '#fb7185'
  const hasDetail = suite.failures?.length > 0

  return (
    <li className={`overflow-hidden rounded-xl border transition-colors duration-200 ${open ? 'border-white/[0.14] bg-[rgba(2,6,16,0.5)]' : 'border-white/[0.07] bg-white/[0.015] hover:border-white/[0.13]'}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        disabled={!hasDetail}
        className="w-full px-3.5 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-400/50 disabled:cursor-default"
      >
        <div className="flex items-baseline justify-between gap-3">
          <span className="truncate text-[13px] font-semibold text-slate-100">{suite.name}</span>
          <span className="flex shrink-0 items-baseline gap-2">
            <Trend value={suite.trendPct} />
            <span className="font-mono text-[13px] font-bold tabular-nums" style={{ color: tone }}>
              {formatPct(pct)}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-slate-600">{CICD_COPY.tests.pass}</span>
          </span>
        </div>

        <Meter value={suite.passed} max={suite.total} tone={tone} label={`${suite.name} pass rate`} className="mt-2.5" />

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <span className="font-mono text-slate-500">
            {formatCount(suite.passed)} / {formatCount(suite.total)} {CICD_COPY.tests.passed}
          </span>
          <span className="flex items-center gap-2.5">
            {failed > 0 ? (
              <span className="font-semibold text-amber-300">
                {failed} {CICD_COPY.tests.failed}
              </span>
            ) : null}
            <span className="font-mono text-slate-600">{formatDuration(suite.durationSec)}</span>
          </span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && hasDetail ? (
          <Motion.div
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/[0.06] px-3.5 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{CICD_COPY.tests.failureHeading}</p>
              <ul className="mt-2 space-y-2">
                {suite.failures.map((failure) => (
                  <li key={failure.name} className="border-l-2 border-rose-400/35 pl-2.5">
                    <p className="font-mono text-[11px] text-slate-200">{failure.name}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-rose-300/80">{failure.error}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  )
}

/** Signed change vs the previous run. Flat renders as a dash, not a fake zero-trend arrow. */
function Trend({ value }) {
  if (!value) {
    return (
      <span className="inline-flex items-center text-slate-600" title="No change since the previous run">
        <Minus className="h-3 w-3" aria-hidden />
        <span className="sr-only">No change</span>
      </span>
    )
  }
  const up = value > 0
  const Icon = up ? TrendingUp : TrendingDown
  return (
    <span
      className={`inline-flex items-center gap-0.5 font-mono text-[10px] ${up ? 'text-emerald-400/80' : 'text-amber-400/80'}`}
      title={`${up ? 'Up' : 'Down'} ${Math.abs(value)} points since the previous run`}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {Math.abs(value)}
    </span>
  )
}
