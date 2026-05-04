import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ActionMenu from '../../components/admin/ActionMenu'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminPrimaryButton from '../../components/admin/AdminPrimaryButton'
import AdminSegmentedControl from '../../components/admin/AdminSegmentedControl'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import EmptyState from '../../components/admin/EmptyState'
import NotConfiguredBanner from '../../components/admin/NotConfiguredBanner'
import StatusBadge from '../../components/admin/StatusBadge'
import { useAdminCrud } from '../../hooks/useAdminCrud'
import { isSupabaseConfigured } from '../../lib/supabase'

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
]

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
    <div className="mx-auto max-w-6xl space-y-8">
      <NotConfiguredBanner />
      <AdminPageHeader
        eyebrow="Content"
        title="Blog"
        description="Drafts, publishing, and edits. Use each row’s menu for publish actions and delete."
      >
        <AdminPrimaryButton disabled={!isSupabaseConfigured} onClick={() => navigate('/admin/blog/new')}>
          <Plus className="h-4 w-4" aria-hidden />
          New post
        </AdminPrimaryButton>
      </AdminPageHeader>

      <AdminSegmentedControl
        options={FILTER_OPTIONS}
        value={filter}
        onChange={setFilter}
        disabled={!isSupabaseConfigured}
      />

      {loading ? (
        <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-white/[0.06] bg-slate-950/40">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-400/30 border-t-sky-400" />
        </div>
      ) : error && error.code !== 'NOT_CONFIGURED' ? (
        <EmptyState title="Could not load posts" message={error.message} />
      ) : !filtered.length ? (
        <EmptyState title="No posts" message="Create your first post." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.035] to-white/[0.012] shadow-lg shadow-black/25 ring-1 ring-inset ring-white/[0.03]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-[var(--color-admin-canvas)]/90 backdrop-blur-md">
              <tr>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Title</th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Slug</th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Updated</th>
                <th className="w-14 px-2 py-3.5">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const items = [
                  { id: 'edit', label: 'Edit', onClick: () => navigate(`/admin/blog/edit/${row.id}`) },
                  ...(row.status !== 'published'
                    ? [{ id: 'pub', label: 'Publish', onClick: () => void publish(row) }]
                    : [{ id: 'unpub', label: 'Unpublish', onClick: () => void unpublish(row) }]),
                  {
                    id: 'del',
                    label: 'Delete',
                    danger: true,
                    onClick: () => setDeleteId(row.id),
                  },
                ]
                return (
                  <tr key={row.id} className="border-b border-white/[0.06] transition-colors last:border-0 hover:bg-white/[0.04]">
                    <td className="px-4 py-3.5 font-medium text-slate-100">{row.title}</td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{row.slug}</td>
                    <td className="px-4 py-3.5">
                      {row.status === 'published' ? (
                        <StatusBadge tone="green">Published</StatusBadge>
                      ) : (
                        <StatusBadge tone="gray">Draft</StatusBadge>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs tabular-nums text-slate-500">
                      {row.updated_at ? new Date(row.updated_at).toLocaleString() : '—'}
                    </td>
                    <td className="px-2 py-2 align-middle">
                      <ActionMenu menuId={`blog-row-${row.id}`} triggerLabel="Post actions" items={items} />
                    </td>
                  </tr>
                )
              })}
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
