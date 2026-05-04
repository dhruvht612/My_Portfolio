import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { MoreHorizontal, MoreVertical } from 'lucide-react'

/**
 * @typedef {{ id: string, label: string, onClick: () => void, disabled?: boolean, danger?: boolean }} ActionMenuItem
 */

/**
 * @param {{
 *   items: ActionMenuItem[]
 *   align?: 'left' | 'right'
 *   variant?: 'horizontal' | 'vertical'
 *   triggerLabel?: string
 *   menuId?: string
 * }} props
 */
export default function ActionMenu({ items, align = 'right', variant = 'vertical', triggerLabel = 'More actions', menuId: menuIdProp }) {
  const reactId = useId()
  const menuId = menuIdProp ?? `action-menu-${reactId}`
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return undefined

    const onDoc = (e) => {
      const el = rootRef.current
      if (el && !el.contains(e.target)) close()
    }
    const onKey = (e) => {
      if (e.key === 'Escape') close()
    }

    document.addEventListener('mousedown', onDoc, true)
    document.addEventListener('touchstart', onDoc, true)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc, true)
      document.removeEventListener('touchstart', onDoc, true)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  const Icon = variant === 'horizontal' ? MoreHorizontal : MoreVertical

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        type="button"
        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/[0.08] hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
        aria-label={triggerLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-orientation="vertical"
          className={`absolute z-50 mt-1 min-w-[10.5rem] overflow-hidden rounded-xl border border-white/10 bg-[var(--color-admin-canvas)]/95 py-1 shadow-xl shadow-black/40 backdrop-blur-md ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              className={`flex w-full items-center px-3 py-2.5 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                item.danger
                  ? 'text-red-300 hover:bg-red-500/15'
                  : 'text-slate-200 hover:bg-white/[0.08]'
              }`}
              onClick={() => {
                if (item.disabled) return
                item.onClick()
                close()
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
