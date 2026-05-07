import { AnimatePresence, motion as Motion } from 'framer-motion'
import {
  Award,
  Briefcase,
  ChevronDown,
  FileText,
  FolderGit2,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'

const tableMeta = {
  projects: { label: 'Project', Icon: FolderGit2, rail: 'bg-sky-400', chip: 'border-sky-400/35 text-sky-200/95' },
  blog_posts: { label: 'Blog', Icon: FileText, rail: 'bg-emerald-400', chip: 'border-emerald-400/35 text-emerald-200/95' },
  certifications: { label: 'Certification', Icon: Award, rail: 'bg-violet-400', chip: 'border-violet-400/35 text-violet-200/95' },
  experiences: { label: 'Experience', Icon: Briefcase, rail: 'bg-fuchsia-400', chip: 'border-fuchsia-400/35 text-fuchsia-200/95' },
  skills: { label: 'Skill', Icon: Sparkles, rail: 'bg-amber-400', chip: 'border-amber-400/35 text-amber-200/95' },
}

function isToday(iso) {
  if (!iso) return false
  const d = new Date(iso)
  const t = new Date()
  return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear()
}

/** @param {string | null | undefined} iso */
function formatRelative(iso) {
  if (!iso) return ''
  const then = new Date(iso).getTime()
  const now = Date.now()
  let sec = Math.round((now - then) / 1000)
  if (sec < 0) sec = 0
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  if (sec < 60) return rtf.format(-sec, 'second')
  const min = Math.floor(sec / 60)
  if (min < 60) return rtf.format(-min, 'minute')
  const hr = Math.floor(min / 60)
  if (hr < 24) return rtf.format(-hr, 'hour')
  const day = Math.floor(hr / 24)
  if (day < 7) return rtf.format(-day, 'day')
  const week = Math.floor(day / 7)
  if (week < 5) return rtf.format(-week, 'week')
  const month = Math.floor(day / 30)
  if (month < 12) return rtf.format(-month, 'month')
  const year = Math.floor(day / 365)
  return rtf.format(-year, 'year')
}

/** @param {{ row: object, expanded: boolean, onToggle: () => void }} props */
function ActivityRow({ row, expanded, onToggle }) {
  const meta = tableMeta[row.table] || { label: row.table, Icon: FileText, rail: 'bg-slate-400', chip: 'border-white/25 text-slate-200' }
  const { Icon } = meta
  const rel = formatRelative(row.updated_at)

  return (
    <li className="relative pl-10">
      <span className={`absolute left-2 top-[1.125rem] h-4 w-[3px] rounded-full ${meta.rail} shadow-[0_0_12px_currentColor]`} aria-hidden />

      <button
        type="button"
        onClick={onToggle}
        className={`dash-timeline-entry group w-full rounded-2xl border border-white/[0.07] bg-[rgba(4,11,22,0.6)] px-4 py-4 text-left shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur-md ring-1 ring-inset ring-white/[0.04] transition hover:border-sky-400/28 hover:bg-[rgba(5,13,26,0.72)]`}
        aria-expanded={expanded}
      >
        <div className="flex gap-4">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.09] to-white/[0.02] ring-1 ring-white/[0.05]`}>
            <Icon className="h-5 w-5 text-slate-200" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="truncate font-semibold text-slate-100">{row.label}</p>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${meta.chip}`}>
                Open
                <Motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.22 }}>
                  <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                </Motion.span>
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-md border border-white/10 bg-black/35 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {meta.label}
              </span>
              {row.updated_at ? (
                <time className="text-[11px] font-semibold tabular-nums text-slate-600" dateTime={row.updated_at} title={new Date(row.updated_at).toLocaleString()}>
                  {rel}
                </time>
              ) : null}
            </div>
            <AnimatePresence initial={false}>
              {expanded ? (
                <Motion.div
                  key="expand"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 rounded-xl border border-white/[0.06] bg-black/35 px-4 py-3 font-mono text-[11px] leading-relaxed text-slate-500">
                    <p>
                      table=<span className="text-slate-400">{row.table}</span> · id=<span className="text-sky-300/90">{String(row.id).slice(0, 12)}…</span>
                    </p>
                    <p className="mt-2 text-slate-600">
                      This feed streams the freshest row touched per workspace table for fast operational awareness — open the relevant admin screen for full fidelity.
                    </p>
                  </div>
                </Motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </button>
    </li>
  )
}

function ActivityTimelineSection({ title, rows, headingId, openId, setOpenId }) {
  return (
    <section aria-labelledby={headingId} className="relative">
      <h3 id={headingId} className="sticky top-0 z-10 mb-4 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.26em] text-slate-500 backdrop-blur-sm">
        {title}
      </h3>
      <div className="relative px-6 pb-2">
        <div className="absolute left-[23px] top-0 hidden h-[calc(100%-8px)] border-l border-dashed border-white/[0.10] md:block" aria-hidden />
        <ul className="relative space-y-5">
          {rows.map((row) => (
            <ActivityRow
              key={`${row.table}-${row.id}`}
              row={row}
              expanded={openId === `${row.table}:${row.id}`}
              onToggle={() => setOpenId((prev) => (prev === `${row.table}:${row.id}` ? null : `${row.table}:${row.id}`))}
            />
          ))}
        </ul>
      </div>
    </section>
  )
}

/**
 * @param {{ activity: { id: string, table: string, label: string, updated_at: string | null }[], loading?: boolean, configured?: boolean }} props
 */
export default function DashboardActivityFeed({ activity, loading = false, configured = true }) {
  const [openId, setOpenId] = useState(() => /** @type {string | null} */ (null))

  if (!configured) {
    return <p className="px-1 py-6 text-sm text-slate-500">Connect Supabase to stream activity.</p>
  }

  if (loading) {
    return (
      <ul className="relative space-y-4 pl-6 before:absolute before:left-[10px] before:top-2 before:h-[calc(100%-16px)] before:border-l before:border-white/[0.08]" aria-busy="true">
        {[1, 2, 3, 4].map((k) => (
          <li key={k} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-4">
            <div className="flex gap-4">
              <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-white/[0.08]" />
              <div className="flex-1 space-y-3">
                <div className="h-4 max-w-[60%] animate-pulse rounded bg-white/[0.08]" />
                <div className="h-3 w-36 animate-pulse rounded bg-white/[0.05]" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    )
  }

  if (!activity.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/[0.08] bg-black/20 px-6 py-10 text-center">
        <p className="font-mono text-xs text-slate-500">No kinetic events yet · edits will synchronize here instantly.</p>
      </div>
    )
  }

  const today = []
  const earlier = []
  for (const row of activity) {
    if (isToday(row.updated_at)) today.push(row)
    else earlier.push(row)
  }

  return (
    <div className="pb-12">
      <div className="border-b border-white/[0.08] px-8 py-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-400/85">Pulse stream</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-50">Realtime operational ledger</h2>
        <p className="mt-2 max-w-xl text-sm text-slate-500">Surface-level intelligence from your Supabase workspaces — expandable for trace metadata.</p>
      </div>
      {today.length ? (
        <ActivityTimelineSection
          title="Transmitting · today"
          rows={today}
          headingId="pulse-today"
          openId={openId}
          setOpenId={setOpenId}
        />
      ) : null}
      {earlier.length ? (
        <ActivityTimelineSection
          title={today.length ? 'Earlier signals' : 'Recent signals'}
          rows={earlier}
          headingId="pulse-earlier"
          openId={openId}
          setOpenId={setOpenId}
        />
      ) : null}
    </div>
  )
}
