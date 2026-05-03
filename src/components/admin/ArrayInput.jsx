import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'

export default function ArrayInput({ value = [], onChange, itemLabel = 'Item', multiline = false, disabled }) {
  const updateAt = (i, text) => {
    const next = [...value]
    next[i] = text
    onChange?.(next)
  }

  const move = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= value.length) return
    const next = [...value]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange?.(next)
  }

  return (
    <div className="space-y-2">
      {value.map((row, i) => (
        <div key={i} className="flex gap-2">
          <div className="flex flex-col gap-1 pt-1">
            <button
              type="button"
              disabled={disabled || i === 0}
              onClick={() => move(i, -1)}
              className="rounded p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card)] disabled:opacity-30"
              aria-label="Move up"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={disabled || i === value.length - 1}
              onClick={() => move(i, 1)}
              className="rounded p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card)] disabled:opacity-30"
              aria-label="Move down"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
          {multiline ? (
            <textarea
              disabled={disabled}
              value={row}
              onChange={(e) => updateAt(i, e.target.value)}
              rows={3}
              className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/70 px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              placeholder={`${itemLabel} ${i + 1}`}
            />
          ) : (
            <input
              type="text"
              disabled={disabled}
              value={row}
              onChange={(e) => updateAt(i, e.target.value)}
              className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/70 px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              placeholder={`${itemLabel} ${i + 1}`}
            />
          )}
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange?.(value.filter((_, idx) => idx !== i))}
            className="self-start rounded-lg p-2 text-red-300 hover:bg-red-500/10 disabled:opacity-40"
            aria-label="Remove row"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange?.([...value, ''])}
        className="inline-flex items-center gap-2 rounded-xl border border-dashed border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-40"
      >
        <Plus className="h-4 w-4" />
        Add {itemLabel}
      </button>
    </div>
  )
}
