import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ADMIN_NAV } from '../../constants/adminNav'

export default function AdminCommandPalette({ open, onClose }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ADMIN_NAV
    return ADMIN_NAV.filter((item) => item.label.toLowerCase().includes(q))
  }, [query])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center bg-slate-950/70 p-4 pt-[12vh] backdrop-blur-sm" onClick={onClose}>
      <div
        className="admin-panel-glass w-full max-w-2xl overflow-hidden rounded-2xl border border-white/15"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search admin sections..."
            className="admin-field-input admin-field-input--ghost w-full text-sm"
            autoFocus
          />
        </div>
        <ul className="max-h-[50vh] overflow-y-auto p-2">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.to}>
                <button
                  type="button"
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-200 transition hover:bg-white/[0.06]"
                  onClick={() => {
                    navigate(item.to)
                    onClose?.()
                  }}
                >
                  <Icon className="h-4 w-4 text-slate-400 group-hover:text-sky-300" />
                  <span>{item.label}</span>
                </button>
              </li>
            )
          })}
          {!items.length ? <li className="px-3 py-4 text-sm text-slate-500">No results</li> : null}
        </ul>
      </div>
    </div>
  )
}
