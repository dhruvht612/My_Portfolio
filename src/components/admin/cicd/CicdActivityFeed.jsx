import {
  AlertTriangle,
  FlaskConical,
  Hammer,
  Package,
  Radio,
  RotateCcw,
  Rocket,
  ShieldCheck,
} from 'lucide-react'
import { CICD_COPY } from '../../../constants/cicdStrings'
import { CicdPanel, EmptyNote, Skeleton } from './CicdPrimitives'
import { formatRelative, TONE } from './statusTokens'

/** Icon per event kind — keeps the feed scannable without reading every line. */
const KIND_ICON = {
  deployment: Rocket,
  build: Hammer,
  security: ShieldCheck,
  test: FlaskConical,
  dependency: Package,
  rollback: RotateCcw,
  incident: AlertTriangle,
}

/**
 * Section 8 — the chronological record.
 *
 * Scrolls inside a fixed height so the feed cannot push the rest of the page
 * down as it grows. A rail connects the markers so the eye reads it as one
 * timeline rather than a stack of separate rows.
 */
export default function CicdActivityFeed({ events, loading }) {
  return (
    <CicdPanel title={CICD_COPY.activity.title} subtitle={CICD_COPY.activity.subtitle} icon={Radio} bodyClassName="">
      {loading ? (
        <div className="space-y-3 p-4 sm:p-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      ) : !events?.length ? (
        <EmptyNote icon={Radio} title={CICD_COPY.activity.empty} />
      ) : (
        <ol className="relative max-h-[26rem] overflow-y-auto px-4 py-3 sm:px-5">
          {/* Continuous rail behind the markers. */}
          <span className="pointer-events-none absolute bottom-3 left-[1.4rem] top-3 w-px bg-white/[0.06] sm:left-[1.9rem]" aria-hidden />

          {events.map((event) => {
            const Icon = KIND_ICON[event.kind] || Radio
            const tone = TONE[event.tone] || TONE.info
            return (
              <li key={event.id} className="relative flex gap-3 py-2.5">
                <span
                  className={`relative z-[1] mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-[rgba(6,10,18,0.95)] ring-1 ${tone.ring}`}
                >
                  <Icon className={`h-3 w-3 ${tone.text}`} aria-hidden />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                    <p className="text-[13px] font-medium text-slate-200">{event.title}</p>
                    <time dateTime={event.at} className="shrink-0 font-mono text-[10px] text-slate-600">
                      {formatRelative(event.at)}
                    </time>
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-slate-500">{event.detail}</p>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </CicdPanel>
  )
}
