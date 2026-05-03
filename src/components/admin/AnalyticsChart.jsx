import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

const accent = '#38bdf8'
const muted = '#64748b'
const grid = '#334155'

export default function AnalyticsChart({ kind, data, dataKey = 'value', nameKey = 'name', height = 260, colors }) {
  const palette = colors || ['#38bdf8', '#818cf8', '#34d399', '#fbbf24', '#f472b6', '#94a3b8']

  if (!data?.length) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-muted)]">
        No data for this range
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height }} className="min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        {kind === 'line' ? (
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis dataKey={nameKey} tick={{ fill: muted, fontSize: 11 }} />
            <YAxis tick={{ fill: muted, fontSize: 11 }} allowDecimals={false} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
            <Line type="monotone" dataKey={dataKey} stroke={accent} strokeWidth={2} dot={false} />
          </LineChart>
        ) : kind === 'bar' ? (
          <BarChart layout="vertical" data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} horizontal={false} />
            <XAxis type="number" tick={{ fill: muted, fontSize: 11 }} allowDecimals={false} />
            <YAxis type="category" dataKey={nameKey} width={120} tick={{ fill: muted, fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
            <Bar dataKey={dataKey} fill={accent} radius={[0, 4, 4, 0]} />
          </BarChart>
        ) : (
          <PieChart>
            <Pie data={data} dataKey={dataKey} nameKey={nameKey} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
              {data.map((_, i) => (
                <Cell key={i} fill={palette[i % palette.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
            <Legend wrapperStyle={{ color: muted, fontSize: 12 }} />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
