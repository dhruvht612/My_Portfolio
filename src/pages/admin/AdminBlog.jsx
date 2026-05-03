import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import EmptyState from '../../components/admin/EmptyState'
import NotConfiguredBanner from '../../components/admin/NotConfiguredBanner'
import StatusBadge from '../../components/admin/StatusBadge'
import { useAdminCrud } from '../../hooks/useAdminCrud'
import { isSupabaseConfigured } from '../../lib/supabase'

export default function AdminBlog() {
  const navigate = useNavigate()
  const { rows, loading, error, update, remove } = useAdminCrud('blog_posts', {
    column: 'updated_at',
    ascending: false,
  })
  const [filter, setFilter] = useState('all')
  const [deleteId, setDeleteId] = useState(null)

  const filtered = useMemo(() => {
    if (filter === 'all') return rows
    return rows.filter((r) => r.status === filter)
  }, [rows, filter])

  const publish = async (row) => {
    await update(row.id, { status: 'published', published_at: row.published_at || new Date().toISOString() })
  }

  const unpublish = async (row) => {
    await update(row.id, { status: 'draft', published_at: null })
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <NotConfiguredBanner />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)]">Blog</h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Drafts, publishing, and edits.</p>
        </div>
        <button type="button" disabled={!isSupabaseConfigured} onClick={() => navigate('/admin/blog/new')} className="theme-btn theme-btn-primary px-4 py-2 text-sm">
          + New post
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {['all', 'draft', 'published'].map((f) => (
          <button
            key={f}
            type="button"
            disabled={!isSupabaseConfigured}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize ${
              filter === f ? 'bg-[var(--color-accent)] text-[var(--color-bg)]' : 'border border-[var(--color-border)] text-[var(--color-text-muted)]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-[var(--color-border)]">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-accent)]/30 border-t-[var(--color-accent)]" />
        </div>
      ) : error && error.code !== 'NOT_CONFIGURED' ? (
        <EmptyState title="Could not load posts" message={error.message} />
      ) : !filtered.length ? (
        <EmptyState title="No posts" message="Create your first post." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/40">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-bg)]/90">
              <tr>
                <th className="px-4 py-3 font-semibold text-[var(--color-text-muted)]">Title</th>
                <th className="px-4 py-3 font-semibold text-[var(--color-text-muted)]">Slug</th>
                <th className="px-4 py-3 font-semibold text-[var(--color-text-muted)]">Status</th>
                <th className="px-4 py-3 font-semibold text-[var(--color-text-muted)]">Updated</th>
                <th className="px-4 py-3 w-48">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-b border-[var(--color-border)]/60 hover:bg-[var(--color-bg-card)]/50">
                  <td className="px-4 py-3 font-medium text-[var(--color-text)]">{row.title}</td>
                  <td className="px-4 py-3 text-xs text-[var(--color-text-muted)]">{row.slug}</td>
                  <td className="px-4 py-3">
                    {row.status === 'published' ? <StatusBadge tone="green">Published</StatusBadge> : <StatusBadge tone="gray">Draft</StatusBadge>}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--color-text-muted)]">
                    {row.updated_at ? new Date(row.updated_at).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <button type="button" className="theme-btn theme-btn-secondary px-2 py-1 text-xs" onClick={() => navigate(`/admin/blog/edit/${row.id}`)}>
                        Edit
                      </button>
                      {row.status !== 'published' ? (
                        <button type="button" className="theme-btn theme-btn-secondary px-2 py-1 text-xs" onClick={() => void publish(row)}>
                          Publish
                        </button>
                      ) : (
                        <button type="button" className="theme-btn theme-btn-secondary px-2 py-1 text-xs" onClick={() => void unpublish(row)}>
                          Unpublish
                        </button>
                      )}
                      <button type="button" className="px-2 py-1 text-xs text-red-300 hover:underline" onClick={() => setDeleteId(row.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete post?"
        message="This cannot be undone."
        confirmLabel="Delete"
        danger
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) await remove(deleteId)
          setDeleteId(null)
        }}
      />
    </div>
  )
}
