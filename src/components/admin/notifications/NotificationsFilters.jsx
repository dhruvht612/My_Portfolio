import { motion } from 'framer-motion'
import { Filter } from 'lucide-react'
import { CATEGORIES, PRIORITY_FILTERS, STATUS_FILTERS } from './notificationsConfig'

function ChipRow({ label, options, value, onChange }) {
  return (
    <motion.div className="space-y-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <motion.div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`notif-filter-chip ${value === opt.id ? 'notif-filter-chip-active' : ''}`}
          >
            {opt.label}
          </button>
        ))}
      </motion.div>
    </motion.div>
  )
}

export default function NotificationsFilters({ category, priority, status, onCategory, onPriority, onStatus }) {
  return (
    <section className="notif-glass-card p-4">
      <header className="mb-3 flex items-center gap-2">
        <Filter className="h-4 w-4 text-violet-300" />
        <h3 className="text-sm font-semibold text-slate-100">Signal routing</h3>
      </header>
      <motion.div className="space-y-3">
        <ChipRow label="Status stream" options={STATUS_FILTERS} value={status} onChange={onStatus} />
        <ChipRow label="Priority lane" options={PRIORITY_FILTERS} value={priority} onChange={onPriority} />
        <ChipRow label="AI category" options={CATEGORIES} value={category} onChange={onCategory} />
      </motion.div>
    </section>
  )
}
