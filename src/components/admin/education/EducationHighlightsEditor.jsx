import { motion } from 'framer-motion'
import { Plus, Trash2 } from 'lucide-react'
import EducationGlassField from './EducationGlassField'

export default function EducationHighlightsEditor({ value = [], onChange, disabled, errors }) {
  const list = value || []

  const update = (idx, key, text) => {
    const next = [...list]
    next[idx] = { ...next[idx], [key]: text }
    onChange?.(next)
  }

  return (
    <div className="space-y-3">
      {list.map((item, idx) => (
        <motion.div
          key={idx}
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="edu-glass-card space-y-3 p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Card {idx + 1}</span>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange?.(list.filter((_, i) => i !== idx))}
              className="inline-flex items-center gap-1 text-xs text-red-300 hover:underline"
            >
              <Trash2 className="h-3 w-3" />
              Remove
            </button>
          </div>
          <EducationGlassField
            label="Icon class"
            value={item.icon || ''}
            disabled={disabled}
            onChange={(e) => update(idx, 'icon', e.target.value)}
            error={errors?.[idx]?.icon?.message}
          />
          <EducationGlassField
            label="Title"
            value={item.title || ''}
            disabled={disabled}
            onChange={(e) => update(idx, 'title', e.target.value)}
            error={errors?.[idx]?.title?.message}
          />
          <EducationGlassField
            as="textarea"
            label="Description"
            rows={2}
            value={item.description || ''}
            disabled={disabled}
            onChange={(e) => update(idx, 'description', e.target.value)}
            error={errors?.[idx]?.description?.message}
          />
        </motion.div>
      ))}
      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          onChange?.([
            ...list,
            { icon: 'fas fa-star', title: '', description: '' },
          ])
        }
        className="edu-add-btn flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-3 text-xs text-slate-400 transition hover:border-sky-400/35 hover:text-slate-200"
      >
        <Plus className="h-3.5 w-3.5" />
        Add highlight card
      </button>
    </div>
  )
}
