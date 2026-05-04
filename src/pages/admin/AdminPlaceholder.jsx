/**
 * Placeholder for admin CRUD sections not built until Phase 5.
 */
export default function AdminPlaceholder({ title, description, phase = 5 }) {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.045] to-white/[0.02] p-8 shadow-xl shadow-black/30 ring-1 ring-inset ring-white/[0.03] md:p-10">
        <span className="mb-3 inline-block rounded-full border border-sky-400/35 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-200">
          Coming in Phase {phase}
        </span>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-50 md:text-3xl">{title}</h2>
        <p className="mt-3 max-w-xl leading-relaxed text-slate-500">{description}</p>
      </div>
    </div>
  )
}
