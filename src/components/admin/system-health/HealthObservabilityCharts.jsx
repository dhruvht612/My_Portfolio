import { useMemo, useState } from 'react'
import { motion as Motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from 'recharts'

const grid = '#1e293b'
const muted = '#64748b'

const SERIES = [
  { key: 'database', name: 'Database', stroke: '#34d399' },
  { key: 'auth', name: 'Auth', stroke: '#38bdf8' },
  { key: 'storage', name: 'Storage', stroke: '#a78bfa' },
  { key: 'frontend', name: 'Frontend', stroke: '#fbbf24' },
  { key: 'api', name: 'API', stroke: '#fb7185' },
]

function buildLatencyRows(histories, includeApi) {
  const keys = includeApi ? ['database', 'auth', 'storage', 'frontend', 'api'] : ['database', 'auth', 'storage', 'frontend']
  const lengths = keys.map((k) => (histories[k] || []).length)
  const L = Math.max(0, ...lengths)
  const rows = []
  for (let i = 0; i < L; i++) {
    const row = { index: i + 1 }
    for (const k of keys) {
      const h = histories[k] || []
      const offset = L - h.length
      const pt = i >= offset ? h[i - offset] : null
      row[k] = pt?.ms ?? null
    }
    rows.push(row)
  }
  return rows
}

function buildHealthRows(histories, includeApi) {
  const score = (pt) => {
    if (!pt) return null
    if (pt.status === 'operational') return 100
    if (pt.status === 'degraded') return 55
    if (pt.status === 'down') return 0
    return null
  }
  const keys = includeApi ? ['database', 'auth', 'storage', 'frontend', 'api'] : ['database', 'auth', 'storage', 'frontend']
  const lengths = keys.map((k) => (histories[k] || []).length)
  const L = Math.max(0, ...lengths)
  const rows = []
  for (let i = 0; i < L; i++) {
    const row = { index: i + 1 }
    for (const k of keys) {
      const h = histories[k] || []
      const offset = L - h.length
      const pt = i >= offset ? h[i - offset] : null
      row[k] = score(pt)
    }
    rows.push(row)
  }
  return rows
}

function buildErrorRows(histories, includeApi) {
  const val = (pt) => {
    if (!pt) return null
    if (pt.status === 'down') return 100
    if (pt.status === 'degraded') return 35
    return 0
  }
  const keys = includeApi ? ['database', 'auth', 'storage', 'frontend', 'api'] : ['database', 'auth', 'storage', 'frontend']
  const lengths = keys.map((k) => (histories[k] || []).length)
  const L = Math.max(0, ...lengths)
  const rows = []
  for (let i = 0; i < L; i++) {
    const row = { index: i + 1 }
    for (const k of keys) {
      const h = histories[k] || []
      const offset = L - h.length
      const pt = i >= offset ? h[i - offset] : null
      row[k] = val(pt)
    }
    rows.push(row)
  }
  return rows
}

const TooltipShell = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-white/[0.10] bg-[rgba(5,11,22,0.92)] px-3 py-2 shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">Sample {label}</p>
      <div className="mt-2 space-y-1">
        {payload.map((p) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-6 font-mono text-[11px]">
            <span className="text-slate-400">{p.name}</span>
            <span className="tabular-nums text-slate-100">{p.value == null ? '—' : p.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** @typedef {'latency'|'health'|'errors'} MetricMode */

export default function HealthObservabilityCharts({ histories, includeApi, height = 330 }) {
  const [mode, setMode] = useState(/** @type {MetricMode} */ ('latency'))

  const latency = useMemo(() => buildLatencyRows(histories, includeApi), [histories, includeApi])
  const health = useMemo(() => buildHealthRows(histories, includeApi), [histories, includeApi])
  const errors = useMemo(() => buildErrorRows(histories, includeApi), [histories, includeApi])

  const data = mode === 'latency' ? latency : mode === 'health' ? health : errors
  const series = useMemo(() => (includeApi ? SERIES : SERIES.filter((s) => s.key !== 'api')), [includeApi])

  const chartHeight = height - 52

  return (
    <div className="obs-glass-panel overflow-hidden rounded-2xl border border-white/[0.08] bg-[rgba(5,11,22,0.72)] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.35)] ring-1 ring-inset ring-white/[0.04] backdrop-blur-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-400/80">Telemetry</p>
          <h3 className="mt-1 text-sm font-semibold text-slate-100">Interactive observability traces</h3>
          <p className="mt-0.5 text-[11px] text-slate-500">Toggle metrics · smooth transitions · production-grade tooltips</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <MetricToggle active={mode === 'latency'} onClick={() => setMode('latency')} label="Latency" />
          <MetricToggle active={mode === 'health'} onClick={() => setMode('health')} label="Health index" />
          <MetricToggle active={mode === 'errors'} onClick={() => setMode('errors')} label="Risk load" />
        </div>
      </div>

      {!data.length ? (
        <div
          className="mt-3 flex items-center justify-center rounded-xl border border-white/[0.06] bg-black/25 font-mono text-sm text-slate-500"
          style={{ height: chartHeight }}
        >
          Stream warming… charts appear after ingest.
        </div>
      ) : (
        <div className="mt-3 w-full min-h-[220px]" style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            {mode === 'errors' ? (
              <BarChart data={data} margin={{ top: 6, right: 14, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                <XAxis dataKey="index" tick={{ fill: muted, fontSize: 10 }} tickFormatter={(v) => `#${v}`} />
                <YAxis tick={{ fill: muted, fontSize: 10 }} width={44} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<TooltipShell />} />
                <Legend wrapperStyle={{ fontSize: 11, color: muted }} />
                {series.map((s) => (
                  <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.stroke} radius={[8, 8, 0, 0]} opacity={0.85} />
                ))}
              </BarChart>
            ) : mode === 'health' ? (
              <AreaChart data={data} margin={{ top: 6, right: 14, left: -10, bottom: 0 }}>
                <defs>
                  {series.map((s) => (
                    <linearGradient key={s.key} id={`area-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={s.stroke} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={s.stroke} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                <XAxis dataKey="index" tick={{ fill: muted, fontSize: 10 }} tickFormatter={(v) => `#${v}`} />
                <YAxis tick={{ fill: muted, fontSize: 10 }} width={40} domain={[0, 100]} />
                <Tooltip content={<TooltipShell />} />
                <Legend wrapperStyle={{ fontSize: 11, color: muted }} />
                {series.map((s) => (
                  <Area
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.name}
                    stroke={s.stroke}
                    fillOpacity={1}
                    fill={`url(#area-${s.key})`}
                    strokeWidth={2}
                    isAnimationActive
                    dot={false}
                    connectNulls
                  />
                ))}
              </AreaChart>
            ) : (
              <LineChart data={data} margin={{ top: 6, right: 14, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                <XAxis dataKey="index" tick={{ fill: muted, fontSize: 10 }} tickFormatter={(v) => `#${v}`} />
                <YAxis tick={{ fill: muted, fontSize: 10 }} width={38} domain={[0, 'auto']} />
                <Tooltip content={<TooltipShell />} />
                <Legend wrapperStyle={{ fontSize: 11, color: muted }} />
                {series.map((s) => (
                  <Line
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.name}
                    stroke={s.stroke}
                    strokeWidth={2.25}
                    dot={false}
                    connectNulls
                    isAnimationActive
                    animationDuration={450}
                  />
                ))}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      <p className="mt-3 text-[11px] text-slate-600">
        {mode === 'latency' && 'Latency in ms — failures render as gaps. Degraded thresholds match your probe policy (~600ms).'}
        {mode === 'health' && 'Synthetic health index per sample: operational=100, degraded=55, down=0.'}
        {mode === 'errors' && 'Risk load is a readability proxy — down samples weigh heavier than degraded.'}
      </p>
    </div>
  )
}

function MetricToggle({ active, onClick, label }) {
  return (
    <Motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition ${
        active
          ? 'border-sky-400/35 bg-gradient-to-r from-sky-500/20 to-violet-500/15 text-sky-50 shadow-[0_0_22px_rgba(56,189,248,0.10)]'
          : 'border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-white/[0.14] hover:bg-white/[0.05]'
      }`}
    >
      {label}
    </Motion.button>
  )
}
