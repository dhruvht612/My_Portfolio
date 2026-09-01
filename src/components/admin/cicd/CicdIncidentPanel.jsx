import { motion as Motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Search } from 'lucide-react'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { CICD_COPY } from '../../../constants/cicdStrings'
import { Skeleton } from './CicdPrimitives'
import { formatRelative } from './statusTokens'

/**
 * Section 9 — the "is anything failing?" answer.
 *
 * Sits high on the page and changes shape entirely rather than colour: a clear
 * system gets a quiet single-line confirmation, an incident gets a bordered
 * panel with the facts and an action. Colour alone would be too easy to miss
 * and unreadable to anyone who cannot distinguish it.
 */
export default function CicdIncidentPanel({ incidents, loading, onInvestigate }) {
  const reduced = useReducedMotion()

  if (loading) return <Skeleton className="h-[4.5rem]" />

  if (!incidents?.length) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.05] px-4 py-3.5 backdrop-blur-xl sm:px-5">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden />
        <div className="min-w-0">
          <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-emerald-300">{CICD_COPY.incidents.clearTitle}</p>
          <p className="mt-0.5 text-xs text-slate-400">{CICD_COPY.incidents.clearBody}</p>
        </div>
      </div>
    )
  }

  const critical = incidents.some((i) => i.severity === 'critical')

  return (
    <Motion.section
      aria-label={CICD_COPY.incidents.attentionTitle}
      initial={reduced ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0 } : { duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={`overflow-hidden rounded-2xl border backdrop-blur-xl ${
        critical ? 'border-rose-400/30 bg-[rgba(46,10,18,0.5)]' : 'border-amber-400/25 bg-[rgba(38,30,10,0.42)]'
      }`}
    >
      <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-4 py-2.5 sm:px-5">
        <AlertTriangle className={`h-4 w-4 shrink-0 ${critical ? 'text-rose-300' : 'text-amber-300'}`} aria-hidden />
        <h2 className={`text-[12px] font-bold uppercase tracking-[0.16em] ${critical ? 'text-rose-200' : 'text-amber-200'}`}>
          {CICD_COPY.incidents.attentionTitle}
        </h2>
        <span className="ml-auto font-mono text-[11px] text-slate-500">
          {incidents.length} open
        </span>
      </div>

      <ul className="divide-y divide-white/[0.05]">
        {incidents.map((incident) => (
          <li key={incident.id} className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-start sm:justify-between sm:px-5">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-100">{incident.title}</p>
              <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-slate-400">{incident.description}</p>

              <dl className="mt-2.5 flex flex-wrap gap-x-6 gap-y-1.5 text-[11px]">
                <div className="flex gap-1.5">
                  <dt className="text-slate-500">{CICD_COPY.incidents.detected}</dt>
                  <dd className="font-mono text-slate-300">{formatRelative(incident.detectedAt)}</dd>
                </div>
                <div className="flex gap-1.5">
                  <dt className="text-slate-500">{CICD_COPY.incidents.affected}</dt>
                  <dd className="font-mono capitalize text-slate-300">{incident.environment}</dd>
                </div>
                <div className="flex gap-1.5">
                  <dt className="text-slate-500">{CICD_COPY.incidents.component}</dt>
                  <dd className="font-mono text-slate-300">{incident.component}</dd>
                </div>
              </dl>
            </div>

            <button
              type="button"
              onClick={() => onInvestigate?.(incident)}
              className={`inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 ${
                critical
                  ? 'border-rose-400/35 bg-rose-500/[0.10] text-rose-100 hover:bg-rose-500/[0.18]'
                  : 'border-amber-400/30 bg-amber-500/[0.10] text-amber-100 hover:bg-amber-500/[0.18]'
              }`}
            >
              <Search className="h-3.5 w-3.5" aria-hidden />
              {CICD_COPY.incidents.investigate}
            </button>
          </li>
        ))}
      </ul>
    </Motion.section>
  )
}
