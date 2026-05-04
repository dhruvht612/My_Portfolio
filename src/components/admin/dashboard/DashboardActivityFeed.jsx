import { Award, Briefcase, FileText, FolderGit2, Sparkles } from 'lucide-react'

const tableMeta = {
  projects: { label: 'Project', Icon: FolderGit2 },
  blog_posts: { label: 'Blog', Icon: FileText },
  certifications: { label: 'Certification', Icon: Award },
  experiences: { label: 'Experience', Icon: Briefcase },
  skills: { label: 'Skill', Icon: Sparkles },
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

function ActivityRow({ row }) {
  const meta = tableMeta[row.table] || { label: row.table, Icon: FileText }
  const { Icon } = meta
  const rel = formatRelative(row.updated_at)

  return (
    <li
      className="rounded-xl border border-transparent transition-colors duration-200 ease-out hover:border-white/[0.06] hover:bg-white/[0.04]"
    >
      <div className="flex gap-3 px-3 py-3.5 sm:gap-4 sm:px-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] ring-1 ring-white/10">
          <Icon className="h-5 w-5 text-slate-300" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-slate-100">{row.label}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-md border border-white/10 bg-black/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {meta.label}
            </span>
            {row.updated_at ? (
              <time
                className="text-[11px] font-medium tabular-nums text-slate-500"
                dateTime={row.updated_at}
                title={new Date(row.updated_at).toLocaleString()}
              >
                {rel}
              </time>
            ) : null}
          </div>
        </div>
      </div>
    </li>
  )
}

/**
 * @param {{ activity: { id: string, table: string, label: string, updated_at: string | null }[], loading?: boolean, configured?: boolean }} props
 */
export default function DashboardActivityFeed({ activity, loading = false, configured = true }) {
  if (!configured) {
    return (
      <p className="px-1 py-6 text-sm text-slate-500">Connect Supabase to see activity.</p>
    )
  }

  if (loading) {
    return (
      <ul className="space-y-2 px-1 py-2" aria-busy="true" aria-label="Loading activity">
        {[1, 2, 3, 4].map((k) => (
          <li key={k} className="flex gap-4 rounded-xl px-4 py-4">
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-white/10" />
            <div className="flex-1 space-y-2 pt-0.5">
              <div className="h-4 max-w-xs flex-1 animate-pulse rounded bg-white/10" />
              <div className="h-3 w-24 animate-pulse rounded bg-white/[0.06]" />
            </div>
          </li>
        ))}
      </ul>
    )
  }

  if (!activity.length) {
    return <p className="px-1 py-6 text-sm text-slate-500">No recent updates found.</p>
  }

  const today = []
  const earlier = []
  for (const row of activity) {
    if (isToday(row.updated_at)) today.push(row)
    else earlier.push(row)
  }

  return (
    <div className="px-1 py-2">
      {today.length ? (
        <section className="mb-6" aria-labelledby="activity-today">
          <h3 id="activity-today" className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Today
          </h3>
          <ul className="space-y-1">
            {today.map((row) => (
              <ActivityRow key={`${row.table}-${row.id}`} row={row} />
            ))}
          </ul>
        </section>
      ) : null}
      {earlier.length ? (
        <section aria-labelledby="activity-earlier">
          <h3 id="activity-earlier" className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            {today.length ? 'Earlier' : 'Recent'}
          </h3>
          <ul className="space-y-1">
            {earlier.map((row) => (
              <ActivityRow key={`${row.table}-${row.id}`} row={row} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
