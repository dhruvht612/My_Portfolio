import { AnimatePresence, motion as Motion } from 'framer-motion'
import { ExternalLink, Layers, Server } from 'lucide-react'
import { useState } from 'react'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { CICD_COPY } from '../../../constants/cicdStrings'
import { CicdPanel, CopyChip, Skeleton, Sparkline } from './CicdPrimitives'
import { formatPct, formatRelative, healthToken } from './statusTokens'

/**
 * Section 3 — what is actually running where.
 *
 * Each card is a disclosure: the collapsed face answers "healthy, which
 * version, how long ago", and expanding adds the operational detail an on-call
 * engineer needs before touching anything.
 */
export default function CicdEnvironments({ environments, loading, scope = 'all' }) {
  const [openId, setOpenId] = useState(null)

  const visible = scope === 'all' ? environments : environments?.filter((env) => env.id === scope)

  return (
    <CicdPanel title={CICD_COPY.environments.title} subtitle={CICD_COPY.environments.subtitle} icon={Layers}>
      {loading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[9.5rem]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visible?.map((env) => (
            <EnvironmentCard key={env.id} env={env} open={openId === env.id} onToggle={() => setOpenId((p) => (p === env.id ? null : env.id))} />
          ))}
        </div>
      )}
    </CicdPanel>
  )
}

function EnvironmentCard({ env, open, onToggle }) {
  const reduced = useReducedMotion()
  const token = healthToken(env.health)

  return (
    <div
      className={`overflow-hidden rounded-xl border transition-colors duration-200 ${
        open ? `${token.border} bg-[rgba(2,6,16,0.62)]` : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.16]'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full px-4 py-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-400/50"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{env.name}</p>
            <p className={`mt-1.5 flex items-center gap-1.5 text-sm font-semibold ${token.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${token.dot}`} aria-hidden />
              {token.label}
            </p>
          </div>
          <Sparkline points={env.latencyHistory} stroke={token.hex} width={64} height={26} />
        </div>

        <dl className="mt-3 space-y-1">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-[11px] text-slate-500">{CICD_COPY.environments.version}</dt>
            <dd className="truncate font-mono text-[12px] font-semibold text-slate-200">{env.version}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-[11px] text-slate-500">{CICD_COPY.environments.deployed}</dt>
            <dd className="truncate text-[12px] text-slate-400">{formatRelative(env.deployedAt)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-[11px] text-slate-500">{CICD_COPY.environments.uptime}</dt>
            <dd className="font-mono text-[12px] tabular-nums text-slate-300">{formatPct(env.uptimePct, 2)}</dd>
          </div>
        </dl>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <Motion.div
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-2.5 border-t border-white/[0.07] px-4 py-3.5">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                <Metric label={CICD_COPY.environments.responseTime} value={`${env.responseTimeMs} ms`} />
                <Metric label={CICD_COPY.environments.errorRate} value={formatPct(env.errorRatePct, 2)} tone={env.errorRatePct > 0.5 ? 'text-amber-300' : undefined} />
                <Metric label={CICD_COPY.environments.throughput} value={`${env.requestsPerMin.toLocaleString()} rpm`} />
                <Metric label={CICD_COPY.environments.region} value={env.region} />
                <Metric label={CICD_COPY.environments.branch} value={env.branch} />
                <div className="min-w-0">
                  <dt className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{CICD_COPY.environments.commit}</dt>
                  <dd className="mt-0.5">
                    <CopyChip value={env.commit} />
                  </dd>
                </div>
              </dl>

              <a
                href={`https://${env.url}`}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-sky-300 transition-colors hover:text-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
              >
                <Server className="h-3 w-3" aria-hidden />
                {env.url}
                <ExternalLink className="h-3 w-3 opacity-60" aria-hidden />
              </a>
            </div>
          </Motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function Metric({ label, value, tone }) {
  return (
    <div className="min-w-0">
      <dt className="truncate text-[10px] uppercase tracking-[0.12em] text-slate-500">{label}</dt>
      <dd className={`mt-0.5 truncate font-mono text-[12px] ${tone || 'text-slate-200'}`}>{value}</dd>
    </div>
  )
}
