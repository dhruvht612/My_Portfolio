/**
 * Placeholder for admin CRUD sections not built until Phase 5.
 */
export default function AdminPlaceholder({ title, description, phase = 5 }) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="glass-card rounded-2xl border border-[var(--color-border)] p-8 md:p-10">
        <span className="mb-3 inline-block rounded-full border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]">
          Coming in Phase {phase}
        </span>
        <h2 className="mt-2 text-2xl font-bold text-[var(--color-text)]">{title}</h2>
        <p className="mt-3 leading-relaxed text-[var(--color-text-muted)]">{description}</p>
      </div>
    </div>
  )
}
