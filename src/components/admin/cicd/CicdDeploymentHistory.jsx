import { History, RotateCcw, ScrollText, SearchX } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CICD_COPY, DEPLOYMENT_FILTERS } from '../../../constants/cicdStrings'
import { CicdPanel, CopyChip, EmptyNote, Skeleton, StatusPill } from './CicdPrimitives'
import { formatDuration, formatRelative } from './statusTokens'

/**
 * Section 4 — every release, filterable.
 *
 * A real table from `md` up and a card list below it: at phone widths eight
 * columns cannot be read, and horizontal scrolling a table is worse than
 * restacking it. Both layouts drive the same handlers.
 *
 * Rows are clickable for convenience, but the keyboard path is the version
 * button inside each row — that keeps one tab stop per row instead of two and
 * avoids putting a `role="button"` on a `<tr>`.
 */
export default function CicdDeploymentHistory({ deployments, loading, search, onSelect, onViewLogs, onRollback }) {
  const [filter, setFilter] = useState('all')

  const rows = useMemo(() => {
    let list = deployments || []

    if (filter === 'successful') list = list.filter((d) => d.status === 'passed')
    else if (filter === 'failed') list = list.filter((d) => d.status === 'failed')
    else if (filter !== 'all') list = list.filter((d) => d.environment === filter)

    const q = search?.trim().toLowerCase()
    if (q) {
      list = list.filter((d) =>
        [d.version, d.commit, d.branch, d.author, d.environment, d.commitMessage, `#${d.number}`]
          .join(' ')
          .toLowerCase()
          .includes(q),
      )
    }
    return list
  }, [deployments, filter, search])

  return (
    <CicdPanel
      title={CICD_COPY.deployments.title}
      subtitle={CICD_COPY.deployments.subtitle}
      icon={History}
      bodyClassName=""
      actions={
        <div role="group" aria-label="Filter deployments" className="flex flex-wrap gap-1.5">
          {DEPLOYMENT_FILTERS.map((option) => {
            const active = filter === option.value
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(option.value)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 ${
                  active
                    ? 'bg-sky-500/20 text-sky-200 ring-1 ring-sky-400/30'
                    : 'border border-white/[0.08] text-slate-500 hover:border-white/[0.16] hover:text-slate-300'
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      }
    >
      {loading ? (
        <div className="space-y-2 p-4 sm:p-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-11" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyNote icon={SearchX} title={CICD_COPY.deployments.empty} hint={CICD_COPY.deployments.emptyHint} />
      ) : (
        <>
          {/* Table — md and up */}
          <div className="hidden md:block">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">{CICD_COPY.deployments.title}</caption>
              <thead>
                <tr className="border-b border-white/[0.07]">
                  {Object.values(CICD_COPY.deployments.columns).map((label, i) => (
                    <th
                      key={label}
                      scope="col"
                      className={`px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 ${
                        i >= 5 ? 'text-right' : ''
                      }`}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => (
                  <tr
                    key={d.id}
                    onClick={() => onSelect(d)}
                    className="cursor-pointer border-b border-white/[0.04] transition-colors duration-150 last:border-0 hover:bg-white/[0.035]"
                  >
                    <td className="px-4 py-2.5">
                      <StatusPill status={d.status} size="sm" />
                    </td>
                    <td className="px-4 py-2.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelect(d)
                        }}
                        className="rounded font-mono text-[13px] font-semibold text-slate-100 transition-colors hover:text-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
                      >
                        {d.version}
                      </button>
                      <span className="ml-2 font-mono text-[11px] text-slate-600">#{d.number}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <EnvChip environment={d.environment} />
                    </td>
                    <td className="px-4 py-2.5">
                      <CopyChip value={d.commit} />
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-slate-400">{d.author}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-[12px] tabular-nums text-slate-400">
                      {formatDuration(d.durationSec)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right text-[12px] text-slate-500">{formatRelative(d.startedAt)}</td>
                    <td className="px-4 py-2.5">
                      <RowActions deployment={d} onSelect={onSelect} onViewLogs={onViewLogs} onRollback={onRollback} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards — below md */}
          <ul className="divide-y divide-white/[0.05] md:hidden">
            {rows.map((d) => (
              <li key={d.id}>
                <div className="px-4 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => onSelect(d)}
                      className="min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
                    >
                      <span className="block font-mono text-sm font-semibold text-slate-100">{d.version}</span>
                      <span className="mt-0.5 block truncate text-[11px] text-slate-500">{d.commitMessage}</span>
                    </button>
                    <StatusPill status={d.status} size="sm" />
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-slate-500">
                    <EnvChip environment={d.environment} />
                    <CopyChip value={d.commit} />
                    <span>{d.author}</span>
                    <span className="font-mono">{formatDuration(d.durationSec)}</span>
                    <span>{formatRelative(d.startedAt)}</span>
                  </div>

                  <div className="mt-2.5">
                    <RowActions deployment={d} onSelect={onSelect} onViewLogs={onViewLogs} onRollback={onRollback} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </CicdPanel>
  )
}

/** Environment tag. Production reads warmer so it stands out in a scan. */
function EnvChip({ environment }) {
  const styles = {
    production: 'border-sky-400/25 bg-sky-500/[0.10] text-sky-200',
    staging: 'border-violet-400/25 bg-violet-500/[0.10] text-violet-200',
    development: 'border-white/[0.10] bg-white/[0.03] text-slate-400',
  }
  const label = environment.charAt(0).toUpperCase() + environment.slice(1)
  return (
    <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${styles[environment] || styles.development}`}>
      {label}
    </span>
  )
}

function RowActions({ deployment, onSelect, onViewLogs, onRollback }) {
  const base =
    'rounded-md border border-white/[0.08] bg-white/[0.02] px-2 py-1 text-[11px] font-semibold text-slate-400 transition-colors duration-200 hover:border-white/[0.18] hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50'

  const stop = (fn) => (event) => {
    event.stopPropagation()
    fn()
  }

  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      <button type="button" onClick={stop(() => onSelect(deployment))} className={base}>
        {CICD_COPY.deployments.view}
      </button>
      <button
        type="button"
        onClick={stop(() => onViewLogs(deployment))}
        className={base}
        aria-label={`${CICD_COPY.deployments.logs} for ${deployment.version}`}
      >
        <ScrollText className="mr-1 inline h-3 w-3" aria-hidden />
        {CICD_COPY.deployments.logs}
      </button>
      <button
        type="button"
        disabled={!deployment.rollbackAvailable}
        onClick={stop(() => onRollback(deployment))}
        title={deployment.rollbackAvailable ? undefined : 'No previous release available to roll back to'}
        className={`${base} disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:border-amber-400/35 enabled:hover:text-amber-200`}
      >
        <RotateCcw className="mr-1 inline h-3 w-3" aria-hidden />
        {CICD_COPY.deployments.rollback}
      </button>
    </div>
  )
}
