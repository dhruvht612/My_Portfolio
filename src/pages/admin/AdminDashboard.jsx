import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ADMIN_PRIMARY_CLASS } from '../../components/admin/AdminPrimaryButton'
import DashboardAmbient from '../../components/admin/dashboard/DashboardAmbient'
import DashboardActivityFeed from '../../components/admin/dashboard/DashboardActivityFeed'
import DashboardAnimatedNumber from '../../components/admin/dashboard/DashboardAnimatedNumber'
import DashboardCommandHero from '../../components/admin/dashboard/DashboardCommandHero'
import DashboardPortfolioIntel from '../../components/admin/dashboard/DashboardPortfolioIntel'
import DashboardProductivityStrip from '../../components/admin/dashboard/DashboardProductivityStrip'
import { DashboardReorderGroup, DashboardReorderItem } from '../../components/admin/dashboard/DashboardReorderSections'
import DashboardQuickDock from '../../components/admin/dashboard/DashboardQuickDock'
import DashboardStatCard from '../../components/admin/dashboard/DashboardStatCard'
import NotConfiguredBanner from '../../components/admin/NotConfiguredBanner'
import { useAuth } from '../../hooks/useAuth'
import {
  countBlogByStatus,
  countRecentUpdatesSince,
  countTable,
  fetchPageViewsDailyBuckets,
  fetchProjectTechFrequency,
  fetchRecentActivity,
  fetchTopPagePaths,
} from '../../lib/admin/queries'
import { isSupabaseConfigured } from '../../lib/supabase'

const SECTION_KEY = 'admin.dashboard.section_order'
const DEFAULT_SECTIONS = ['metrics', 'intel', 'activity', 'productivity']

function readSectionOrder() {
  if (typeof window === 'undefined') return [...DEFAULT_SECTIONS]
  try {
    const raw = window.localStorage.getItem(SECTION_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    if (!Array.isArray(parsed) || parsed.length !== DEFAULT_SECTIONS.length) return [...DEFAULT_SECTIONS]
    if (!DEFAULT_SECTIONS.every((id) => parsed.includes(id))) return [...DEFAULT_SECTIONS]
    return parsed
  } catch {
    return [...DEFAULT_SECTIONS]
  }
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n))
}

function firstNameFromSession(session) {
  const raw = session?.user?.user_metadata?.full_name
  if (typeof raw === 'string' && raw.trim()) return raw.trim().split(/\s+/)[0]
  const email = session?.user?.email
  if (typeof email === 'string' && email.includes('@')) return email.split('@')[0]
  return 'there'
}

function letterGrade(score) {
  if (score >= 93) return 'S'
  if (score >= 88) return 'A+'
  if (score >= 82) return 'A'
  if (score >= 76) return 'A-'
  if (score >= 70) return 'B+'
  if (score >= 62) return 'B'
  return 'B-'
}

