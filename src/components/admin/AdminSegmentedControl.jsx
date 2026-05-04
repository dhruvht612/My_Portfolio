/**
 * Pill-style filter or tab control (blog status, messages filter, skills tab, analytics range).
 */
export default function AdminSegmentedControl({ options, value, onChange, disabled, className = '' }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`} role="tablist" aria-label="Filter">
      {options.map((o) => {
        const active = value === o.value
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={disabled}
            onClick={() => onChange(o.value)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 disabled:cursor-not-allowed disabled:opacity-50 ${
              active
                ? 'bg-sky-500/25 text-sky-100 ring-1 ring-sky-400/40'
                : 'border border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/15 hover:text-slate-200'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
