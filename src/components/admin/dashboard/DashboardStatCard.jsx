import { Link } from 'react-router-dom'
import StatusBadge from '../StatusBadge'

/** @typedef {'sky' | 'violet' | 'amber' | 'emerald'} Accent */

const accents = {
  sky: {
    bar: 'from-sky-400 to-cyan-400',
    ring: 'hover:shadow-[0_0_0_1px_rgba(56,189,248,0.35),0_20px_40px_-24px_rgba(56,189,248,0.35)]',
    glow: 'from-sky-500/12 via-transparent to-transparent',
  },
  violet: {
    bar: 'from-violet-400 to-fuchsia-400',
    ring: 'hover:shadow-[0_0_0_1px_rgba(167,139,250,0.35),0_20px_40px_-24px_rgba(139,92,246,0.3)]',
    glow: 'from-violet-500/12 via-transparent to-transparent',
  },
  amber: {
    bar: 'from-amber-400 to-orange-400',
    ring: 'hover:shadow-[0_0_0_1px_rgba(251,191,36,0.35),0_20px_40px_-24px_rgba(245,158,11,0.25)]',
    glow: 'from-amber-500/12 via-transparent to-transparent',
  },
  emerald: {
    bar: 'from-emerald-400 to-teal-400',
    ring: 'hover:shadow-[0_0_0_1px_rgba(52,211,153,0.35),0_20px_40px_-24px_rgba(16,185,129,0.25)]',
    glow: 'from-emerald-500/12 via-transparent to-transparent',
  },
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
}) {
  const a = accents[accent] || accents.sky

  return (
    <Link
      to={to}
      className={[
        'group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-lg shadow-black/20 transition-[transform,box-shadow,border-color] duration-200 ease-out',
        'hover:-translate-y-0.5 hover:border-white/[0.14]',
        a.ring,
        featured ? 'min-h-[11.5rem] bg-gradient-to-br from-sky-500/10 via-white/[0.02] to-transparent md:min-h-[12rem] md:p-6' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span
        className={`absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r opacity-90 ${a.bar}`}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${a.glow} opacity-0 transition-opacity duration-200 group-hover:opacity-100`}
        aria-hidden
      />

      <div className="relative flex flex-1 flex-col">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{title}</p>
          <div className="flex flex-wrap justify-end gap-1.5">
            {badges.map((b) => (
              <StatusBadge key={b.label} tone={b.tone ?? 'gray'}>
                {b.label}
              </StatusBadge>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-1 flex-col justify-center">
          {loading ? (
            <div className="space-y-2" aria-hidden>
              <div className="h-9 w-24 animate-pulse rounded-lg bg-white/10 md:h-11 md:w-32" />
              {subtitle ? <div className="h-3 w-40 max-w-full animate-pulse rounded bg-white/[0.06]" /> : null}
            </div>
          ) : (
            <>
              <p
                className={`font-bold tabular-nums tracking-tight text-slate-50 ${
                  featured ? 'text-4xl md:text-5xl' : 'text-3xl md:text-4xl'
                }`}
              >
                {value}
              </p>
              {subtitle ? <p className="mt-2 text-xs leading-relaxed text-slate-500">{subtitle}</p> : null}
            </>
          )}
        </div>
      </div>
    </Link>
  )
}
