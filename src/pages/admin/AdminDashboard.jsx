import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Rocket, Sparkles, Zap } from 'lucide-react'
import { ADMIN_PRIMARY_CLASS } from '../../components/admin/AdminPrimaryButton'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import DashboardActivityFeed from '../../components/admin/dashboard/DashboardActivityFeed'
import DashboardStatCard from '../../components/admin/dashboard/DashboardStatCard'
import NotConfiguredBanner from '../../components/admin/NotConfiguredBanner'
import { isSupabaseConfigured } from '../../lib/supabase'
import { countBlogByStatus, countTable, fetchRecentActivity } from '../../lib/admin/queries'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    projects: null,
    certs: null,
    blog: null,
    unread: null,
  })
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!isSupabaseConfigured) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const [projects, certs, blog, unread, recent] = await Promise.all([
          countTable('projects'),
          countTable('certifications'),
          countBlogByStatus(),
          countTable('contact_submissions', { is_read: false }),
          fetchRecentActivity(),
        ])
        if (!cancelled) {
          setStats({ projects, certs, blog, unread })
          setActivity(recent)
        }
      } catch {
        if (!cancelled) {
          setStats({
            projects: '—',
            certs: '—',
            blog: { draft: '—', published: '—' },
            unread: '—',
          })
          setActivity([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
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

  return (
    <div className="relative mx-auto max-w-6xl space-y-8 lg:space-y-10">
      <NotConfiguredBanner />

      <AdminPageHeader
        eyebrow="Overview"
        title="Command center"
        description="Live portfolio intelligence with cinematic SaaS polish, quick actions, and activity signal."
      >
        <Link to="/admin/projects" className={`${ADMIN_PRIMARY_CLASS} self-start sm:self-auto`}>
          <Plus className="h-4 w-4" aria-hidden />
          New project
        </Link>
      </AdminPageHeader>

      <section className="admin-card-premium p-5 md:p-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <h3 className="text-xl font-semibold text-slate-100">Portfolio health overview</h3>
            <p className="mt-1 text-sm text-slate-400">Track momentum, execute quick actions, and keep your public profile fresh.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Completion</p>
                <p className="mt-1 text-2xl font-bold text-slate-100">86%</p>
              </div>
              <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/[0.08] p-3">
                <p className="text-[11px] uppercase tracking-wide text-emerald-300/80">Velocity</p>
                <p className="mt-1 text-2xl font-bold text-emerald-200">+12%</p>
              </div>
              <div className="rounded-xl border border-sky-400/25 bg-sky-500/[0.08] p-3">
                <p className="text-[11px] uppercase tracking-wide text-sky-300/80">Signal score</p>
                <p className="mt-1 text-2xl font-bold text-sky-100">A-</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <h4 className="text-sm font-semibold text-slate-200">Quick actions dock</h4>
            <div className="mt-3 space-y-2">
              <Link to="/admin/projects" className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-300 hover:border-sky-400/40 hover:text-sky-200">
                <Rocket className="h-4 w-4" /> Ship project update
              </Link>
              <Link to="/admin/messages" className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-300 hover:border-amber-300/40 hover:text-amber-200">
                <Zap className="h-4 w-4" /> Clear unread inbox
              </Link>
              <Link to="/admin/system-health" className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-300 hover:border-violet-300/40 hover:text-violet-200">
                <Sparkles className="h-4 w-4" /> Open observability
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:grid-rows-2 xl:gap-5">
        <DashboardStatCard
          className="md:col-span-2 xl:col-span-2 xl:row-span-2"
          title="Projects"
          value={loading && isSupabaseConfigured ? null : stats.projects ?? '—'}
          subtitle="Manage portfolio projects and case studies"
          badges={[{ label: 'Live', tone: 'gray' }]}
          accent="sky"
          to="/admin/projects"
          featured
          loading={loading && isSupabaseConfigured}
        />
        <DashboardStatCard
          className="xl:col-start-3"
          title="Certifications"
          value={loading && isSupabaseConfigured ? null : stats.certs ?? '—'}
          subtitle="Credentials and badges"
          badges={[{ label: 'Live', tone: 'gray' }]}
          accent="violet"
          to="/admin/certifications"
          loading={loading && isSupabaseConfigured}
        />
        <DashboardStatCard
          className="xl:col-start-4"
          title="Blog posts"
          value={loading && isSupabaseConfigured ? null : published ?? '—'}
          subtitle={blogSubtitle}
          badges={blogBadges.length ? blogBadges : [{ label: '—', tone: 'gray' }]}
          accent="emerald"
          to="/admin/blog"
          loading={loading && isSupabaseConfigured}
        />
        <DashboardStatCard
          className="md:col-span-2 xl:col-span-2 xl:col-start-3 xl:row-start-2"
          title="Unread messages"
          value={loading && isSupabaseConfigured ? null : stats.unread ?? '—'}
          subtitle="Contact form submissions"
          badges={messageBadges}
          accent="amber"
          to="/admin/messages"
          loading={loading && isSupabaseConfigured}
        />
      </div>

      <section className="admin-card-premium">
        <div className="border-b border-white/10 px-6 py-5 md:px-8">
          <h2 className="text-lg font-semibold tracking-tight text-slate-50">Recent activity</h2>
          <p className="mt-1 text-sm text-slate-500">Latest updates across your portfolio tables</p>
        </div>
        <DashboardActivityFeed
          activity={activity}
          loading={loading && isSupabaseConfigured}
          configured={isSupabaseConfigured}
        />
      </section>
    </div>
  )
}
