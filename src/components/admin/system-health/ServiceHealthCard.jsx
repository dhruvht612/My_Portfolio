import { motion } from 'framer-motion'
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

export default function ServiceHealthCard({ title, description, icon: Icon, result, uptimePct, loading }) {
  const { status, latencyMs, error, checkedAt } = result
  const tone = toneByStatus[status] || 'gray'
  const badgeLabel = labelByStatus[status] || status

  return (
    <motion.article
      initial={false}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0b0f17]/85 p-5 shadow-[0_4px_24px_rgba(0,0,0,0.35)] ring-1 ring-inset ring-white/[0.04] duration-300 hover:border-sky-500/25 hover:shadow-[0_12px_40px_rgba(56,189,248,0.08)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(56,189,248,0.06),transparent_55%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {Icon ? (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-sky-300/90">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
          ) : null}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold tracking-tight text-slate-100">{title}</h3>
            {description ? <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{description}</p> : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <StatusBadge tone={tone}>{badgeLabel}</StatusBadge>
          {status === 'operational' ? (
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/40 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
          ) : null}
        </div>
      </div>

      <div className="relative mt-5">
        {loading ? (
          <div className="space-y-2">
            <div className="h-9 w-28 animate-pulse rounded-lg bg-white/[0.06]" />
            <div className="h-3 w-40 animate-pulse rounded bg-white/[0.05]" />
          </div>
        ) : (
          <>
            {status === 'not_configured' ? (
              <p className="text-sm text-slate-500">No endpoint configured. Set <code className="text-[11px] text-sky-300/80">VITE_API_URL</code> to probe an API.</p>
            ) : (
              <>
                <p className="font-mono text-3xl font-bold tabular-nums tracking-tight text-slate-50">
                  {latencyMs != null ? `${latencyMs}` : '—'}
                  <span className="ml-1 text-base font-semibold text-slate-500">ms</span>
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Last checked{' '}
                  {checkedAt
                    ? new Date(checkedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                    : '—'}
                </p>
                {uptimePct != null ? (
                  <p className="mt-2 text-xs font-medium text-slate-400">
                    Uptime <span className="text-sky-300/90">{uptimePct}%</span> <span className="text-slate-600">(recent checks)</span>
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-slate-600">Uptime — (collecting samples)</p>
                )}
                {error && status === 'down' ? <p className="mt-2 line-clamp-2 text-xs text-red-300/90">{error}</p> : null}
              </>
            )}
          </>
        )}
      </div>
    </motion.article>
  )
}
