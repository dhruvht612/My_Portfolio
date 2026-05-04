import { useMemo, useState } from 'react'
import ActionMenu from './ActionMenu'
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
      <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-white/[0.06] bg-slate-950/40">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-400/30 border-t-sky-400" />
      </div>
    )
  }

  if (error && error.code !== 'NOT_CONFIGURED') {
    return <EmptyState title="Could not load data" message={error.message} />
  }

  if (!sorted.length) {
    return <EmptyState title="No data" message={emptyMessage} />
  }

  const showActions = Boolean(onEdit || onDelete)

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.035] to-white/[0.012] shadow-lg shadow-black/25 ring-1 ring-inset ring-white/[0.03]">
      <table className="min-w-full text-left text-sm">
        <thead className="sticky top-0 z-10 border-b border-white/10 bg-[var(--color-admin-canvas)]/90 backdrop-blur-md">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={`px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 ${
                  col.sortable ? 'cursor-pointer select-none hover:text-sky-300' : ''
                }`}
                onClick={() => toggleSort(col.key, col.sortable)}
              >
                {col.header}
                {sort.key === col.key ? (sort.dir === 'asc' ? ' \u25b2' : ' \u25bc') : ''}
              </th>
            ))}
            {showActions ? (
              <th className="w-14 px-3 py-3.5">
                <span className="sr-only">Actions</span>
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const rk = row[rowKey] ?? row.id
            const menuItems = []
            if (onEdit) menuItems.push({ id: 'edit', label: 'Edit', onClick: () => onEdit(row) })
            if (onDelete) {
              menuItems.push({
                id: 'delete',
                label: 'Delete',
                danger: true,
                onClick: () => onDelete(row),
              })
            }
            return (
              <tr
                key={rk}
                className="border-b border-white/[0.06] transition-colors last:border-0 hover:bg-white/[0.04]"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3.5 align-middle text-slate-200">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
                {showActions ? (
                  <td className="px-2 py-2 align-middle">
                    <ActionMenu
                      menuId={`dt-menu-${rk}`}
                      align="right"
                      variant="vertical"
                      triggerLabel="Row actions"
                      items={menuItems}
                    />
                  </td>
                ) : null}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
