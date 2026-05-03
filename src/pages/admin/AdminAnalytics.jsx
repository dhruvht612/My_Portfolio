import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { eachDayOfInterval, format, startOfDay, subDays } from 'date-fns'
import AnalyticsChart from '../../components/admin/AnalyticsChart'
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

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <NotConfiguredBanner />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)]">Analytics</h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Built from `page_views` + contact volume. Cached ~30s per range.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {RANGE_OPTIONS.map((o) => (
            <button
              key={o.days}
              type="button"
              disabled={!isSupabaseConfigured}
              onClick={() => setDays(o.days)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                days === o.days ? 'bg-[var(--color-accent)] text-[var(--color-bg)]' : 'border border-[var(--color-border)] text-[var(--color-text-muted)]'
              }`}
            >
              {o.label}
            </button>
          ))}
          <button type="button" disabled={!isSupabaseConfigured} onClick={() => void load(true)} className="theme-btn theme-btn-secondary px-3 py-1.5 text-xs">
            Refresh
          </button>
        </div>
      </div>

      {!isSupabaseConfigured ? (
        <EmptyState title="Analytics offline" message="Configure Supabase env vars to load charts." />
      ) : loading && !bundle ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-accent)]/30 border-t-[var(--color-accent)]" />
        </div>
      ) : error ? (
        <EmptyState title="Could not load analytics" message={error.message || 'Check that `page_views` exists and RLS allows authenticated SELECT.'} />
      ) : !bundle ? (
        <EmptyState title="No analytics yet" message="Visit the public site to generate page_views, then refresh." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/40 p-4">
              <p className="text-xs font-medium uppercase text-[var(--color-text-muted)]">Total visits</p>
              <p className="mt-1 text-2xl font-bold text-[var(--color-text)]">{bundle.totalVisits}</p>
              <p className={`mt-1 text-xs ${bundle.deltaPct >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                Δ {bundle.deltaPct >= 0 ? '+' : ''}
                {bundle.deltaPct}% vs prior {rangeLabel}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/40 p-4">
              <p className="text-xs font-medium uppercase text-[var(--color-text-muted)]">Unique visitors</p>
              <p className="mt-1 text-2xl font-bold text-[var(--color-text)]">{bundle.uniqueVisitors}</p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">Prior window: {bundle.prevUniqueVisitors}</p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/40 p-4">
              <p className="text-xs font-medium uppercase text-[var(--color-text-muted)]">Total messages</p>
              <p className="mt-1 text-2xl font-bold text-[var(--color-text)]">{bundle.messagesCount}</p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">All-time inbox count</p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/40 p-4">
              <p className="text-xs font-medium uppercase text-[var(--color-text-muted)]">Avg views / day</p>
              <p className="mt-1 text-2xl font-bold text-[var(--color-text)]">{bundle.avgPerDay.toFixed(1)}</p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">Over selected range</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/30 p-4">
              <h3 className="mb-2 text-sm font-semibold text-[var(--color-text)]">Visits over time</h3>
              <AnalyticsChart kind="line" data={bundle.visitsByDay} dataKey="value" nameKey="name" height={260} />
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/30 p-4">
              <h3 className="mb-2 text-sm font-semibold text-[var(--color-text)]">Top pages</h3>
              <AnalyticsChart kind="bar" data={bundle.topPages} dataKey="value" nameKey="name" height={260} />
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/30 p-4">
              <h3 className="mb-2 text-sm font-semibold text-[var(--color-text)]">Referrers</h3>
              <AnalyticsChart kind="pie" data={bundle.referrers} dataKey="value" nameKey="name" height={260} />
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/30 p-4">
              <h3 className="mb-2 text-sm font-semibold text-[var(--color-text)]">Devices</h3>
              <AnalyticsChart kind="pie" data={bundle.devices} dataKey="value" nameKey="name" height={260} />
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/30 p-4 lg:col-span-2">
              <h3 className="mb-2 text-sm font-semibold text-[var(--color-text)]">Top project clicks</h3>
              {bundle.topProjectClicks.length === 0 ? (
                <p className="text-sm text-[var(--color-text-muted)]">No project CTA clicks in this window.</p>
              ) : (
                <p className="mb-3 text-xs text-[var(--color-text-muted)]">
                  <Link to="/admin/projects" className="text-[var(--color-accent)] hover:underline">
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

      <p className="text-center text-xs text-[var(--color-text-muted)]">
        Privacy: visits store an anonymous `visitor_id` in localStorage only on your domain — no third-party trackers in this dashboard.
      </p>
    </div>
  )
}
