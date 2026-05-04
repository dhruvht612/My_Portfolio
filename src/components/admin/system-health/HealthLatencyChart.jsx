import { useMemo } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'

const grid = '#1e293b'
const muted = '#64748b'

const SERIES = [
  { key: 'database', name: 'Database', stroke: '#34d399' },
  { key: 'auth', name: 'Auth', stroke: '#38bdf8' },
  { key: 'storage', name: 'Storage', stroke: '#a78bfa' },
  { key: 'frontend', name: 'Frontend', stroke: '#fbbf24' },
  { key: 'api', name: 'API', stroke: '#f472b6' },
]

function buildRows(histories, includeApi) {
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

export default function HealthLatencyChart({ histories, includeApi, height = 280 }) {
  const data = useMemo(() => buildRows(histories, includeApi), [histories, includeApi])
  const series = useMemo(() => (includeApi ? SERIES : SERIES.filter((s) => s.key !== 'api')), [includeApi])

  if (!data.length) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl border border-white/[0.07] bg-[#0b0f17]/85 text-sm text-slate-500"
        style={{ height }}
      >
        Latency history will appear after health checks run.
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0b0f17]/85 p-4 shadow-inner ring-1 ring-inset ring-white/[0.04]">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Response time (ms)</p>
      <div style={{ width: '100%', height: height - 40 }} className="min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
            <XAxis dataKey="index" tick={{ fill: muted, fontSize: 10 }} tickFormatter={(v) => `#${v}`} />
            <YAxis tick={{ fill: muted, fontSize: 10 }} width={36} domain={[0, 'auto']} />
            <Tooltip
              contentStyle={{
                background: '#0b0f17',
                border: '1px solid rgba(148,163,184,0.25)',
                borderRadius: 10,
                fontSize: 12,
              }}
              labelFormatter={(idx) => `Check ${idx}`}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: muted }} />
            {series.map((s) => (
              <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.stroke} strokeWidth={2} dot={false} connectNulls />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
