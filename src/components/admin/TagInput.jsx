import { useState } from 'react'
import { X } from 'lucide-react'

export default function TagInput({ value = [], onChange, placeholder = 'Type and press Enter', suggestions = [], disabled }) {
  const [input, setInput] = useState('')

  const add = (raw) => {
    const t = String(raw).trim()
    if (!t || value.includes(t)) return
    onChange?.([...value, t])
    setInput('')
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add(input)
    } else if (e.key === 'Backspace' && !input && value.length) {
      onChange?.(value.slice(0, -1))
    }
  }

  return (
    <div>
      <div className="flex min-h-[46px] flex-wrap gap-2 rounded-xl border border-slate-500/25 bg-slate-900/55 p-2 shadow-sm ring-1 ring-inset ring-white/[0.04]">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full border border-[var(--color-accent)]/35 bg-[var(--color-accent)]/15 px-2.5 py-1 text-xs font-medium text-[var(--color-accent)]"
          >
            {tag}
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange?.(value.filter((x) => x !== tag))}
              className="rounded p-0.5 hover:bg-[var(--color-accent)]/25 disabled:opacity-40"
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          disabled={disabled}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => {
            if (input.trim()) add(input)
          }}
          placeholder={value.length ? '' : placeholder}
          className="admin-field-input admin-field-input--ghost min-w-[8rem] flex-1 rounded-md border-0 px-2 py-1 text-sm outline-none placeholder:text-slate-500"
        />
      </div>
      {suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {suggestions
            .filter((s) => s && !value.includes(s))
            .slice(0, 12)
            .map((s) => (
              <button
                key={s}
                type="button"
                disabled={disabled}
                onClick={() => add(s)}
                className="rounded-full border border-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-text-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-40"
              >
                + {s}
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
