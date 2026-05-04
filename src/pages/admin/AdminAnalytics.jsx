import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { eachDayOfInterval, format, startOfDay, subDays } from 'date-fns'
import AnalyticsChart from '../../components/admin/AnalyticsChart'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminSegmentedControl from '../../components/admin/AdminSegmentedControl'
import EmptyState from '../../components/admin/EmptyState'
import NotConfiguredBanner from '../../components/admin/NotConfiguredBanner'
import { countTable, ensureClient, listTable } from '../../lib/admin/queries'
import { isSupabaseConfigured } from '../../lib/supabase'

const RANGE_OPTIONS = [
  { label: '7d', days: 7 },
  { label: '14d', days: 14 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
]

function bucketReferrer(raw) {
  const s = (raw || 'direct').toLowerCase()
  if (!s || s === 'direct') return 'direct'
  if (s.includes('linkedin')) return 'linkedin'
  if (s.includes('github')) return 'github'
  if (s.includes('google')) return 'google'
  try {
    const u = s.startsWith('http') ? new URL(s) : new URL(`https://${s}`)
    const h = u.hostname.replace(/^www\./, '')
    if (!h) return 'direct'
    if (h.includes('linkedin')) return 'linkedin'
    if (h.includes('github')) return 'github'
    if (h.includes('google')) return 'google'
    return 'other'
  } catch {
    return 'other'
  }
}

export default function AdminAnalytics() {
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [bundle, setBundle] = useState(null)
  const cacheRef = useRef(new Map())

  const rangeLabel = useMemo(() => RANGE_OPTIONS.find((o) => o.days === days)?.label || `${days}d`, [days])

  const load = useCallback(
    async (force) => {
      if (!isSupabaseConfigured) {
        setBundle(null)
        setError(null)
        return
      }
      const cacheKey = String(days)
      const now = Date.now()
      if (!force) {
        const hit = cacheRef.current.get(cacheKey)
        if (hit && now - hit.t < 30000) {
          setBundle(hit.data)
          return
        }
      }
      setLoading(true)
      setError(null)
      try {
        const end = startOfDay(new Date())
        const start = startOfDay(subDays(end, days - 1))
        const prevEnd = startOfDay(subDays(start, 1))
        const prevStart = startOfDay(subDays(prevEnd, days - 1))

        const iso = (d) => d.toISOString()
        const c = ensureClient()

        const [viewsRes, prevRes, messagesCount, projects] = await Promise.all([
          c
            .from('page_views')
            .select('visitor_id, path, referrer, device_type, project_clicked, viewed_at')
            .gte('viewed_at', iso(start))
            .lte('viewed_at', iso(end)),
          c
            .from('page_views')
            .select('visitor_id, path, referrer, device_type, project_clicked, viewed_at')
            .gte('viewed_at', iso(prevStart))
            .lte('viewed_at', iso(prevEnd)),
          countTable('contact_submissions'),
          listTable('projects', { column: 'title', ascending: true }),
        ])

        if (viewsRes.error) throw viewsRes.error
        if (prevRes.error) throw prevRes.error

        const views = viewsRes.data || []
        const prevViews = prevRes.data || []

        const visitors = new Set(views.map((v) => v.visitor_id).filter(Boolean))
        const prevVisitors = new Set(prevViews.map((v) => v.visitor_id).filter(Boolean))

        const dayKeys = eachDayOfInterval({ start, end })
        const visitsByDay = dayKeys.map((d) => {
          const key = format(d, 'yyyy-MM-dd')
          const count = views.filter((v) => v.viewed_at && format(new Date(v.viewed_at), 'yyyy-MM-dd') === key).length
          return { name: format(d, 'MMM d'), value: count }
        })

        const pathCount = new Map()
        for (const v of views) {
          const p = v.path || '/'
          pathCount.set(p, (pathCount.get(p) || 0) + 1)
        }
        const topPages = [...pathCount.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([name, value]) => ({ name, value }))

        const refCount = new Map()
        for (const v of views) {
          const b = bucketReferrer(v.referrer)
          refCount.set(b, (refCount.get(b) || 0) + 1)
        }
        const referrers = [...refCount.entries()].map(([name, value]) => ({ name, value }))

        const devCount = new Map()
        for (const v of views) {
          const d = v.device_type || 'unknown'
          devCount.set(d, (devCount.get(d) || 0) + 1)
        }
        const devices = [...devCount.entries()].map(([name, value]) => ({ name, value }))

        const projClicks = new Map()
        for (const v of views) {
          if (!v.project_clicked) continue
          projClicks.set(v.project_clicked, (projClicks.get(v.project_clicked) || 0) + 1)
        }
        const titleById = new Map(projects.map((p) => [p.id, p.title]))
        const topProjectClicks = [...projClicks.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([id, value]) => ({ name: titleById.get(id) || id.slice(0, 8), value, id }))

        const totalVisits = views.length
        const prevTotal = prevViews.length
        const deltaPct = prevTotal > 0 ? Math.round(((totalVisits - prevTotal) / prevTotal) * 100) : totalVisits > 0 ? 100 : 0

        const avgPerDay = days > 0 ? totalVisits / days : 0

        const data = {
          totalVisits,
          deltaPct,
          uniqueVisitors: visitors.size,
          prevUniqueVisitors: prevVisitors.size,
          messagesCount,
          avgPerDay,
          visitsByDay,
          topPages,
          referrers,
          devices,
          topProjectClicks,
        }
        cacheRef.current.set(cacheKey, { t: Date.now(), data })
        setBundle(data)
      } catch (e) {
        setError(e)
        setBundle(null)
      } finally {
        setLoading(false)
      }
    },
    [days],
  )

  useEffect(() => {
    void load(false)
  }, [load])

  useEffect(() => {
    if (!isSupabaseConfigured) return
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load(true)
    }, 60000)
    return () => window.clearInterval(id)
  }, [load])

  const rangeOptions = RANGE_OPTIONS.map((o) => ({ value: o.days, label: o.label }))

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <NotConfiguredBanner />
      <AdminPageHeader
        eyebrow="Traffic"
        title="Analytics"
        description="Built from page_views plus contact volume. Each range is cached about 30 seconds."
      >
        <div className="flex flex-wrap items-center gap-2">
          <AdminSegmentedControl
            options={rangeOptions}
            value={days}
            onChange={(v) => setDays(Number(v))}
            disabled={!isSupabaseConfigured}
          />
          <button
            type="button"
            disabled={!isSupabaseConfigured}
            onClick={() => void load(true)}
            className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/[0.08] hover:text-slate-100 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </AdminPageHeader>

      {!isSupabaseConfigured ? (
        <EmptyState title="Analytics offline" message="Configure Supabase env vars to load charts." />
      ) : loading && !bundle ? (
        <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-white/[0.06] bg-slate-950/40">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-400/30 border-t-sky-400" />
        </div>
      ) : error ? (
        <EmptyState title="Could not load analytics" message={error.message || 'Check that `page_views` exists and RLS allows authenticated SELECT.'} />
      ) : !bundle ? (
        <EmptyState title="No analytics yet" message="Visit the public site to generate page_views, then refresh." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.05] to-white/[0.018] p-5 shadow-lg shadow-black/25 ring-1 ring-inset ring-white/[0.03]">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total visits</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-slate-50">{bundle.totalVisits}</p>
              <p className={`mt-1 text-xs ${bundle.deltaPct >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                Δ {bundle.deltaPct >= 0 ? '+' : ''}
                {bundle.deltaPct}% vs prior {rangeLabel}
              </p>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.05] to-white/[0.018] p-5 shadow-lg shadow-black/25 ring-1 ring-inset ring-white/[0.03]">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Unique visitors</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-slate-50">{bundle.uniqueVisitors}</p>
              <p className="mt-1 text-xs text-slate-500">Prior window: {bundle.prevUniqueVisitors}</p>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.05] to-white/[0.018] p-5 shadow-lg shadow-black/25 ring-1 ring-inset ring-white/[0.03]">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total messages</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-slate-50">{bundle.messagesCount}</p>
              <p className="mt-1 text-xs text-slate-500">All-time inbox count</p>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.05] to-white/[0.018] p-5 shadow-lg shadow-black/25 ring-1 ring-inset ring-white/[0.03]">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Avg views / day</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-slate-50">{bundle.avgPerDay.toFixed(1)}</p>
              <p className="mt-1 text-xs text-slate-500">Over selected range</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.035] to-white/[0.012] p-5 shadow-lg shadow-black/25 ring-1 ring-inset ring-white/[0.03]">
              <h3 className="mb-3 text-sm font-semibold text-slate-100">Visits over time</h3>
              <AnalyticsChart kind="line" data={bundle.visitsByDay} dataKey="value" nameKey="name" height={260} />
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.035] to-white/[0.012] p-5 shadow-lg shadow-black/25 ring-1 ring-inset ring-white/[0.03]">
              <h3 className="mb-3 text-sm font-semibold text-slate-100">Top pages</h3>
              <AnalyticsChart kind="bar" data={bundle.topPages} dataKey="value" nameKey="name" height={260} />
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.035] to-white/[0.012] p-5 shadow-lg shadow-black/25 ring-1 ring-inset ring-white/[0.03]">
              <h3 className="mb-3 text-sm font-semibold text-slate-100">Referrers</h3>
              <AnalyticsChart kind="pie" data={bundle.referrers} dataKey="value" nameKey="name" height={260} />
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.035] to-white/[0.012] p-5 shadow-lg shadow-black/25 ring-1 ring-inset ring-white/[0.03]">
              <h3 className="mb-3 text-sm font-semibold text-slate-100">Devices</h3>
              <AnalyticsChart kind="pie" data={bundle.devices} dataKey="value" nameKey="name" height={260} />
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.035] to-white/[0.012] p-4 shadow-lg shadow-black/25 ring-1 ring-inset ring-white/[0.03] lg:col-span-2">
              <h3 className="mb-2 text-sm font-semibold text-slate-100">Top project clicks</h3>
              {bundle.topProjectClicks.length === 0 ? (
                <p className="text-sm text-slate-400">No project CTA clicks in this window.</p>
              ) : (
                <p className="mb-3 text-xs text-slate-400">
                  <Link to="/admin/projects" className="text-sky-400 hover:text-sky-300 hover:underline">
                    Open projects admin
                  </Link>{' '}
                  to edit cards.
                </p>
              )}
              <AnalyticsChart kind="bar" data={bundle.topProjectClicks} dataKey="value" nameKey="name" height={220} />
            </div>
          </div>
        </>
      )}

      <p className="text-center text-xs text-slate-500">
        Privacy: visits store an anonymous `visitor_id` in localStorage only on your domain — no third-party trackers in this dashboard.
      </p>
    </div>
  )
}
