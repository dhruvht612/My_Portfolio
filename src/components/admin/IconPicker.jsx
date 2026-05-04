import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { LUCIDE_ICON_MAP, LUCIDE_ICON_NAMES } from './iconPickerIcons'

export default function IconPicker({ value, onChange, disabled }) {
  const [q, setQ] = useState('')
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return LUCIDE_ICON_NAMES.slice(0, 80)
    return LUCIDE_ICON_NAMES.filter((n) => n.toLowerCase().includes(s)).slice(0, 80)
  }, [q])

  const Selected = value && LUCIDE_ICON_MAP[value] ? LUCIDE_ICON_MAP[value] : LUCIDE_ICON_MAP.Code

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-600/30 bg-slate-800/50 text-sky-400">
          <Selected className="h-6 w-6" aria-hidden />
        </div>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            disabled={disabled}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search icons…"
            className="admin-field-input w-full rounded-xl border border-slate-500/25 py-2 pl-9 pr-3 text-sm shadow-sm placeholder:text-slate-500 focus:border-sky-400/45 focus:outline-none focus:ring-2 focus:ring-sky-400/25"
          />
        </div>
      </div>
      <p className="text-xs text-slate-500">Selected: {value || '—'}</p>
      <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-600/25 bg-slate-900/45 p-2 ring-1 ring-inset ring-white/[0.03]">
        <div className="grid grid-cols-6 gap-1 sm:grid-cols-8">
          {filtered.map((name) => {
            const Icon = LUCIDE_ICON_MAP[name]
            if (!Icon) return null
            const active = value === name
            return (
              <button
                key={name}
                type="button"
                disabled={disabled}
                title={name}
                onClick={() => onChange?.(name)}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-40 ${
                  active ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-accent)]' : 'border-transparent'
                }`}
              >
                <Icon className="h-5 w-5" />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
