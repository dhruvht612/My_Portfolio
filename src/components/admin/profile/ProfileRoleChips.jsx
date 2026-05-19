import { useState } from 'react'
import { motion, Reorder } from 'framer-motion'
import { GripVertical, Plus, Sparkles, Trash2 } from 'lucide-react'

const ACCENTS = [
  'idf-role-violet',
  'idf-role-cyan',
  'idf-role-emerald',
  'idf-role-amber',
  'idf-role-sky',
]

export default function ProfileRoleChips({ value = [], onChange, disabled }) {
  const [draft, setDraft] = useState('')
  const items = value.length ? value : ['']

  const addFromDraft = () => {
    const t = draft.trim()
    if (!t) return
    const base = items.filter(Boolean)
    onChange?.(base.length ? [...base, t] : [t])
    setDraft('')
  }

  const removeAt = (i) => {
    const next = items.filter((_, j) => j !== i)
    onChange?.(next.length ? next : [''])
  }

  const updateAt = (i, text) => {
    const next = [...items]
    next[i] = text
    onChange?.(next)
  }

  return (
    <motion.div layout className="space-y-4">
      <motion.div layout className="flex flex-wrap gap-2">
        {items.filter(Boolean).map((role, i) => (
          <motion.span
            key={`${role}-${i}`}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`idf-role-pill ${ACCENTS[i % ACCENTS.length]}`}
          >
            <Sparkles className="h-3 w-3 opacity-70" />
            {role}
          </motion.span>
        ))}
        {!items.filter(Boolean).length ? (
          <span className="text-xs text-slate-500">Add roles to power the landing hero typing effect</span>
        ) : null}
      </motion.div>

      <Reorder.Group axis="y" values={items} onReorder={onChange} className="space-y-2">
        {items.map((role, i) => (
          <Reorder.Item
            key={`role-${i}`}
            value={role}
            dragListener={!disabled}
            className={`idf-role-row ${ACCENTS[i % ACCENTS.length]}`}
          >
            <span className="cursor-grab text-slate-500 active:cursor-grabbing" aria-hidden>
              <GripVertical className="h-4 w-4" />
            </span>
            <input
              type="text"
              disabled={disabled}
              value={role}
              onChange={(e) => updateAt(i, e.target.value)}
              placeholder="e.g. Full-Stack Developer"
              className="idf-glass-input min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-slate-100 outline-none"
            />
            <button
              type="button"
              disabled={disabled || items.length <= 1}
              onClick={() => removeAt(i)}
              className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-300"
              aria-label="Remove role"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      <motion.div layout className="flex gap-2">
        <div className="idf-glass-field-wrap flex-1 rounded-xl">
          <input
            type="text"
            disabled={disabled}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFromDraft())}
            placeholder="Add identity tag…"
            className="idf-glass-input w-full rounded-xl px-3 py-2.5 text-sm text-slate-100 outline-none"
          />
        </div>
        <button type="button" disabled={disabled} onClick={addFromDraft} className="idf-chip-add">
          <Plus className="h-4 w-4" />
          Add
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange?.([...items, ''])}
          className="idf-chip-add idf-chip-add-muted"
        >
          Row
        </button>
      </motion.div>
    </motion.div>
  )
}
