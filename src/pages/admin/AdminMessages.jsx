import { useMemo, useState } from 'react'
import ActionMenu from '../../components/admin/ActionMenu'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminSegmentedControl from '../../components/admin/AdminSegmentedControl'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import EmptyState from '../../components/admin/EmptyState'
import NotConfiguredBanner from '../../components/admin/NotConfiguredBanner'
import StatusBadge from '../../components/admin/StatusBadge'
import { useAdminCrud } from '../../hooks/useAdminCrud'
import { isSupabaseConfigured } from '../../lib/supabase'

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
]

export default function AdminMessages() {
  const { rows, loading, error, update, remove } = useAdminCrud('contact_submissions', {
    column: 'received_at',
    ascending: false,
  })
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const filtered = useMemo(() => {
    let list = rows
    if (filter === 'unread') list = list.filter((r) => !r.is_read)
    if (filter === 'read') list = list.filter((r) => r.is_read)
    const s = q.trim().toLowerCase()
    if (s) {
      list = list.filter((r) => `${r.name} ${r.email} ${r.message}`.toLowerCase().includes(s))
    }
    return list
  }, [rows, filter, q])

  const toggleRead = async (row) => {
    await update(row.id, { is_read: !row.is_read })
    if (selected?.id === row.id) setSelected({ ...row, is_read: !row.is_read })
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <NotConfiguredBanner />
      <AdminPageHeader
        eyebrow="Inbox"
        title="Messages"
        description="Contact submissions mirrored in Supabase. Select a thread to read the full message."
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
        <AdminSegmentedControl
          options={FILTER_OPTIONS}
          value={filter}
          onChange={setFilter}
          disabled={!isSupabaseConfigured}
        />
        <input
          type="search"
          disabled={!isSupabaseConfigured}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, email, message…"
          className="admin-field-input min-w-[220px] flex-1 rounded-xl border border-slate-500/25 px-4 py-2.5 text-sm shadow-sm placeholder:text-slate-500 focus:border-sky-400/45 focus:outline-none focus:ring-2 focus:ring-sky-400/25"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)]">
        <div>
          {loading ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-white/[0.06] bg-slate-950/40">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-400/30 border-t-sky-400" />
            </div>
          ) : error && error.code !== 'NOT_CONFIGURED' ? (
            <EmptyState title="Could not load messages" message={error.message} />
          ) : !filtered.length ? (
            <EmptyState title="No messages" message="Nothing matches this filter." />
          ) : (
            <ul className="space-y-2">
              {filtered.map((row) => (
                <li key={row.id}>
                  <button
                    type="button"
                    disabled={!isSupabaseConfigured}
                    onClick={() => setSelected(row)}
                    className={`w-full rounded-2xl border px-4 py-3.5 text-left transition-colors duration-200 ${
                      selected?.id === row.id
                        ? 'border-sky-400/40 bg-sky-500/10 shadow-lg shadow-sky-500/10'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-100">{row.name}</p>
                        <p className="text-xs text-slate-500">{row.email}</p>
                      </div>
                      {!row.is_read ? <StatusBadge tone="amber">Unread</StatusBadge> : <StatusBadge tone="gray">Read</StatusBadge>}
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">{row.message}</p>
                    <p className="mt-1.5 text-[10px] tabular-nums text-slate-600">
                      {row.received_at ? new Date(row.received_at).toLocaleString() : ''}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-white/[0.015] p-5 shadow-lg shadow-black/25 ring-1 ring-inset ring-white/[0.03] lg:sticky lg:top-4 lg:max-h-[calc(100vh-8rem)] lg:overflow-auto">
          {selected ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold tracking-tight text-slate-50">{selected.name}</h3>
                  <a href={`mailto:${selected.email}`} className="text-sm text-sky-300 hover:text-sky-200 hover:underline">
                    {selected.email}
                  </a>
                </div>
                <ActionMenu
                  menuId={`msg-detail-${selected.id}`}
                  triggerLabel="Message actions"
                  items={[
                    {
                      id: 'read',
                      label: selected.is_read ? 'Mark unread' : 'Mark read',
                      onClick: () => void toggleRead(selected),
                    },
                    {
                      id: 'del',
                      label: 'Delete',
                      danger: true,
                      onClick: () => setDeleteId(selected.id),
                    },
                  ]}
                />
              </div>
              <div>
                <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Message</h4>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">{selected.message}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Select a message to read the full thread.</p>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete message?"
        message="This cannot be undone."
        confirmLabel="Delete"
        danger
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) {
            await remove(deleteId)
            setSelected((s) => (s?.id === deleteId ? null : s))
          }
          setDeleteId(null)
        }}
      />
    </div>
  )
}
