import { BrainCircuit, Target } from 'lucide-react'
import DashboardTrafficMini from './DashboardTrafficMini'

function Meter({ label, pct, tone = 'sky' }) {
  const p = Math.max(0, Math.min(100, pct ?? 0))
  const stroke =
    tone === 'emerald' ? 'from-emerald-400 to-teal-400' : tone === 'violet' ? 'from-violet-400 to-indigo-400' : 'from-sky-400 to-cyan-400'
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-[11px]">
        <span className="font-semibold uppercase tracking-wide text-slate-500">{label}</span>
        <span className="font-mono text-slate-200">{Math.round(p)}%</span>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full border border-white/[0.06] bg-black/30">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${stroke} transition-[width] duration-[900ms] ease-out`}
          style={{ width: `${p}%` }}
        />
      </div>
    </div>
  )
}

/**
 * Portfolio health + synthetic AI insight column + traffic spark.
 */
export default function DashboardPortfolioIntel({ insights, health, trafficSeries }) {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)_minmax(0,1fr)]">
      <div className="rounded-2xl border border-white/[0.08] bg-[rgba(5,11,22,0.6)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl ring-1 ring-inset ring-white/[0.05]">
        <div className="flex items-center gap-2 border-b border-white/[0.06] pb-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.09] bg-white/[0.04] text-emerald-300">
            <Target className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Health matrix</p>
            <h3 className="text-sm font-semibold text-slate-100">Portfolio vitals</h3>
          </div>
        </div>
        <div className="mt-5 space-y-4">
          <Meter label="Completion" pct={health.completion} tone="sky" />
          <Meter label="Momentum" pct={health.momentum} tone="violet" />
          <Meter label="Content freshness" pct={health.freshness} tone="emerald" />
          <Meter label="Reach signal" pct={health.visibility} tone="sky" />
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[rgba(5,11,22,0.6)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl ring-1 ring-[rgba(56,189,248,0.08)]">
        <div className="flex items-start gap-3 border-b border-white/[0.06] pb-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-sky-400/25 bg-gradient-to-br from-sky-500/20 to-violet-600/15 text-sky-100">
            <BrainCircuit className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-400/85">AI desk</p>
            <h3 className="text-sm font-semibold text-slate-100">Strategic readouts</h3>
            <p className="mt-1 text-[11px] text-slate-500">Heuristic copilot — deterministic, always on.</p>
          </div>
        </div>
        <ul className="mt-5 space-y-3">
          {(insights || []).map((line, i) => (
            <li key={i} className="rounded-xl border border-white/[0.06] bg-[rgba(2,8,23,0.45)] px-4 py-3 ring-1 ring-inset ring-white/[0.03]">
              <p className="text-[13px] leading-relaxed text-slate-300">{line}</p>
            </li>
          ))}
        </ul>
      </div>

      <DashboardTrafficMini series={trafficSeries} />
    </div>
  )
}
