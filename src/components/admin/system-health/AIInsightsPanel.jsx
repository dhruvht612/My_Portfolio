import { BrainCircuit } from 'lucide-react'
import { motion as Motion } from 'framer-motion'
import { useMemo } from 'react'

function avgTail(arr, n) {
  const slice = arr.slice(-n)
  const ms = slice.map((p) => p.ms).filter((x) => x != null)
  if (!ms.length) return null
  return ms.reduce((a, b) => a + b, 0) / ms.length
}

function pctDelta(prev, curr) {
  if (prev == null || curr == null || prev === 0) return null
  return Math.round(((curr - prev) / prev) * 100)
}

/**
 * Deterministic insights from recent probe histories (no LLM — feels “AI-native”).
 */
export default function AIInsightsPanel({ histories, results, apiConfigured }) {
  const insights = useMemo(() => {
    const keys = ['database', 'auth', 'storage', 'frontend', ...(apiConfigured ? ['api'] : [])]
    const lines = []

    const slowest = keys
      .map((k) => ({ key: k, ms: results[k]?.latencyMs }))
      .filter((x) => x.ms != null)
      .sort((a, b) => (b.ms || 0) - (a.ms || 0))[0]

    if (slowest) {
      const label =
        slowest.key === 'database'
          ? 'Database'
          : slowest.key === 'auth'
            ? 'Auth'
            : slowest.key === 'storage'
              ? 'Storage'
              : slowest.key === 'frontend'
                ? 'Frontend'
                : 'API'
      lines.push({
        tone: slowest.ms > 400 ? 'amber' : 'sky',
        title: `${label} is the current latency leader`,
        body: `Last probe measured ${Math.round(slowest.ms)}ms. Watch this node if users report sluggish screens — often correlates with cold starts or regional variance.`,
      })
    }

    for (const k of keys) {
      const h = histories[k] || []
      if (h.length < 6) continue
      const prev = avgTail(h.slice(0, -5), 5)
      const curr = avgTail(h, 5)
      const d = pctDelta(prev, curr)
      if (d == null) continue
      if (k === 'storage' && d >= 8) {
        lines.push({
          tone: 'violet',
          title: 'Storage latency trend is climbing',
          body: `Average over the last 5 checks is ~${d}% higher than the prior window. If you recently shipped media-heavy flows, consider cache headers, smaller thumbnails, or isolating upload bursts.`,
        })
        break
      }
    }

    const degraded = keys.filter((k) => results[k]?.status === 'degraded')
    if (degraded.length) {
      lines.push({
        tone: 'amber',
        title: 'Degraded mode detected on one or more surfaces',
        body: 'Your policy flags anything above ~600ms as degraded. This is usually safe to operate, but it is a leading indicator before hard failures — scale monitoring frequency or add synthetic checks from a second region.',
      })
    }

    const down = keys.filter((k) => results[k]?.status === 'down')
    if (down.length) {
      lines.push({
        tone: 'red',
        title: 'Critical path instability',
        body: 'A probe is failing outright. Focus on shortest path recovery: credentials, outbound networking, CSP blocks on fetch probes, or Supabase maintenance windows.',
      })
    }

    if (!lines.length) {
      lines.push({
        tone: 'emerald',
        title: 'Signals look stable',
        body: 'No strong drift detected in the recent window. Keep shipping — the mesh is behaving predictably.',
      })
    }

    return lines.slice(0, 3)
  }, [histories, results, apiConfigured])

  const border =
    insights[0]?.tone === 'red'
      ? 'from-red-400/55 via-fuchsia-500/25 to-transparent'
      : insights[0]?.tone === 'amber'
        ? 'from-amber-300/55 via-orange-400/22 to-transparent'
        : insights[0]?.tone === 'violet'
          ? 'from-violet-400/55 via-indigo-500/25 to-transparent'
          : 'from-emerald-300/45 via-sky-500/25 to-transparent'

  return (
    <Motion.div layout className={`obs-glass-panel relative overflow-hidden rounded-2xl p-[1px] shadow-[0_18px_60px_rgba(0,0,0,0.45)] bg-gradient-to-br ${border}`}>
      <div className="relative rounded-[calc(1rem-1px)] bg-[rgba(5,10,20,0.78)] px-5 py-4 backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_20%_-10%,rgba(56,189,248,0.12),transparent_55%)]" />
        <div className="relative flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.10] bg-gradient-to-br from-sky-500/25 to-violet-500/15 shadow-[0_0_24px_rgba(56,189,248,0.15)]">
            <BrainCircuit className="h-5 w-5 text-sky-100/90" aria-hidden />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-300/85">AI insight engine</h3>
              <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-200/90">
                synthetic analyst
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Offline heuristics over your probe stream — deterministic, predictable, enterprise-safe.
            </p>
          </div>
        </div>

        <ul className="relative mt-4 space-y-3">
          {insights.map((it, idx) => (
            <li
              key={idx}
              className={`rounded-xl border border-white/[0.07] bg-[rgba(2,10,26,0.45)] px-4 py-3 ring-1 ring-inset shadow-sm ${
                it.tone === 'red'
                  ? 'border-red-400/22 ring-red-400/14'
                  : it.tone === 'amber'
                    ? 'border-amber-400/22 ring-amber-400/12'
                    : it.tone === 'violet'
                      ? 'border-violet-400/22 ring-violet-400/12'
                      : 'border-emerald-400/20 ring-emerald-400/10'
              }`}
            >
              <p className="text-sm font-semibold text-slate-100">{it.title}</p>
              <p className="mt-2 text-[12px] leading-relaxed text-slate-400">{it.body}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <MiniAct label="Recommendation" hint="narrow the slowest node first" />
                <MiniAct label="Playbook" hint="validate env + RLS + network path" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Motion.div>
  )
}

function MiniAct({ label, hint }) {
  return (
    <div className="inline-flex flex-col rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5">
      <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>
      <span className="font-mono text-[10px] text-sky-400/85">{hint}</span>
    </div>
  )
}
