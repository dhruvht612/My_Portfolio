import { AlertTriangle, ArrowRightLeft, Cpu, Gauge, Globe2, Radio, Zap } from 'lucide-react'
import { motion as Motion } from 'framer-motion'

function Widget({ icon, title, value, subtitle, tint = 'sky' }) {
  const tintMap = {
    sky: 'border-sky-400/15 shadow-[0_0_38px_rgba(56,189,248,0.08)]',
    amber: 'border-amber-400/18 shadow-[0_0_38px_rgba(251,191,36,0.06)]',
    emerald: 'border-emerald-400/18 shadow-[0_0_38px_rgba(52,211,153,0.07)]',
    violet: 'border-violet-400/18 shadow-[0_0_38px_rgba(167,139,250,0.06)]',
  }

  return (
    <Motion.div
      layout
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
      className={`obs-glass-panel relative overflow-hidden rounded-xl border bg-[rgba(4,12,26,0.55)] px-4 py-3 backdrop-blur-xl ring-1 ring-inset ring-white/[0.04] transition hover:bg-[rgba(4,14,28,0.62)] ${tintMap[tint] || tintMap.sky}`}
    >
      <div className="pointer-events-none absolute -right-6 -top-10 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.11),transparent_65%)]" />
      <div className="relative flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</p>
        <span className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-1 text-slate-200/90">{icon}</span>
      </div>
      <p className="relative mt-2 font-mono text-xl font-semibold tabular-nums text-slate-50">{value}</p>
      {subtitle ? <p className="relative mt-1 text-[11px] text-slate-500">{subtitle}</p> : null}
    </Motion.div>
  )
}

/**
 * Lightweight operational widgets derived from probes (no fabrication of fake infra regions).
 */
export default function ObservabilityWidgets({ results, events, probeSuccessRate, avgLatencyMs, errorPct, checksPerCycle }) {
  const lastIncident =
    events.find((e) => e.severity === 'critical') ||
    events.find((e) => e.severity === 'warning') ||
    events[0] ||
    null

  const activeAlerts =
    ['database', 'auth', 'storage', 'frontend', 'api'].filter((k) => results[k]?.status === 'down' || results[k]?.status === 'degraded').length

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Widget
        title="Active alerts"
        value={activeAlerts}
        subtitle="Nodes not fully operational right now."
        tint={activeAlerts ? 'amber' : 'emerald'}
        icon={<AlertTriangle className="h-4 w-4" aria-hidden />}
      />
      <Widget
        title="Last signal"
        value={lastIncident ? lastIncident.message.slice(0, 38) + (lastIncident.message.length > 38 ? '…' : '') : 'Nominal'}
        subtitle={lastIncident ? new Date(lastIncident.at).toLocaleString() : 'Waiting for drift…'}
        tint={lastIncident?.severity === 'critical' ? 'amber' : 'sky'}
        icon={<Radio className="h-4 w-4" aria-hidden />}
      />
      <Widget
        title="Probe success rate"
        value={probeSuccessRate != null ? `${probeSuccessRate}%` : '—'}
        subtitle="Across recent sampled checks."
        tint="emerald"
        icon={<Zap className="h-4 w-4" aria-hidden />}
      />
      <Widget
        title="Avg latency"
        value={avgLatencyMs != null ? `${Math.round(avgLatencyMs)}ms` : '—'}
        subtitle="Mean of last datapoints across probes."
        tint="violet"
        icon={<Gauge className="h-4 w-4" aria-hidden />}
      />
      <Widget
        title="Error footprint"
        value={errorPct != null ? `${errorPct}%` : '—'}
        subtitle="Estimated from non-operational snapshots."
        tint={errorPct && errorPct > 5 ? 'amber' : 'sky'}
        icon={<Cpu className="h-4 w-4" aria-hidden />}
      />
      <Widget
        title="Edge plane"
        value="Global CDN"
        subtitle="Frontend probe represents your routed edge origin."
        tint="sky"
        icon={<Globe2 className="h-4 w-4" aria-hidden />}
      />
      <Widget
        title="Service dependencies"
        value="Supabase mesh"
        subtitle="Auth + Postgres + Storage on shared control plane."
        tint="violet"
        icon={<ArrowRightLeft className="h-4 w-4" aria-hidden />}
      />
      <Widget
        title="Probe fan-out"
        value={`${checksPerCycle ?? 5} parallel`}
        subtitle="Concurrent checks executed each ingest window."
        tint="emerald"
        icon={<Gauge className="h-4 w-4 rotate-90" aria-hidden />}
      />
    </div>
  )
}
