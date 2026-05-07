import { memo, useMemo } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

const TooltipBody = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const p = payload[0]?.payload
  if (!p) return null
  return (
    <div className="rounded-lg border border-white/[0.1] bg-[rgba(5,10,20,0.92)] px-2.5 py-1.5 shadow-xl backdrop-blur-md">
      <p className="font-mono text-[10px] text-slate-500">{p.label}</p>
      <p className="font-mono text-sm font-semibold text-slate-100">{p.v} views</p>
    </div>
  )
}

function DashboardTrafficMiniInner({ series }) {
  const data = useMemo(() => {
    if (!Array.isArray(series)) return []
    return series.map((s) => ({
      label: s.day,
      v: s.count,
    }))
  }, [series])

  return (
    <div className="obs-glass-panel h-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[rgba(5,11,22,0.6)] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl ring-1 ring-inset ring-white/[0.04]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-400/85">Visitors</p>
          <h3 className="mt-1 text-sm font-semibold text-slate-100">Traffic field</h3>
          <p className="mt-0.5 text-[11px] text-slate-500">Last 14-day window · realtime curve</p>
        </div>
      </div>
      <div className="mt-3 h-[148px] w-full">
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: -16, right: 0, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="dash-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={false} axisLine={false} height={0} />
              <Tooltip content={<TooltipBody />} />
              <Area type="monotone" dataKey="v" stroke="#7dd3fc" strokeWidth={2} fill="url(#dash-area)" dot={false} isAnimationActive animationDuration={620} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border border-white/[0.05] bg-black/20 font-mono text-xs text-slate-500">
            No traffic samples
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(DashboardTrafficMiniInner)
