import { useAuth } from '../../hooks/useAuth'

const checklist = [
  { label: 'Phase 1 — Supabase client + context + dev status', done: true },
  { label: 'Phase 2 — Admin auth, layout, routes, page view hook', done: true },
  { label: 'Phase 3+ — Seeding, CRUD, contact sync, analytics dashboard', done: false },
]

export default function AdminDashboard() {
  const { session } = useAuth()
  const email = session?.user?.email ?? 'Admin'

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="glass-card rounded-2xl border border-[var(--color-border)] p-6 md:p-8">
        <h2 className="text-2xl font-bold text-[var(--color-text)]">Welcome back</h2>
        <p className="mt-2 text-[var(--color-text-muted)]">{email}</p>
        <p className="mt-4 text-sm leading-relaxed text-[var(--color-text-muted)]">
          This dashboard will show live stats after Phase 5 (CRUD) and Phase 7 (analytics). Navigation on the left is
          already wired.
        </p>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          Snapshot (placeholders)
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { label: 'Projects', value: '—' },
            { label: 'Certifications', value: '—' },
            { label: 'Messages', value: '—' },
            { label: 'Blog posts', value: '—' },
          ].map((card) => (
            <div
              key={card.label}
              className="glass-card relative overflow-hidden rounded-2xl border border-[var(--color-border)] p-5"
            >
              <span className="absolute right-3 top-3 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Phase 5
              </span>
              <div className="text-3xl font-bold text-[var(--color-text)]">{card.value}</div>
              <div className="mt-1 text-xs uppercase tracking-wide text-[var(--color-text-muted)]">{card.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-[var(--color-border)] p-6 md:p-8">
        <h3 className="text-lg font-semibold text-[var(--color-text)]">What&apos;s wired up</h3>
        <ul className="mt-4 space-y-3">
          {checklist.map((row) => (
            <li key={row.label} className="flex items-start gap-3 text-sm">
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                  row.done
                    ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                    : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                }`}
                aria-hidden
              >
                {row.done ? '✓' : '…'}
              </span>
              <span className={row.done ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}>{row.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
