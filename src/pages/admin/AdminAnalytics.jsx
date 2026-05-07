import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { eachDayOfInterval, format, startOfDay, subDays } from 'date-fns'
import { motion as Motion } from 'framer-motion'
import { Activity, ArrowUpRight, Bot, Clock3, Gauge, Globe, MousePointerClick, RefreshCw, Sparkles, TrendingUp, Users } from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
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
const PIE_COLORS = ['#38bdf8', '#6366f1', '#14b8a6', '#f59e0b', '#a855f7', '#f43f5e']

function AnimatedNumber({ value, suffix = '', precision = 0 }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const safeValue = Number.isFinite(value) ? value : 0
    const start = performance.now()
    const from = display
    const dur = 850
    let raf = 0

    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur)
      const eased = 1 - (1 - t) ** 3
      setDisplay(from + (safeValue - from) * eased)
      if (t < 1) raf = window.requestAnimationFrame(tick)
    }

    raf = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <span className="tabular-nums">
      {display.toLocaleString(undefined, {
        maximumFractionDigits: precision,
        minimumFractionDigits: precision,
      })}
      {suffix}
    </span>
  )
}

function StatCard({ title, value, suffix, precision, delta, tone = 'sky', data }) {
  const up = delta >= 0
  const stroke = tone === 'violet' ? '#8b5cf6' : tone === 'emerald' ? '#10b981' : '#38bdf8'
  return (
    <Motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      className="admin-card-premium relative overflow-hidden p-5"
    >
      <div className={`pointer-events-none absolute inset-0 opacity-40 ${tone === 'violet' ? 'bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.28),transparent_62%)]' : tone === 'emerald' ? 'bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.26),transparent_62%)]' : 'bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.25),transparent_62%)]'}`} />
      <p className="relative text-[11px] font-semibold uppercase tracking-wider text-slate-400">{title}</p>
      <p className="relative mt-1 text-2xl font-bold text-slate-50">
        <AnimatedNumber value={value} suffix={suffix} precision={precision} />
      </p>
      <p className={`relative mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${up ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>
        <TrendingUp className={`h-3 w-3 ${up ? '' : 'rotate-180'}`} /> {up ? '+' : ''}
        {delta}% vs prior
      </p>
      <div className="relative mt-3 h-11">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`spark-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity={0.45} />
                <stop offset="100%" stopColor={stroke} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <Area dataKey="value" type="monotone" stroke={stroke} strokeWidth={2} fill={`url(#spark-${title})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Motion.div>
  )
}

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
  const [metricView, setMetricView] = useState('visits')
  const [deviceFilter, setDeviceFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const cacheRef = useRef(new Map())

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

        let views = viewsRes.data || []
        const prevViews = prevRes.data || []
        if (deviceFilter !== 'all') views = views.filter((v) => (v.device_type || 'unknown') === deviceFilter)
        if (sourceFilter !== 'all') views = views.filter((v) => bucketReferrer(v.referrer) === sourceFilter)

        const visitors = new Set(views.map((v) => v.visitor_id).filter(Boolean))
        const prevVisitors = new Set(prevViews.map((v) => v.visitor_id).filter(Boolean))

        const dayKeys = eachDayOfInterval({ start, end })
        const visitsByDay = dayKeys.map((d, idx) => {
          const key = format(d, 'yyyy-MM-dd')
          const dayRows = views.filter((v) => v.viewed_at && format(new Date(v.viewed_at), 'yyyy-MM-dd') === key)
          const unique = new Set(dayRows.map((r) => r.visitor_id).filter(Boolean)).size
          const clicks = dayRows.filter((r) => Boolean(r.project_clicked)).length
          return { name: format(d, 'MMM d'), value: dayRows.length, unique, clicks, idx }
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
        const visitorsWithOne = Array.from(visitors).filter((id) => views.filter((v) => v.visitor_id === id).length === 1).length
        const bounceRate = visitors.size > 0 ? Math.round((visitorsWithOne / visitors.size) * 100) : 0
        const projectClicksTotal = [...projClicks.values()].reduce((a, b) => a + b, 0)
        const ctr = totalVisits > 0 ? Number(((projectClicksTotal / totalVisits) * 100).toFixed(1)) : 0
        const estimatedSessionSec = visitors.size > 0 ? Math.round((totalVisits / visitors.size) * 72) : 0
        const conversion = visitors.size > 0 ? Number(((messagesCount / visitors.size) * 100).toFixed(1)) : 0
        const engagementScore = Math.max(0, Math.min(100, Math.round(100 - bounceRate * 0.55 + ctr * 2.2 + deltaPct * 0.2)))
        const nowMinus5m = Date.now() - 5 * 60 * 1000
        const liveVisitors = new Set(
          views.filter((v) => v.viewed_at && new Date(v.viewed_at).getTime() >= nowMinus5m).map((v) => v.visitor_id).filter(Boolean),
        ).size
        const latestEvents = views
          .slice()
          .sort((a, b) => new Date(b.viewed_at || 0) - new Date(a.viewed_at || 0))
          .slice(0, 12)
          .map((v, i) => ({
            id: `${v.visitor_id || 'anon'}-${v.viewed_at || i}`,
            at: v.viewed_at,
            path: v.path || '/',
            device: v.device_type || 'unknown',
            source: bucketReferrer(v.referrer),
            clicked: Boolean(v.project_clicked),
          }))

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
          ctr,
          bounceRate,
          conversion,
          engagementScore,
          estimatedSessionSec,
          liveVisitors,
          latestEvents,
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
    [days, deviceFilter, sourceFilter],
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
  const metricOptions = [
    { label: 'Visits', value: 'visits' },
    { label: 'Unique', value: 'unique' },
    { label: 'Clicks', value: 'clicks' },
  ]
  const deviceOptions = useMemo(
    () => [{ value: 'all', label: 'All devices' }, ...(bundle?.devices || []).map((d) => ({ value: d.name, label: d.name }))],
    [bundle?.devices],
  )
  const sourceOptions = useMemo(
    () => [{ value: 'all', label: 'All sources' }, ...(bundle?.referrers || []).map((r) => ({ value: r.name, label: r.name }))],
    [bundle?.referrers],
  )
  const heroInsight = useMemo(() => {
    if (!bundle) return 'Analytics engine warming up.'
    const topPage = bundle.topPages?.[0]?.name || '/'
    const topDevice = bundle.devices?.slice().sort((a, b) => b.value - a.value)[0]?.name || 'desktop'
    return `Traffic ${bundle.deltaPct >= 0 ? 'accelerated' : 'cooled'} ${Math.abs(bundle.deltaPct)}% this window. ${topPage} leads activity, and ${topDevice} sessions dominate right now.`
  }, [bundle])
  const aiInsights = useMemo(() => {
    if (!bundle) return []
    const topRef = bundle.referrers?.slice().sort((a, b) => b.value - a.value)[0]
    const topProject = bundle.topProjectClicks?.[0]
    return [
      `Engagement signal is ${bundle.engagementScore}/100 with bounce at ${bundle.bounceRate}%.`,
      topRef ? `Most traffic arrives via ${topRef.name}; double down with focused campaign links.` : 'Direct traffic dominates; adding campaign UTM tags can sharpen attribution.',
      topProject ? `"${topProject.name}" is the highest click-through project this range.` : 'No project click spikes detected yet; refresh featured project ordering.',
      `Predicted next-window momentum: ${bundle.deltaPct >= 0 ? 'continued growth' : 'stabilization'} based on current trend velocity.`,
    ]
  }, [bundle])
  const series = useMemo(() => {
    if (!bundle?.visitsByDay) return []
    return bundle.visitsByDay.map((row) => ({
      ...row,
      metric: metricView === 'unique' ? row.unique : metricView === 'clicks' ? row.clicks : row.value,
    }))
  }, [bundle?.visitsByDay, metricView])

  return (
    <div className="dash-ambient-root relative mx-auto max-w-7xl space-y-6 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="dash-ambient-grid absolute inset-0 opacity-70" />
        <div className="dash-ambient-noise absolute inset-0 opacity-[0.09]" />
        <div className="dash-ambient-scan absolute inset-0 opacity-[0.08]" />
        <div className="absolute -left-20 top-16 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-fuchsia-500/15 blur-3xl" />
      </div>
      <NotConfiguredBanner />
      <AdminPageHeader
        eyebrow="Intelligence"
        title="Analytics Command Center"
        description={heroInsight}
      >
        <div className="flex flex-wrap items-center gap-2">
          <AdminSegmentedControl
            options={rangeOptions}
            value={days}
            onChange={(v) => setDays(Number(v))}
            disabled={!isSupabaseConfigured}
          />
          <AdminSegmentedControl options={metricOptions} value={metricView} onChange={setMetricView} disabled={!isSupabaseConfigured} />
          <select
            value={deviceFilter}
            onChange={(e) => setDeviceFilter(e.target.value)}
            className="admin-field-input rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-200"
          >
            {deviceOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="admin-field-input rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-200"
          >
            {sourceOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!isSupabaseConfigured}
            onClick={() => void load(true)}
            className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/[0.08] hover:text-slate-100 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </AdminPageHeader>

      {!isSupabaseConfigured ? (
        <EmptyState title="Analytics offline" message="Configure Supabase env vars to load charts." />
      ) : loading && !bundle ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((k) => (
            <div key={k} className="admin-card-premium animate-pulse p-5">
              <div className="h-3 w-28 rounded bg-slate-600/40" />
              <div className="mt-3 h-8 w-24 rounded bg-slate-500/30" />
              <div className="mt-4 h-10 rounded bg-slate-700/30" />
            </div>
          ))}
        </div>
      ) : error ? (
        <EmptyState title="Could not load analytics" message={error.message || 'Check that `page_views` exists and RLS allows authenticated SELECT.'} />
      ) : !bundle ? (
        <EmptyState title="No analytics yet" message="Visit the public site to generate page_views, then refresh." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard title="Total visits" value={bundle.totalVisits} delta={bundle.deltaPct} data={bundle.visitsByDay} />
            <StatCard title="Unique visitors" value={bundle.uniqueVisitors} delta={bundle.deltaPct} data={bundle.visitsByDay.map((d) => ({ ...d, value: d.unique }))} tone="violet" />
            <StatCard title="Engagement score" value={bundle.engagementScore} suffix="/100" delta={bundle.deltaPct} data={bundle.visitsByDay.map((d) => ({ ...d, value: d.clicks }))} tone="emerald" />
            <StatCard title="Avg session" value={bundle.estimatedSessionSec / 60} suffix="m" precision={1} delta={bundle.deltaPct} data={bundle.visitsByDay} />
            <Motion.div whileHover={{ y: -3 }} className="admin-card-premium flex flex-col justify-between p-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Realtime signal</p>
                <p className="mt-1 text-2xl font-bold text-slate-50">
                  <AnimatedNumber value={bundle.liveVisitors} />
                </p>
                <p className="mt-1 inline-flex items-center gap-2 text-xs text-emerald-300">
                  <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
                  Visitors active in last 5 min
                </p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2">CTR {bundle.ctr}%</div>
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2">Bounce {bundle.bounceRate}%</div>
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2">Conv. {bundle.conversion}%</div>
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2">Avg/day {bundle.avgPerDay.toFixed(1)}</div>
              </div>
            </Motion.div>
          </div>

          <div className="grid gap-6 xl:grid-cols-12">
            <div className="admin-card-premium p-5 xl:col-span-8">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-100">
                <Activity className="h-4 w-4 text-sky-300" /> Timeline intelligence
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series}>
                    <defs>
                      <linearGradient id="analytics-main-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(148,163,184,0.18)" strokeDasharray="4 5" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#020617ee', border: '1px solid rgba(148,163,184,0.25)', borderRadius: 12 }} />
                    <Area dataKey="metric" type="monotone" stroke="#38bdf8" strokeWidth={2.4} fill="url(#analytics-main-grad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="admin-card-premium p-5 xl:col-span-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-100">
                <Bot className="h-4 w-4 text-fuchsia-300" /> AI analytics copilot
              </h3>
              <div className="space-y-2.5">
                {aiInsights.map((insight, idx) => (
                  <Motion.div key={insight} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}>
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs text-slate-300">
                      <span className="mr-2 text-fuchsia-300">●</span>
                      {insight}
                    </div>
                  </Motion.div>
                ))}
              </div>
              <button type="button" onClick={() => void load(true)} className="mt-4 inline-flex items-center gap-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1.5 text-xs font-semibold text-fuchsia-200 hover:bg-fuchsia-500/20">
                <Sparkles className="h-3.5 w-3.5" /> Regenerate insight pass
              </button>
            </div>

            <div className="admin-card-premium p-5 xl:col-span-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-100">
                <Globe className="h-4 w-4 text-cyan-300" /> Traffic sources
              </h3>
              <div className="h-[230px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={bundle.referrers} dataKey="value" nameKey="name" innerRadius={46} outerRadius={88} paddingAngle={3}>
                      {bundle.referrers.map((_, i) => (
                        <Cell key={`ref-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#020617ee', border: '1px solid rgba(148,163,184,0.25)', borderRadius: 12 }} />
                    <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="admin-card-premium p-5 xl:col-span-7">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-100">
                <Gauge className="h-4 w-4 text-indigo-300" /> Top content intelligence
              </h3>
              <div className="h-[230px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={bundle.topPages}>
                    <CartesianGrid stroke="rgba(148,163,184,0.12)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={132} tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#020617ee', border: '1px solid rgba(148,163,184,0.25)', borderRadius: 12 }} />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]} fill="#38bdf8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="admin-card-premium p-4 xl:col-span-6">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-100">
                <MousePointerClick className="h-4 w-4 text-emerald-300" /> Project click intelligence
              </h3>
              {bundle.topProjectClicks.length === 0 ? (
                <p className="text-sm text-slate-400">No project CTA clicks in this window.</p>
              ) : (
                <p className="mb-3 text-xs text-slate-400">
                  <Link to="/admin/projects" className="text-sky-400 hover:text-sky-300 hover:underline">
                    Open projects admin
                  </Link>{' '}
                  to tune conversion surfaces.
                </p>
              )}
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={bundle.topProjectClicks}>
                    <CartesianGrid stroke="rgba(148,163,184,0.12)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={130} tick={{ fill: '#cbd5e1', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#020617ee', border: '1px solid rgba(148,163,184,0.25)', borderRadius: 12 }} />
                    <Bar dataKey="value" fill="#10b981" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="admin-card-premium p-4 xl:col-span-6">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-100">
                <Users className="h-4 w-4 text-violet-300" /> Device intelligence
              </h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {bundle.devices.map((d, i) => {
                  const pct = bundle.totalVisits ? Math.round((d.value / bundle.totalVisits) * 100) : 0
                  return (
                    <div key={`${d.name}-${i}`} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span className="capitalize">{d.name}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                        <Motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7 }} className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="admin-card-premium p-4 xl:col-span-12">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-100">
                <Clock3 className="h-4 w-4 text-amber-300" /> Live activity stream
              </h3>
              <div className="obs-terminal-scan relative max-h-72 overflow-auto rounded-xl border border-white/10 bg-slate-950/40 p-3">
                <div className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
                {bundle.latestEvents.length === 0 ? (
                  <p className="text-sm text-slate-400">No recent live activity yet.</p>
                ) : (
                  <div className="space-y-2">
                    {bundle.latestEvents.map((event) => (
                      <Motion.div key={event.id} layout className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs">
                        <div className="flex items-center gap-2 text-slate-200">
                          <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
                          <span className="font-medium">{event.path}</span>
                          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-300">{event.source}</span>
                          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-300">{event.device}</span>
                          {event.clicked ? <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-emerald-300">project click</span> : null}
                        </div>
                        <span className="text-slate-400">{event.at ? format(new Date(event.at), 'HH:mm:ss') : '--:--:--'}</span>
                      </Motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="admin-card-premium mt-1 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-slate-400">
                Analytics OS status: live ingestion and heuristic AI scoring are active. Data refreshes every 60 seconds while this tab is visible.
              </p>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                <ArrowUpRight className="h-3 w-3" /> Intelligence online
              </span>
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
