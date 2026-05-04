const rail = {
  info: 'bg-sky-500/80',
  warning: 'bg-amber-400/90',
  critical: 'bg-red-500/90',
}

export default function ActivityFeed({ events }) {
  return (
    <div className="flex max-h-[min(520px,55vh)] flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0b0f17]/85 ring-1 ring-inset ring-white/[0.04]">
      <div className="border-b border-white/[0.06] px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-100">Activity</h3>
        <p className="text-[11px] text-slate-500">Recent status changes and latency events</p>
      </div>
      <ul className="flex-1 space-y-0 overflow-y-auto p-2">
        {!events?.length ? (
          <li className="rounded-lg px-3 py-8 text-center text-sm text-slate-500">Waiting for the first health check cycle…</li>
        ) : (
          events.map((e) => (
            <li
              key={e.id}
              className="flex gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.03]"
            >
              <span className={`mt-1.5 h-2 w-0.5 shrink-0 rounded-full ${rail[e.severity] || rail.info}`} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] leading-snug text-slate-200">{e.message}</p>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600">
                  {e.at ? new Date(e.at).toLocaleString() : ''}
                </p>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
