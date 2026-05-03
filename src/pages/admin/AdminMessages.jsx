import { useMemo, useState } from 'react'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import EmptyState from '../../components/admin/EmptyState'
import NotConfiguredBanner from '../../components/admin/NotConfiguredBanner'
import StatusBadge from '../../components/admin/StatusBadge'
import { useAdminCrud } from '../../hooks/useAdminCrud'
import { isSupabaseConfigured } from '../../lib/supabase'

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
    <div className="mx-auto max-w-6xl space-y-6">
      <NotConfiguredBanner />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)]">Messages</h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Contact submissions (Supabase mirror).</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {['all', 'unread', 'read'].map((f) => (
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
        <input
          type="search"
          disabled={!isSupabaseConfigured}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, email, message…"
          className="min-w-[200px] flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/70 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)]">
        <div>
          {loading ? (
            <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-[var(--color-border)]">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-accent)]/30 border-t-[var(--color-accent)]" />
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
                    className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                      selected?.id === row.id
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                        : 'border-[var(--color-border)] bg-[var(--color-bg-card)]/40 hover:border-[var(--color-accent)]/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-[var(--color-text)]">{row.name}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">{row.email}</p>
                      </div>
                      {!row.is_read ? <StatusBadge tone="amber">Unread</StatusBadge> : <StatusBadge tone="gray">Read</StatusBadge>}
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs text-[var(--color-text-muted)]">{row.message}</p>
                    <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                      {row.received_at ? new Date(row.received_at).toLocaleString() : ''}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/30 p-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-8rem)] lg:overflow-auto">
          {selected ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-text)]">{selected.name}</h3>
                <a href={`mailto:${selected.email}`} className="text-sm text-[var(--color-accent)] hover:underline">
                  {selected.email}
                </a>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="theme-btn theme-btn-secondary px-3 py-1.5 text-xs" onClick={() => void toggleRead(selected)}>
                  Mark {selected.is_read ? 'unread' : 'read'}
                </button>
                <button type="button" className="px-3 py-1.5 text-xs text-red-300 hover:underline" onClick={() => setDeleteId(selected.id)}>
                  Delete
                </button>
              </div>
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase text-[var(--color-text-muted)]">Message</h4>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text)]">{selected.message}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--color-text-muted)]">Select a message to read the full thread.</p>
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
