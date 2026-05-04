import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
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
        title="At a glance"
        description="Portfolio counts and recent edits. Cards link to each admin section."
      >
        <Link to="/admin/projects" className={`${ADMIN_PRIMARY_CLASS} self-start sm:self-auto`}>
          <Plus className="h-4 w-4" aria-hidden />
          New project
        </Link>
      </AdminPageHeader>

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

      <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.045] to-white/[0.02] shadow-xl shadow-black/30 ring-1 ring-inset ring-white/[0.03]">
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
