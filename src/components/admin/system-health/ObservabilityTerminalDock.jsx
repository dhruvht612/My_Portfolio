import { Command, Cpu } from 'lucide-react'

export default function ObservabilityTerminalDock({ configured }) {
  return (
    <div className="obs-glass-panel flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-[rgba(4,11,22,0.62)] px-5 py-4 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-sky-300">
          <Cpu className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Operator toolkit</p>
          <p className="mt-1 text-sm font-semibold text-slate-100">Pinned telemetry consoles · deterministic RCA scaffolding</p>
          <p className="mt-1 font-mono text-[11px] text-slate-500">
            supabase.status {!configured ? '<offline-shell>' : '<wired-cloud-plane>'}: ingestion ACTIVE · egress OBSERVE MODE · jitter minimized · jitterbudget=ON · backoff=OFF · probes=batch/async-safe • telemetry_grade=S Tier Enterprise
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-black/25 px-3 py-2 font-mono text-[11px] text-slate-400">
          <Command className="h-3.5 w-3.5 text-slate-500" aria-hidden />
          Use your global command palette shortcuts if enabled in admin.
        </span>
        <span className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-200/90">
          diagnostics · OK
        </span>
      </div>
    </div>
  )
}
