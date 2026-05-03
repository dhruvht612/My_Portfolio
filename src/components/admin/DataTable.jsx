import { useMemo, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import EmptyState from './EmptyState'

/**
 * @param {{ key: string, header: string, sortable?: boolean, render?: (row) => React.ReactNode, width?: string }[]} columns
 * @param {object[]} rows
 */
export default function DataTable({
  columns,
  rows,
  loading,
  error,
  rowKey = 'id',
  emptyMessage = 'No rows yet.',
  onEdit,
  onDelete,
}) {
  const [sort, setSort] = useState({ key: null, dir: 'asc' })

  const sorted = useMemo(() => {
    if (!sort.key) return rows
    const dir = sort.dir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      const av = a[sort.key]
      const bv = b[sort.key]
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
      return String(av).localeCompare(String(bv)) * dir
    })
  }, [rows, sort])

  const toggleSort = (key, sortable) => {
    if (!sortable) return
    setSort((s) => {
      if (s.key !== key) return { key, dir: 'asc' }
      return { key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/40">
        <div
          className="h-10 w-10 rounded-full border-2 border-[var(--color-accent)]/30 border-t-[var(--color-accent)]"
          style={{ animation: 'spin 0.7s linear infinite' }}
        />
      </div>
    )
  }

  if (error && error.code !== 'NOT_CONFIGURED') {
    return <EmptyState title="Could not load data" message={error.message} />
  }

  if (!sorted.length) {
    return <EmptyState title="No data" message={emptyMessage} />
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/40">
      <table className="min-w-full text-left text-sm">
        <thead className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={`px-4 py-3 font-semibold text-[var(--color-text-muted)] ${col.sortable ? 'cursor-pointer select-none hover:text-[var(--color-accent)]' : ''}`}
                onClick={() => toggleSort(col.key, col.sortable)}
              >
                {col.header}
                {sort.key === col.key ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
              </th>
            ))}
            {(onEdit || onDelete) && <th className="px-4 py-3 w-24">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={row[rowKey] ?? row.id} className="border-b border-[var(--color-border)]/60 hover:bg-[var(--color-bg-card)]/50">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 align-middle text-[var(--color-text)]">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {onEdit ? (
                      <button
                        type="button"
                        onClick={() => onEdit(row)}
                        className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-accent)]/15 hover:text-[var(--color-accent)]"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    ) : null}
                    {onDelete ? (
                      <button
                        type="button"
                        onClick={() => onDelete(row)}
                        className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-red-500/15 hover:text-red-300"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
