import { ArrowUpRight, Cpu } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CICD_COPY } from '../../../constants/cicdStrings'
import { CicdPanel, Meter, Skeleton, Sparkline } from './CicdPrimitives'
import { formatRelative, healthToken } from './statusTokens'

/**
 * Section 7 — infrastructure signals.
 *
 * A deliberate echo of the existing System health page rather than a
 * replacement: this is the delivery-side summary, and the link hands off to the
 * full probe console for anything deeper.
 */
export default function CicdSystemHealth({ metrics, loading }) {
  return (
    <CicdPanel
      title={CICD_COPY.system.title}
      subtitle={CICD_COPY.system.subtitle}
      icon={Cpu}
      actions={
        <Link
          to="/admin/system-health"
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.10] bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 transition-colors duration-200 hover:border-sky-400/35 hover:bg-sky-500/[0.08] hover:text-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
        >
          {CICD_COPY.system.openFull}
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      }
    >
      {loading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[6.5rem]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {metrics?.map((metric) => {
            const token = healthToken(metric.health)
            return (
              <div
                key={metric.id}
                className={`rounded-xl border px-3.5 py-3 transition-colors duration-200 ${
                  metric.health === 'degraded' ? 'border-amber-400/25 bg-amber-500/[0.04]' : 'border-white/[0.07] bg-white/[0.015] hover:border-white/[0.14]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{metric.name}</p>
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${token.dot}`} aria-hidden />
                </div>

                <p className="mt-1.5 font-mono text-lg font-bold tabular-nums text-slate-100">{metric.value}</p>

                {typeof metric.numeric === 'number' ? (
                  <Meter
                    value={metric.numeric}
                    tone={metric.numeric > 85 ? '#fb7185' : metric.numeric > 70 ? '#fbbf24' : token.hex}
                    label={`${metric.name} utilisation`}
                    className="mt-2"
                  />
                ) : (
                  <Sparkline points={metric.history} stroke={token.hex} width={120} height={22} className="mt-1.5 w-full" />
                )}

                <p className="mt-2 text-[10px] text-slate-600">
                  {CICD_COPY.system.checked} {formatRelative(metric.checkedAt)}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </CicdPanel>
  )
}
