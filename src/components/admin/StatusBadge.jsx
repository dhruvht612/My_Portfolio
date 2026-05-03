const tones = {
  green: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200',
  amber: 'border-amber-500/40 bg-amber-500/15 text-amber-100',
  gray: 'border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-muted)]',
  blue: 'border-sky-500/40 bg-sky-500/15 text-sky-100',
  red: 'border-red-500/40 bg-red-500/15 text-red-100',
}

export default function StatusBadge({ tone = 'gray', children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${tones[tone] || tones.gray}`}
    >
      {children}
    </span>
  )
}
