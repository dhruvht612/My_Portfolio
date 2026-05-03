import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import NotConfiguredBanner from '../../components/admin/NotConfiguredBanner'
import StatusBadge from '../../components/admin/StatusBadge'
import { isSupabaseConfigured } from '../../lib/supabase'
import { countBlogByStatus, countTable, fetchRecentActivity } from '../../lib/admin/queries'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ projects: null, certs: null, blog: null, unread: null })
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
          setStats({ projects: '—', certs: '—', blog: { draft: '—', published: '—' }, unread: '—' })
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

  const cards = [
    { label: 'Projects', value: stats.projects, to: '/admin/projects', hint: 'Manage portfolio projects' },
    { label: 'Certifications', value: stats.certs, to: '/admin/certifications', hint: 'Manage credentials' },
    {
      label: 'Blog posts',
      value: stats.blog == null ? '—' : `${stats.blog.published} pub · ${stats.blog.draft} draft`,
      to: '/admin/blog',
      hint: 'Drafts and published posts',
    },
    { label: 'Unread messages', value: stats.unread, to: '/admin/messages', hint: 'Contact submissions' },
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <NotConfiguredBanner />
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text)]">Dashboard</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">Overview of your portfolio backend</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="glass-card group block rounded-2xl border border-[var(--color-border)] p-5 transition-colors hover:border-[var(--color-accent)]/40"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">{c.label}</p>
              <StatusBadge tone="gray">Live</StatusBadge>
            </div>
            <p className="mt-3 text-3xl font-bold text-[var(--color-text)]">{loading && isSupabaseConfigured ? '…' : c.value ?? '—'}</p>
            <p className="mt-2 text-xs text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)]">{c.hint}</p>
          </Link>
        ))}
      </div>

      <div className="glass-card rounded-2xl border border-[var(--color-border)] p-6">
        <h3 className="text-lg font-semibold text-[var(--color-text)]">Recent activity</h3>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">Latest updates across key tables</p>
        {!isSupabaseConfigured ? (
          <p className="mt-4 text-sm text-[var(--color-text-muted)]">Connect Supabase to see activity.</p>
        ) : activity.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--color-text-muted)]">No recent updates found.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[var(--color-border)]/60">
            {activity.map((row) => (
              <li key={`${row.table}-${row.id}`} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span className="font-medium text-[var(--color-text)]">{row.label}</span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {row.table} · {row.updated_at ? new Date(row.updated_at).toLocaleString() : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
