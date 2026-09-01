import { PackageOpen, ShieldAlert } from 'lucide-react'
import AdminModal from '../AdminModal'
import { CICD_COPY } from '../../../constants/cicdStrings'
import { EmptyNote, Meter } from './CicdPrimitives'
import { formatCount, formatPct, formatRelative } from './statusTokens'

const SEVERITY = {
  critical: { label: 'Critical', chip: 'border-rose-400/35 bg-rose-500/[0.12] text-rose-200', order: 0 },
  high: { label: 'High', chip: 'border-amber-400/35 bg-amber-500/[0.12] text-amber-200', order: 1 },
  moderate: { label: 'Moderate', chip: 'border-violet-400/30 bg-violet-500/[0.10] text-violet-200', order: 2 },
  low: { label: 'Low', chip: 'border-white/[0.12] bg-white/[0.04] text-slate-300', order: 3 },
}

/**
 * The full security report behind the summary cards.
 *
 * Sorted by severity, and each row states whether the advisory reaches the
 * client bundle — a high-severity finding in a build-time dependency is a very
 * different decision from the same severity in shipped code.
 */
export default function CicdSecurityReport({ scan, open, onClose }) {
  if (!scan) return null

  const advisories = [...(scan.advisories || [])].sort(
    (a, b) => (SEVERITY[a.severity]?.order ?? 9) - (SEVERITY[b.severity]?.order ?? 9),
  )

  return (
    <AdminModal open={open} onClose={onClose} size="xl" title={CICD_COPY.security.viewReport}>
      <div className="flex h-full min-h-0 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <Tile label={CICD_COPY.security.critical} value={scan.vulnerabilities.critical} alert={scan.vulnerabilities.critical > 0} />
            <Tile label={CICD_COPY.security.high} value={scan.vulnerabilities.high} warn={scan.vulnerabilities.high > 0} />
            <Tile label={CICD_COPY.security.moderate} value={scan.vulnerabilities.moderate} />
            <Tile label={CICD_COPY.security.low} value={scan.vulnerabilities.low} />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.015] px-3.5 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{CICD_COPY.security.dependencies}</p>
              <p className="mt-1.5 font-mono text-lg font-bold text-slate-100">{formatCount(scan.dependencies.total)}</p>
              <p className="mt-1 text-[11px] text-slate-500">
                {scan.dependencies.outdated} {CICD_COPY.security.outdated} · {scan.licenseIssues} licence issues
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.015] px-3.5 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{CICD_COPY.security.coverage}</p>
              <p className="mt-1.5 font-mono text-lg font-bold text-slate-100">{formatPct(scan.coveragePct)}</p>
              <Meter value={scan.coveragePct} tone="#38bdf8" label="Test coverage" className="mt-2" />
            </div>
          </div>

          {/* Advisories */}
          <div className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Advisories</h3>
              <span className="font-mono text-[11px] text-slate-600">
                {CICD_COPY.security.scanned} {formatRelative(scan.scannedAt)}
              </span>
            </div>

            {advisories.length === 0 ? (
              <EmptyNote icon={ShieldAlert} title="No open advisories" hint="Every tracked dependency is on a patched release." />
            ) : (
              <ul className="mt-2.5 space-y-2">
                {advisories.map((advisory) => {
                  const severity = SEVERITY[advisory.severity] || SEVERITY.low
                  return (
                    <li key={advisory.id} className="rounded-xl border border-white/[0.07] bg-white/[0.015] px-3.5 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase ${severity.chip}`}>
                          {severity.label}
                        </span>
                        <span className="font-mono text-[12px] font-semibold text-slate-100">
                          {advisory.package}@{advisory.version}
                        </span>
                        <span className="font-mono text-[10px] text-slate-600">{advisory.id}</span>
                        {advisory.shipsToClient ? (
                          <span className="inline-flex items-center gap-1 rounded-md border border-sky-400/25 bg-sky-500/[0.10] px-1.5 py-0.5 text-[10px] font-semibold text-sky-200">
                            <PackageOpen className="h-2.5 w-2.5" aria-hidden />
                            ships to client
                          </span>
                        ) : (
                          <span className="rounded-md border border-white/[0.08] bg-white/[0.02] px-1.5 py-0.5 text-[10px] text-slate-500">
                            build-time only
                          </span>
                        )}
                      </div>

                      <p className="mt-1.5 text-[13px] text-slate-300">{advisory.title}</p>
                      <p className="mt-1 font-mono text-[10px] text-slate-600">{advisory.path}</p>
                      <p className="mt-1.5 text-[11px] text-emerald-300/85">Fixed in {advisory.fixedIn}</p>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <p className="mt-4 border-t border-white/[0.06] pt-3 text-[10px] text-slate-600">
            Scanners: {(scan.scanners || []).join(' · ')}
          </p>
        </div>

        <div className="mt-4 flex justify-end border-t border-white/[0.07] pt-3.5">
          <button type="button" onClick={onClose} className="theme-btn theme-btn-secondary px-4 py-2 text-sm">
            {CICD_COPY.newDeployment.close}
          </button>
        </div>
      </div>
    </AdminModal>
  )
}

function Tile({ label, value, alert, warn }) {
  return (
    <div
      className={`rounded-xl border px-3 py-2.5 ${
        alert ? 'border-rose-400/25 bg-rose-500/[0.06]' : warn ? 'border-amber-400/25 bg-amber-500/[0.05]' : 'border-white/[0.07] bg-white/[0.015]'
      }`}
    >
      <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={`mt-1 font-mono text-xl font-bold ${alert ? 'text-rose-300' : warn ? 'text-amber-300' : 'text-slate-100'}`}>{value}</p>
    </div>
  )
}
