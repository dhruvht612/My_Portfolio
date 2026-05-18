import { motion } from 'framer-motion'

export function SettingsToggle({ label, hint, checked, onChange, disabled }) {
  return (
    <label className="set-toggle-row group">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-200">{label}</p>
        {hint ? <p className="mt-0.5 text-[11px] text-slate-500">{hint}</p> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`set-toggle-track ${checked ? 'set-toggle-track-on' : ''}`}
      >
        <motion.span layout className="set-toggle-thumb" transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
      </button>
    </label>
  )
}

export function SettingsChipGroup({ label, options, value, onChange }) {
  return (
    <motion.div layout className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <motion.div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`set-chip ${active ? 'set-chip-active' : ''}`}
            >
              {opt.label}
            </button>
          )
        })}
      </motion.div>
    </motion.div>
  )
}

export function SettingsSlider({ label, value, min = 0, max = 100, onChange, format = (v) => v }) {
  return (
    <motion.div className="space-y-2">
      <motion.div className="flex items-center justify-between" animate={{ opacity: [0.9, 1, 0.9] }} transition={{ duration: 4, repeat: Infinity }}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
        <span className="font-mono text-[11px] text-cyan-300/90">{format(value)}</span>
      </motion.div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="set-slider w-full" />
    </motion.div>
  )
}

export function SettingsColorChips({ label, options, value, onChange }) {
  return (
    <motion.div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <motion.div className="flex flex-wrap gap-2" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.04 } } }}>
        {options.map((opt) => (
          <motion.button
            key={opt.value}
            type="button"
            variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
            onClick={() => onChange(opt.value)}
            className={`set-color-chip ${value === opt.value ? 'set-color-chip-active' : ''}`}
            style={{ '--set-chip-color': opt.color }}
            title={opt.label}
          >
            <span className="set-color-swatch" />
            <span className="text-[10px] font-medium text-slate-300">{opt.label}</span>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  )
}
