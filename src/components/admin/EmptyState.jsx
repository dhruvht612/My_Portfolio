export default function EmptyState({ title = 'Nothing here yet', message, action }) {
  return (
    <div className="glass-card rounded-2xl border border-[var(--color-border)] p-10 text-center">
      <p className="text-lg font-semibold text-[var(--color-text)]">{title}</p>
      {message ? <p className="mt-2 text-sm text-[var(--color-text-muted)]">{message}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
