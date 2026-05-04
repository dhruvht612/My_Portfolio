import ActionMenu from '../ActionMenu'
import StatusBadge from '../StatusBadge'

function isCurrentRole(dateRange) {
  if (typeof dateRange !== 'string' || !dateRange.trim()) return false
  return /\bpresent\b/i.test(dateRange)
}

/**
 * @param {{
 *   row: Record<string, unknown>
 *   orgRows: Record<string, unknown>[]
 *   onEdit: (row: Record<string, unknown>) => void
 *   onDelete: (id: string) => void
 *   onMove: (dir: -1 | 1) => void
 * }} props
 */
export default function ExperienceRoleItem({ row, orgRows, onEdit, onDelete, onMove }) {
  const idx = orgRows.findIndex((r) => r.id === row.id)
  const canUp = idx > 0
  const canDown = idx >= 0 && idx < orgRows.length - 1
  const current = isCurrentRole(row.date_range)

  return (
    <div className="group relative flex gap-3 rounded-xl py-1 pl-1 pr-2 transition-colors duration-200 hover:bg-white/[0.04]">
      <div className="flex w-3 shrink-0 justify-center pt-3" aria-hidden>
        <span
          className={`h-2 w-2 rounded-full ring-2 ring-black/20 ${
            current ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.45)]' : 'bg-slate-500/80'
          }`}
        />
      </div>
      <div className="min-w-0 flex-1 py-3 pr-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold tracking-tight text-slate-100">{row.role_title || 'Untitled role'}</p>
              {current ? (
                <StatusBadge tone="green">Current</StatusBadge>
              ) : null}
              {row.is_featured ? (
                <StatusBadge tone="amber">Featured</StatusBadge>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-slate-500">{row.date_range || '—'}</p>
          </div>
          <div className="opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
            <ActionMenu
              variant="vertical"
              triggerLabel="Role actions"
              items={[
                { id: 'edit', label: 'Edit', onClick: () => onEdit(row) },
                { id: 'up', label: 'Move up', onClick: () => onMove(-1), disabled: !canUp },
                { id: 'down', label: 'Move down', onClick: () => onMove(1), disabled: !canDown },
                {
                  id: 'delete',
                  label: 'Delete',
                  danger: true,
                  onClick: () => onDelete(String(row.id)),
                },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