export default function AdminDashboard() {
  const { session } = useAuth()

  const [stats, setStats] = useState({
    projects: null,
    certs: null,
    skills: null,
    experiences: null,
    blog: null,
    unread: null,
  })
  const [traffic, setTraffic] = useState([])
  const [trafficMeta, setTrafficMeta] = useState({ error: null })
  const [topPaths, setTopPaths] = useState([])
  const [techTags, setTechTags] = useState([])
  const [updates48h, setUpdates48h] = useState(null)
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)

  const [sectionOrder, setSectionOrder] = useState(readSectionOrder)

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(SECTION_KEY, JSON.stringify(sectionOrder))
  }, [sectionOrder])

  useEffect(() => {
    let cancelled = false

    async function ingest() {
      if (!isSupabaseConfigured) {
        setLoading(false)
        setTraffic([])
        setActivity([])
        return
      }

      setLoading(true)
      const iso48 = new Date(Date.now() - 48 * 3600 * 1000).toISOString()

      try {
        const [projects, certs, skills, experiences, blog, unread, recent, buckets, tp, freq, churn] =
          await Promise.all([
            countTable('projects'),
            countTable('certifications'),
            countTable('skills'),
            countTable('experiences'),
            countBlogByStatus(),
            countTable('contact_submissions', { is_read: false }),
            fetchRecentActivity(18),
            fetchPageViewsDailyBuckets(14),
            fetchTopPagePaths(14, 8),
            fetchProjectTechFrequency(),
            countRecentUpdatesSince(iso48),
          ])

        if (cancelled) return

        const series = buckets.series || []
        setStats({ projects, certs, skills, experiences, blog, unread })
        setTraffic(series)
        setTrafficMeta({ error: buckets.error })
        setTopPaths(tp.paths || [])
        setTechTags(freq.tags || [])
        setUpdates48h(churn)
        setActivity(recent)
      } catch {
        if (!cancelled) {
          setStats({
            projects: '—',
            certs: '—',
            skills: '—',
            experiences: '—',
            blog: { draft: '—', published: '—' },
            unread: '—',
          })
          setTraffic([])
          setActivity([])
          setUpdates48h(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    ingest()
    const id = window.setInterval(ingest, 120000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

  const blog = stats.blog
  const published = blog && typeof blog === 'object' && typeof blog.published === 'number' ? blog.published : null
  const drafts = blog && typeof blog === 'object' && typeof blog.draft === 'number' ? blog.draft : null

  const blogBadges = []
  if (published != null && published > 0) blogBadges.push({ label: 'Live', tone: 'green' })
  if (drafts != null && drafts > 0) blogBadges.push({ label: 'Draft', tone: 'amber' })

  const unreadNum = typeof stats.unread === 'number' ? stats.unread : null
  const messageBadges =
    unreadNum != null
      ? [{ label: unreadNum > 0 ? 'Action' : 'Clear', tone: unreadNum > 0 ? 'amber' : 'gray' }]
      : [{ label: '—', tone: 'gray' }]

  const blogSubtitle =
    drafts != null && drafts > 0
      ? `${drafts} draft${drafts === 1 ? '' : 's'}`
      : loading && isSupabaseConfigured
        ? undefined
        : drafts === 0
          ? 'No drafts'
          : undefined

  const trafficSpark = useMemo(() => {
    const raw = (traffic || []).map((d) => d.count)
    if (raw.length >= 2) return raw
    return [4, 6, 5, 7, 6, 8, 7, 5, 6, 7, 8, 9, 7, 6]
  }, [traffic])

  const { visitsWeek, visitsDelta } = useMemo(() => {
    const s = traffic || []
    if (s.length < 4) return { visitsWeek: null, visitsDelta: null }
    const mid = Math.floor(s.length / 2)
    const prev = s.slice(0, mid).reduce((a, b) => a + b.count, 0)
    const cur = s.slice(mid).reduce((a, b) => a + b.count, 0)
    const delta = prev <= 0 ? (cur > 0 ? 100 : 0) : Math.round(((cur - prev) / prev) * 100)
    return { visitsWeek: cur, visitsDelta: delta }
  }, [traffic])

  const completionScore = useMemo(() => {
    const p = typeof stats.projects === 'number' ? stats.projects : 0
    const c = typeof stats.certs === 'number' ? stats.certs : 0
    const sk = typeof stats.skills === 'number' ? stats.skills : 0
    const ex = typeof stats.experiences === 'number' ? stats.experiences : 0
    const pub = published ?? 0
    const score =
      clamp((p / 14) * 26, 0, 26) +
      clamp((c / 18) * 20, 0, 20) +
      clamp((sk / 28) * 18, 0, 18) +
      clamp((ex / 10) * 16, 0, 16) +
      clamp((pub / 8) * 12, 0, 12) +
      (unreadNum === 0 ? 8 : unreadNum != null && unreadNum < 6 ? 4 : 0)
    return clamp(Math.round(score), 0, 100)
  }, [stats.projects, stats.certs, stats.skills, stats.experiences, published, unreadNum])

  const health = useMemo(() => {
    const completion = completionScore
    const momentum = clamp(48 + (visitsDelta != null ? clamp(visitsDelta, -40, 60) * 0.45 : 0) + (updates48h != null ? clamp(updates48h, 0, 12) * 2.2 : 0), 0, 100)
    const freshness = clamp(52 + (updates48h != null ? updates48h * 3.5 : 0) + (drafts != null && published != null && published >= drafts ? 12 : 4), 0, 100)
    const total = (traffic || []).reduce((a, b) => a + b.count, 0)
    const visibility = clamp(40 + (total > 0 ? Math.min(45, Math.log10(total + 10) * 22) : 0) + (unreadNum === 0 ? 10 : unreadNum != null ? -Math.min(18, unreadNum * 2) : 0), 0, 100)
    return { completion, momentum, freshness, visibility }
  }, [completionScore, visitsDelta, updates48h, drafts, published, traffic, unreadNum])

  const grade = letterGrade(completionScore)

  const insights = useMemo(() => {
    const lines = []
    const top = topPaths[0]
    if (top) lines.push(`Traffic gravity centers on ${top.path} — surface key CTAs on that route to compound conversions.`)
    const react = techTags.find((t) => t.tag.includes('react'))
    if (react) lines.push(`Stacks mentioning “${react.tag}” appear in ${react.n} project rows — lean into that narrative in hero copy.`)
    if (typeof stats.projects === 'number' && stats.projects > 0) {
      lines.push(`You are actively curating ${stats.projects} project narratives — keep screenshots sharp to preserve trust.`)
    }
    if (unreadNum != null && unreadNum > 0) lines.push(`Inbox attention debt: ${unreadNum} unread message${unreadNum === 1 ? '' : 's'} — batch triage to protect response SLAs.`)
    if (drafts != null && published != null && drafts > published) lines.push('Draft inventory exceeds live posts — schedule a publish cadence to unlock SEO compounding.')
    if (typeof stats.certs === 'number' && stats.certs < 8) lines.push('Certification density is light — add two verifiable credentials to reinforce seniority signals.')
    if (!lines.length) lines.push('Telemetry is quiet but stable — perfect window for a strategic blog drop or case study refresh.')
    return lines.slice(0, 4)
  }, [topPaths, techTags, stats.projects, stats.certs, unreadNum, drafts, published])

  const first = firstNameFromSession(session)
  const headline = `Welcome back, ${first} — your portfolio stack is online.`
  const subtitle = useMemo(() => {
    if (!isSupabaseConfigured) return 'Wire Supabase to unlock live intelligence, traffic harmonics, and autonomous copilots across this deck.'
    if (visitsDelta != null && updates48h != null) {
      return `Signal blend: traffic ${visitsDelta >= 0 ? 'lifted' : 'softened'} ${Math.abs(visitsDelta)}% vs the prior window with ${updates48h} entity touch${updates48h === 1 ? '' : 'es'} in 48h.`
    }
    return 'Calibrating live portfolio harmonics — activity and traffic will populate once Supabase warms the pipes.'
  }, [visitsDelta, updates48h])

  const productivity = useMemo(() => {
    const focus = topPaths[0]
      ? `Double down on ${topPaths[0].path} — route visitors from socials directly there this week.`
      : 'Ship one high-signal case study update to anchor your hero narrative.'
    const streak =
      updates48h != null && updates48h >= 4
        ? 'High cadence mode — you are sustaining multi-table momentum. Keep the streak with micro-edits daily.'
        : updates48h != null && updates48h >= 1
          ? 'Steady-state editing detected — short focused bursts beat marathon sessions.'
          : 'Quiet deck — schedule a 25-minute focus block to touch two tables.'
    const backlog =
      unreadNum != null && unreadNum > 0
        ? `${unreadNum} inbound thread${unreadNum === 1 ? '' : 's'} waiting — treat inbox zero as a product launch ritual.`
        : drafts != null && drafts > 0
          ? `${drafts} draft asset${drafts === 1 ? '' : 's'} idle — convert the strongest into a published artifact.`
          : 'Backlog horizon is clear — invest in analytics or observability reviews next.'
    return { focus, streak, backlog }
  }, [topPaths, updates48h, unreadNum, drafts])

  const statLoading = loading && isSupabaseConfigured

  const ring = {
    projects: typeof stats.projects === 'number' ? clamp((stats.projects / 14) * 100, 0, 100) : null,
    certs: typeof stats.certs === 'number' ? clamp((stats.certs / 18) * 100, 0, 100) : null,
    blog: published != null ? clamp((published / 10) * 100, 0, 100) : null,
    inbox: unreadNum != null ? clamp(unreadNum === 0 ? 100 : 100 - unreadNum * 12, 10, 100) : null,
  }

  const sectionMap = {
    metrics: (
      <div className="pr-12">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-400/85">Metric lattice</p>
            <h2 className="text-xl font-bold text-slate-50">Live KPI deck</h2>
          </div>
          <p className="max-w-sm text-xs text-slate-500">Hover for depth · sparklines mirror traffic harmonics · rings encode coverage.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:grid-rows-2 xl:gap-5">
          <DashboardStatCard
            className="md:col-span-2 xl:col-span-2 xl:row-span-2"
            title="Projects"
            value={statLoading ? null : stats.projects ?? '—'}
            subtitle="Case studies & builds on the public grid"
            badges={[{ label: 'Live', tone: 'gray' }]}
            accent="sky"
            to="/admin/projects"
            featured
            loading={statLoading}
            sparkSeries={trafficSpark}
            ringPct={ring.projects}
            deltaLabel={visitsDelta != null ? `${visitsDelta >= 0 ? '+' : ''}${visitsDelta}% traffic` : null}
            deltaPositive={visitsDelta != null ? visitsDelta >= 0 : null}
          />
          <DashboardStatCard
            className="xl:col-start-3"
            title="Certifications"
            value={statLoading ? null : stats.certs ?? '—'}
            subtitle="Verified credentials"
            badges={[{ label: 'Vault', tone: 'gray' }]}
            accent="violet"
            to="/admin/certifications"
            loading={statLoading}
            sparkSeries={trafficSpark}
            ringPct={ring.certs}
          />
          <DashboardStatCard
            className="xl:col-start-4"
            title="Blog posts"
            value={statLoading ? null : published ?? '—'}
            subtitle={blogSubtitle}
            badges={blogBadges.length ? blogBadges : [{ label: '—', tone: 'gray' }]}
            accent="emerald"
            to="/admin/blog"
            loading={statLoading}
            sparkSeries={trafficSpark}
            ringPct={ring.blog}
          />
          <DashboardStatCard
            className="md:col-span-2 xl:col-span-2 xl:col-start-3 xl:row-start-2"
            title="Unread messages"
            value={statLoading ? null : stats.unread ?? '—'}
            subtitle="Dual-track inbox + Supabase mirror"
            badges={messageBadges}
            accent="amber"
            to="/admin/messages"
            loading={statLoading}
            sparkSeries={trafficSpark}
            ringPct={ring.inbox}
            deltaLabel={unreadNum != null && unreadNum > 0 ? `${unreadNum} waiting` : unreadNum === 0 ? 'Inbox zero' : null}
            deltaPositive={unreadNum != null ? unreadNum === 0 : null}
          />
        </div>
      </div>
    ),
    intel: (
      <div className="pr-12">
        <div className="mb-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-400/85">Intelligence plane</p>
          <h2 className="text-xl font-bold text-slate-50">Workspace synthesis</h2>
          {trafficMeta.error ? (
            <p className="mt-1 font-mono text-[11px] text-amber-400/90">Traffic stream offline — {trafficMeta.error}</p>
          ) : null}
        </div>
        <DashboardPortfolioIntel insights={insights} health={health} trafficSeries={traffic} />
      </div>
    ),
    activity: (
      <div className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-[rgba(4,10,22,0.55)] pr-10 shadow-[0_26px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        <DashboardActivityFeed activity={activity} loading={statLoading} configured={isSupabaseConfigured} />
      </div>
    ),
    productivity: (
      <div className="pr-12">
        <div className="mb-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400/85">Focus stack</p>
          <h2 className="text-xl font-bold text-slate-50">Productivity radar</h2>
        </div>
        <DashboardProductivityStrip
          dailyFocus={productivity.focus}
          streakLabel={productivity.streak}
          backlogNote={productivity.backlog}
        />
      </div>
    ),
  }

  const heroKpis = isSupabaseConfigured
    ? {
        visitsWeek,
        visitsDelta,
        updates48h,
        grade,
      }
    : null

  return (
    <DashboardAmbient>
      <div className="relative mx-auto max-w-[1400px] space-y-10 pb-36">
        <NotConfiguredBanner />

        <DashboardCommandHero session={session} headline={headline} subtitle={subtitle} kpis={heroKpis} />

        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Completion core</p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-slate-50">
              {statLoading ? <span className="inline-block h-9 w-20 animate-pulse rounded-lg bg-white/[0.08]" /> : <DashboardAnimatedNumber value={completionScore} />}
              <span className="ml-2 text-lg font-semibold text-slate-500">/100</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/admin/analytics" className={`${ADMIN_PRIMARY_CLASS} rounded-xl px-5 py-2.5 text-sm font-semibold`}>
              Open analytics
            </Link>
            <Link
              to="/admin/system-health"
              className="rounded-xl border border-white/[0.12] bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-sky-400/35 hover:bg-white/[0.07]"
            >
              Observability
            </Link>
          </div>
        </div>

        <DashboardReorderGroup order={sectionOrder} onReorder={setSectionOrder}>
          {sectionOrder.map((id) => (
            <DashboardReorderItem key={id} id={id}>
              {sectionMap[id]}
            </DashboardReorderItem>
          ))}
        </DashboardReorderGroup>

        <DashboardQuickDock />
      </div>
    </DashboardAmbient>
  )
}
