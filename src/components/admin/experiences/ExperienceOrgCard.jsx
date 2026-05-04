import { AnimatePresence, motion as M } from 'framer-motion'
import { ChevronDown, ChevronRight } from 'lucide-react'
import ActionMenu from '../ActionMenu'
import ExperienceRoleItem from './ExperienceRoleItem'

function firstLogoUrl(orgRows) {
  for (const r of orgRows) {
    const u = r.logo_url
    if (typeof u === 'string' && u.trim()) return u.trim()
  }
  return null
}

/**
 * @param {{
 *   org: string
 *   panelId: string
 *   orgRows: Record<string, unknown>[]
 *   expanded: boolean
 *   onToggle: () => void
 *   onAddRole: () => void
 *   onEdit: (row: Record<string, unknown>) => void
 *   onDeleteRole: (id: string) => void
 *   onMoveRole: (row: Record<string, unknown>, dir: -1 | 1) => void
 * }} props
 */
export default function ExperienceOrgCard({
  org,
  panelId,
  orgRows,
  expanded,
  onToggle,
  onAddRole,
  onEdit,
  onDeleteRole,
  onMoveRole,
}) {
  const logoUrl = firstLogoUrl(orgRows)

  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.035] shadow-lg shadow-black/25 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30">
      <div className="flex items-center gap-3 px-4 py-4 md:px-5">
        {logoUrl ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] sm:h-11 sm:w-11">
            <img src={logoUrl} alt="" className="max-h-full max-w-full object-contain p-1" loading="lazy" />
          </div>
        ) : (
          <div
            className="h-10 w-10 shrink-0 rounded-xl border border-dashed border-white/15 bg-white/[0.02] sm:h-11 sm:w-11"
            aria-hidden
          />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold tracking-tight text-slate-50 md:text-lg">{org}</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {orgRows.length} role{orgRows.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <ActionMenu
            variant="horizontal"
            align="right"
            triggerLabel={`Actions for ${org}`}
            items={[{ id: 'add', label: 'Add role', onClick: onAddRole }]}
          />
          <button
            type="button"
            onClick={onToggle}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/[0.08] hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
            aria-expanded={expanded}
            aria-controls={panelId}
            aria-label={expanded ? 'Collapse roles' : 'Expand roles'}
          >
            {expanded ? <ChevronDown className="h-5 w-5" aria-hidden /> : <ChevronRight className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded ? (
          <M.div
            key="panel"
            id={panelId}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="border-t border-white/[0.06]"
          >
            <div className="px-3 pb-1 pt-2 md:px-5">
              <div className="relative ml-1 border-l border-white/10 pl-3 md:ml-3 md:pl-4">
                <div className="space-y-0.5">
                  {orgRows.map((row) => (
                    <ExperienceRoleItem
                      key={String(row.id)}
                      row={row}
                      orgRows={orgRows}
                      onEdit={onEdit}
                      onDelete={onDeleteRole}
                      onMove={(dir) => onMoveRole(row, dir)}
                    />
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={onAddRole}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-sky-400/95 transition-colors duration-200 hover:bg-sky-500/10 hover:text-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40"
              >
                <span className="text-base leading-none">+</span>
                Add role
              </button>
            </div>
          </M.div>
        ) : null}
      </AnimatePresence>
    </article>
  )
}
