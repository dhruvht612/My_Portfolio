import { Activity, AlertOctagon, GitMerge, Loader2, TrendingUp } from 'lucide-react'
import { CICD_COPY } from '../../../constants/cicdStrings'
import { CountUp, Skeleton } from './CicdPrimitives'

/**
 * The five-number operational strip.
 *
 * Deliberately quiet: small type, no chart, no colour except where a number
 * demands attention. It sits above the status panel but must not out-shout it,
 * so only a non-zero failure count is allowed to carry alarm colour.
 */
export default function CicdTopMetrics({ summary, loading }) {
  const items = [
    { key: 'pipelines', label: CICD_COPY.metrics.pipelines, value: summary?.pipelines, icon: GitMerge, tone: 'text-slate-200' },
    {
      key: 'running',
      label: CICD_COPY.metrics.running,
      value: summary?.running,
      icon: Loader2,
      tone: 'text-sky-300',
      spin: (summary?.running ?? 0) > 0,
    },
    {
      key: 'failed',
      label: CICD_COPY.metrics.failed,
      value: summary?.failed,
      icon: AlertOctagon,
      tone: (summary?.failed ?? 0) > 0 ? 'text-rose-300' : 'text-slate-200',
      alert: (summary?.failed ?? 0) > 0,
    },
    {
      key: 'success',
      label: CICD_COPY.metrics.successRate,
      value: summary?.buildSuccessPct,
      icon: TrendingUp,
      tone: 'text-emerald-300',
      decimals: 1,
      suffix: '%',
    },
    {
      key: 'uptime',
      label: CICD_COPY.metrics.uptime,
      value: summary?.uptimePct,
      icon: Activity,
      tone: 'text-slate-200',
      decimals: 2,
      suffix: '%',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <div
            key={item.key}
            className={`rounded-xl border bg-[rgba(6,10,18,0.5)] px-3.5 py-3 backdrop-blur-xl transition-colors duration-200 hover:border-white/[0.16] ${
              item.alert ? 'border-rose-400/25' : 'border-white/[0.08]'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
              <Icon className={`h-3.5 w-3.5 shrink-0 ${item.tone} opacity-70 ${item.spin ? 'animate-spin' : ''}`} aria-hidden />
            </div>
            <p className={`mt-1.5 font-mono text-xl font-bold tracking-tight ${item.tone}`}>
              {loading ? (
                <Skeleton className="h-6 w-14" />
              ) : (
                <CountUp value={item.value ?? 0} decimals={item.decimals ?? 0} suffix={item.suffix ?? ''} />
              )}
            </p>
          </div>
        )
      })}
    </div>
  )
}
