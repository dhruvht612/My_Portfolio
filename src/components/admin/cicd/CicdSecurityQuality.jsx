import { Boxes, FileCheck2, Gauge, ShieldAlert, Wrench } from 'lucide-react'
import { CICD_COPY } from '../../../constants/cicdStrings'
import { CicdPanel, CountUp, Meter, Skeleton, StatusDot } from './CicdPrimitives'
import { formatCount, formatRelative } from './statusTokens'

/**
 * Section 6 — supply chain and code quality gates.
 *
 * Severity is expressed by position and colour on the vulnerability card only.
 * The other four cards stay neutral: making all five shout would flatten the
 * hierarchy and hide the one number that actually gates a release.
 */
export default function CicdSecurityQuality({ scan, loading, onViewReport }) {
  if (loading) {
    return (
      <CicdPanel title={CICD_COPY.security.title} subtitle={CICD_COPY.security.subtitle} icon={ShieldAlert}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[7.5rem]" />
          ))}
        </div>
      </CicdPanel>
    )
  }

  const v = scan?.vulnerabilities || { critical: 0, high: 0, moderate: 0, low: 0 }
  const deps = scan?.dependencies || { total: 0, outdated: 0, critical: 0, moderate: 0 }
  const depsHealthy = deps.critical === 0

  return (
    <CicdPanel
      title={CICD_COPY.security.title}
      subtitle={CICD_COPY.security.subtitle}
      icon={ShieldAlert}
      actions={
        <button
          type="button"
          onClick={onViewReport}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.10] bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 transition-colors duration-200 hover:border-sky-400/35 hover:bg-sky-500/[0.08] hover:text-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
        >
          <FileCheck2 className="h-3.5 w-3.5" aria-hidden />
          {CICD_COPY.security.viewReport}
        </button>
      }
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {/* Dependencies */}
        <Card icon={Boxes} label={CICD_COPY.security.dependencies}>
          <p className={`flex items-center gap-1.5 text-sm font-semibold ${depsHealthy ? 'text-emerald-300' : 'text-amber-300'}`}>
            <StatusDot status={depsHealthy ? 'passed' : 'warning'} />
            {depsHealthy ? 'Healthy' : 'Review'}
          </p>
          <dl className="mt-2 space-y-0.5 text-[11px]">
            <Line label={CICD_COPY.security.critical} value={deps.critical} tone={deps.critical ? 'text-rose-300' : 'text-slate-400'} />
            <Line label={CICD_COPY.security.moderate} value={deps.moderate} tone={deps.moderate ? 'text-amber-300' : 'text-slate-400'} />
          </dl>
          <p className="mt-2 text-[10px] text-slate-600">
            {formatCount(deps.total)} {CICD_COPY.security.tracked} · {deps.outdated} {CICD_COPY.security.outdated}
          </p>
        </Card>

        {/* Vulnerabilities */}
        <Card icon={ShieldAlert} label={CICD_COPY.security.vulnerabilities} accent={v.critical > 0}>
          <dl className="space-y-1">
            <Severity label={CICD_COPY.security.critical} value={v.critical} status={v.critical ? 'failed' : 'passed'} />
            <Severity label={CICD_COPY.security.high} value={v.high} status={v.high ? 'warning' : 'passed'} />
            <Severity label={CICD_COPY.security.moderate} value={v.moderate} status={v.moderate ? 'warning' : 'passed'} />
            <Severity label={CICD_COPY.security.low} value={v.low} status="queued" />
          </dl>
        </Card>

        {/* Code quality */}
        <Card icon={Gauge} label={CICD_COPY.security.codeQuality}>
          <p className="font-mono text-3xl font-bold leading-none text-emerald-300">{scan?.codeQualityGrade || '—'}</p>
          <p className="mt-2 text-[10px] text-slate-600">Maintainability index</p>
        </Card>

        {/* Technical debt */}
        <Card icon={Wrench} label={CICD_COPY.security.technicalDebt}>
          <p
            className={`text-lg font-bold ${
              scan?.technicalDebt === 'High' ? 'text-rose-300' : scan?.technicalDebt === 'Moderate' ? 'text-amber-300' : 'text-emerald-300'
            }`}
          >
            {scan?.technicalDebt || '—'}
          </p>
          <p className="mt-2 text-[10px] text-slate-600">{scan?.licenseIssues === 0 ? 'No licence conflicts' : `${scan?.licenseIssues} licence issues`}</p>
        </Card>

        {/* Coverage */}
        <Card icon={FileCheck2} label={CICD_COPY.security.coverage}>
          <p className="font-mono text-2xl font-bold leading-none text-slate-100">
            <CountUp value={scan?.coveragePct ?? 0} decimals={1} suffix="%" />
          </p>
          <Meter value={scan?.coveragePct ?? 0} tone="#38bdf8" label="Test coverage" className="mt-2.5" />
          <p className="mt-2 text-[10px] text-slate-600">
            {CICD_COPY.security.scanned} {formatRelative(scan?.scannedAt)}
          </p>
        </Card>
      </div>
    </CicdPanel>
  )
}

function Card({ icon: Icon, label, children, accent = false }) {
  return (
    <div
      className={`rounded-xl border px-3.5 py-3 transition-colors duration-200 ${
        accent ? 'border-rose-400/25 bg-rose-500/[0.05]' : 'border-white/[0.07] bg-white/[0.015] hover:border-white/[0.14]'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
        <Icon className="h-3.5 w-3.5 shrink-0 text-slate-600" aria-hidden />
      </div>
      <div className="mt-2.5">{children}</div>
    </div>
  )
}

function Line({ label, value, tone }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="text-slate-500">{label}</dt>
      <dd className={`font-mono tabular-nums ${tone}`}>{value}</dd>
    </div>
  )
}

function Severity({ label, value, status }) {
  return (
    <div className="flex items-center justify-between gap-2 text-[11px]">
      <dt className="flex items-center gap-1.5 text-slate-400">
        <StatusDot status={status} />
        {label}
      </dt>
      <dd className={`font-mono font-semibold tabular-nums ${value ? 'text-slate-100' : 'text-slate-600'}`}>{value}</dd>
    </div>
  )
}
