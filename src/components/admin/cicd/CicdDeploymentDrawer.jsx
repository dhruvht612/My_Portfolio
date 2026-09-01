import { FileDiff, RotateCcw, ScrollText, ShieldCheck, TestTube2 } from 'lucide-react'
import AdminModal from '../AdminModal'
import { CICD_COPY } from '../../../constants/cicdStrings'
import { CopyChip, StatusPill } from './CicdPrimitives'
import { formatClock, formatCount, formatDuration, statusToken } from './statusTokens'

/**
 * Right-side detail drawer for a single deployment.
 *
 * Ordered by what someone asks in an incident: what shipped, from which commit,
 * how the pipeline behaved, then what can be done about it. Actions sit in a
 * pinned footer so Rollback is reachable without scrolling past the evidence.
 */
export default function CicdDeploymentDrawer({ deployment, open, onClose, onViewLogs, onRetry, onRollback }) {
  if (!deployment) return null

  const facts = [
    { label: CICD_COPY.drawer.version, value: deployment.version, mono: true },
    { label: CICD_COPY.drawer.branch, value: deployment.branch, mono: true },
    { label: CICD_COPY.drawer.author, value: deployment.author },
    { label: CICD_COPY.drawer.started, value: formatClock(deployment.startedAt) },
    { label: CICD_COPY.drawer.duration, value: formatDuration(deployment.durationSec), mono: true },
  ]

  const stats = [
    { icon: FileDiff, label: CICD_COPY.drawer.filesChanged, value: formatCount(deployment.filesChanged) },
    { icon: TestTube2, label: CICD_COPY.drawer.tests, value: `${formatCount(deployment.testsPassed)} ${CICD_COPY.drawer.testsPassed}` },
    {
      icon: ShieldCheck,
      label: CICD_COPY.drawer.security,
      value: `${deployment.criticalVulns} ${CICD_COPY.drawer.criticalVulns}`,
      alert: deployment.criticalVulns > 0,
    },
  ]

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      variant="drawer"
      size="lg"
      title={`${CICD_COPY.drawer.title} #${deployment.number}`}
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {/* Verdict */}
          <div className="flex flex-wrap items-center gap-2.5">
            <StatusPill status={deployment.status} />
            <span className="inline-flex items-center rounded-md border border-sky-400/25 bg-sky-500/[0.10] px-2 py-0.5 text-[11px] font-semibold capitalize text-sky-200">
              {deployment.environment}
            </span>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-slate-300">{deployment.commitMessage}</p>

          {/* Facts */}
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 border-t border-white/[0.06] pt-4">
            {facts.map((fact) => (
              <div key={fact.label} className="min-w-0">
                <dt className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{fact.label}</dt>
                <dd className={`mt-0.5 truncate text-[13px] text-slate-200 ${fact.mono ? 'font-mono' : ''}`}>{fact.value}</dd>
              </div>
            ))}
            <div className="min-w-0">
              <dt className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{CICD_COPY.drawer.commit}</dt>
              <dd className="mt-0.5">
                <CopyChip value={deployment.commit} />
              </dd>
            </div>
          </dl>

          {/* Pipeline */}
          <div className="mt-5 border-t border-white/[0.06] pt-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{CICD_COPY.drawer.pipeline}</p>
            <ul className="mt-2.5 space-y-1.5">
              {deployment.stages?.map((stage) => {
                const token = statusToken(stage.status)
                const Icon = token.icon
                return (
                  <li
                    key={stage.id}
                    className="flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.015] px-2.5 py-1.5"
                  >
                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded ${token.bg} ${token.text}`}>
                      <Icon className="h-2.5 w-2.5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[12px] text-slate-200">{stage.name}</span>
                    <span className="shrink-0 font-mono text-[11px] text-slate-500">{formatDuration(stage.durationSec)}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Stats */}
          <div className="mt-5 grid grid-cols-3 gap-2.5 border-t border-white/[0.06] pt-4">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className={`rounded-lg border px-2.5 py-2 ${stat.alert ? 'border-rose-400/25 bg-rose-500/[0.06]' : 'border-white/[0.07] bg-white/[0.015]'}`}
                >
                  <Icon className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                  <p className="mt-1.5 truncate text-[10px] uppercase tracking-[0.1em] text-slate-500">{stat.label}</p>
                  <p className={`mt-0.5 truncate font-mono text-[12px] font-semibold ${stat.alert ? 'text-rose-300' : 'text-slate-100'}`}>
                    {stat.value}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Pinned actions */}
        <div className="mt-4 flex flex-wrap gap-2 border-t border-white/[0.07] pt-3.5">
          <button
            type="button"
            onClick={() => onViewLogs(deployment)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.10] bg-white/[0.03] px-3 py-2 text-[12px] font-semibold text-slate-200 transition-colors duration-200 hover:border-sky-400/35 hover:bg-sky-500/[0.08] hover:text-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
          >
            <ScrollText className="h-3.5 w-3.5" aria-hidden />
            {CICD_COPY.drawer.viewLogs}
          </button>

          <button
            type="button"
            onClick={() => onRetry(deployment)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.10] bg-white/[0.03] px-3 py-2 text-[12px] font-semibold text-slate-200 transition-colors duration-200 hover:border-white/[0.2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            {CICD_COPY.drawer.retry}
          </button>

          <button
            type="button"
            disabled={!deployment.rollbackAvailable}
            onClick={() => onRollback(deployment)}
            title={deployment.rollbackAvailable ? undefined : 'No previous release available to roll back to'}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-500/[0.10] px-3 py-2 text-[12px] font-semibold text-amber-100 transition-colors duration-200 hover:bg-amber-500/[0.18] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            {CICD_COPY.drawer.rollback}
          </button>
        </div>
      </div>
    </AdminModal>
  )
}
