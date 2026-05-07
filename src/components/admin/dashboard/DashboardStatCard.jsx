import { Link } from 'react-router-dom'
import { useId } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import StatusBadge from '../StatusBadge'
import DashboardAnimatedNumber from './DashboardAnimatedNumber'

/** @typedef {'sky' | 'violet' | 'amber' | 'emerald'} Accent */

const accents = {
  sky: {
    bar: 'from-sky-400 to-cyan-400',
    ring: 'hover:shadow-[0_0_0_1px_rgba(56,189,248,0.35),0_24px_48px_-20px_rgba(56,189,248,0.28)]',
    glow: 'from-sky-500/14 via-transparent to-transparent',
    spark: '#38bdf8',
  },
  violet: {
    bar: 'from-violet-400 to-fuchsia-400',
    ring: 'hover:shadow-[0_0_0_1px_rgba(167,139,250,0.35),0_24px_48px_-24px_rgba(139,92,246,0.28)]',
    glow: 'from-violet-500/14 via-transparent to-transparent',
    spark: '#a78bfa',
  },
  amber: {
    bar: 'from-amber-400 to-orange-400',
    ring: 'hover:shadow-[0_0_0_1px_rgba(251,191,36,0.35),0_24px_48px_-24px_rgba(245,158,11,0.22)]',
    glow: 'from-amber-500/14 via-transparent to-transparent',
    spark: '#fbbf24',
  },
  emerald: {
    bar: 'from-emerald-400 to-teal-400',
    ring: 'hover:shadow-[0_0_0_1px_rgba(52,211,153,0.35),0_24px_48px_-24px_rgba(16,185,129,0.22)]',
    glow: 'from-emerald-500/14 via-transparent to-transparent',
    spark: '#34d399',
  },
}

function MiniSpark({ series, stroke }) {
  const gid = useId().replace(/:/g, '')
  const vals = Array.isArray(series) ? series.map((x) => Number(x)).filter((x) => !Number.isNaN(x)) : []
  if (vals.length < 2)
    return <div className="h-[44px] w-full rounded-xl border border-white/[0.05] bg-white/[0.02]" aria-hidden />
  const W = 240
  const H = 48
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const span = Math.max(1e-6, max - min)
  const pts = vals
    .map((v, i) => {
      const x = (i / Math.max(vals.length - 1, 1)) * W
      const y = H - ((v - min) / span) * (H - 8) - 4
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-5 h-[44px] w-full opacity-90" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.32} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={`${pts} L ${W} ${H} L 0 ${H} Z`} fill={`url(#${gid})`} opacity={0.75} />
      <path d={pts} fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

function HaloRing({ pct, stroke }) {
  const p = Math.max(0, Math.min(100, pct ?? 0))
  const r = 18
  const c = 2 * Math.PI * r
  const off = c * (1 - p / 100)
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" className="opacity-95" aria-hidden>
      <circle cx="26" cy="26" r={r} fill="transparent" stroke="rgba(148,163,184,0.14)" strokeWidth="4" />
      <circle
        cx="26"
        cy="26"
        r={r}
        fill="none"
        stroke={stroke}
        strokeWidth="4"
        strokeDasharray={c}
        strokeDashoffset={off}
        strokeLinecap="round"
        transform="rotate(-90 26 26)"
        style={{ filter: 'drop-shadow(0 0 8px rgba(56,189,248,0.15))', transition: 'stroke-dashoffset 0.85s cubic-bezier(.16,1,.3,1)' }}
      />
    </svg>
  )
}

/**
 * @param {{
 *   title: string
 *   value: import('react').ReactNode
 *   subtitle?: string
 *   badges?: { label: string, tone?: 'green' | 'amber' | 'gray' | 'blue' | 'red' }[]
 *   accent: Accent
 *   to: string
 *   featured?: boolean
 *   loading?: boolean
 *   className?: string
 *   sparkSeries?: number[]
 *   ringPct?: number | null
 *   deltaLabel?: string | null
 *   deltaPositive?: boolean | null
 * }} props
 */
export default function DashboardStatCard({
  title,
  value,
  subtitle,
  badges = [],
  accent,
  to,
  featured = false,
  loading = false,
  className = '',
  sparkSeries,
  ringPct,
  deltaLabel,
  deltaPositive,
}) {
  const a = accents[accent] || accents.sky
  const numericValue = typeof value === 'number' && !Number.isNaN(value)

  return (
    <Link
      to={to}
      className={[
        'group/dash-card relative flex flex-col overflow-hidden rounded-[20px] border border-white/[0.08] bg-[rgba(5,11,22,0.58)] shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-[transform,box-shadow,border-color] duration-300 ease-out',
        'dash-glass-ring hover:-translate-y-1 hover:border-white/[0.12]',
        a.ring,
        featured ? 'min-h-[12.5rem] md:min-h-[13rem] md:p-7 p-6' : 'min-h-[10.75rem] p-5 md:p-6',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className={`absolute left-0 right-0 top-0 h-[3px] bg-gradient-to-r ${a.bar} opacity-[0.95]`} aria-hidden />
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${a.glow} opacity-0 transition-opacity duration-400 group-hover/dash-card:opacity-100`} />

      <div className="relative flex flex-1 flex-col">
        {ringPct != null && numericValue ? (
          <div className="absolute right-4 top-4 z-[1]" title={`Coverage ${Math.round(ringPct)}%`}>
            <HaloRing pct={ringPct} stroke={a.spark} />
          </div>
        ) : null}

        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</p>
          <div className="flex flex-wrap justify-end gap-1.5">
            {badges.map((b) => (
              <StatusBadge key={b.label} tone={b.tone ?? 'gray'}>
                {b.label}
              </StatusBadge>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-1 flex-col">
          {loading ? (
            <div className="space-y-2" aria-hidden>
              <div className="h-11 w-32 animate-pulse rounded-xl bg-white/[0.08]" />
              <div className="h-3 w-48 max-w-full animate-pulse rounded bg-white/[0.05]" />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-end gap-2">
                <p className={`font-bold tabular-nums tracking-tight text-slate-50 ${featured ? 'text-[2.85rem] leading-none md:text-[3.2rem]' : 'text-[2.1rem] md:text-[2.45rem]'}`}>
                  {numericValue ? <DashboardAnimatedNumber value={value} /> : value}
                </p>
                {deltaLabel ? (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                      deltaPositive === true
                        ? 'border-emerald-400/35 bg-emerald-500/10 text-emerald-200'
                        : deltaPositive === false
                          ? 'border-amber-400/35 bg-amber-500/10 text-amber-100'
                          : 'border-white/[0.12] bg-white/[0.04] text-slate-400'
                    }`}
                  >
                    {deltaPositive === true ? <TrendingUp className="h-3 w-3" aria-hidden /> : null}
                    {deltaPositive === false ? <TrendingDown className="h-3 w-3" aria-hidden /> : null}
                    {deltaLabel}
                  </span>
                ) : null}
              </div>
              {subtitle ? <p className="mt-2 text-xs leading-relaxed text-slate-500">{subtitle}</p> : null}
            </>
          )}
        </div>

        {!loading && sparkSeries?.length ? <MiniSpark series={sparkSeries} stroke={a.spark} /> : null}
      </div>
    </Link>
  )
}
