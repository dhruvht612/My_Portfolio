import { Plus, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import ProfileGlassField from './ProfileGlassField'

export default function ProfileObjectCards({
  value = [],
  onChange,
  disabled,
  fields,
  title,
  eyebrow,
}) {
  const list = value.length ? value : []

  const updateAt = (idx, key, val) => {
    const next = [...list]
    next[idx] = { ...next[idx], [key]: val }
    onChange?.(next)
  }

  const add = () => {
    const blank = Object.fromEntries(fields.map((f) => [f.name, '']))
    onChange?.([...list, blank])
  }

  const remove = (idx) => onChange?.(list.filter((_, i) => i !== idx))

  return (
    <div className="space-y-3">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/90">{eyebrow}</p>
        <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
      </header>
      {list.map((item, idx) => (
        <motion.div
          key={idx}
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="idf-object-card space-y-3 p-4"
        >
          <motion.div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Card {idx + 1}</span>
            <button
              type="button"
              disabled={disabled}
              onClick={() => remove(idx)}
              className="inline-flex items-center gap-1 text-xs text-red-300/90 hover:text-red-200"
            >
              <Trash2 className="h-3 w-3" />
              Remove
            </button>
          </motion.div>
          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.name} className={f.full ? 'sm:col-span-2' : ''}>
                {f.type === 'textarea' ? (
                  <ProfileGlassField
                    as="textarea"
                    label={f.label}
                    rows={2}
                    disabled={disabled}
                    value={item[f.name] || ''}
                    onChange={(e) => updateAt(idx, f.name, e.target.value)}
                  />
                ) : (
                  <ProfileGlassField
                    label={f.label}
                    disabled={disabled}
                    value={item[f.name] || ''}
                    onChange={(e) => updateAt(idx, f.name, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      ))}
      <button type="button" disabled={disabled} onClick={add} className="idf-add-card-btn">
        <Plus className="h-4 w-4" />
        Add card
      </button>
    </div>
  )
}
