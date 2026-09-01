import { motion as Motion } from 'framer-motion'
import { Check, Copy } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { useToast } from '../../../hooks/useToast'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { CICD_COPY } from '../../../constants/cicdStrings'
import { copyText, statusToken } from './statusTokens'

/**
 * Shared display primitives for the CI/CD page.
 *
 * These carry the page's visual grammar — panel chrome, status pills, counters,
 * sparklines — so the ten sections stay consistent without each re-deriving
 * spacing, borders and motion.
 */

/* ------------------------------------------------------------------- panel */

/**
 * Section shell: hairline border, glass fill, optional heading row.
 * `as` lets a section render as <section> while keeping the same chrome.
 */
export function CicdPanel({
  title,
  subtitle,
  icon: Icon,
  actions,
  children,
  className = '',
  bodyClassName = '',
  as: Tag = 'section',
  labelledBy,
}) {
  const autoId = useId()
  const headingId = title ? `${autoId}-heading` : labelledBy

  return (
    <Tag
      aria-labelledby={headingId}
      className={`relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[rgba(6,10,18,0.6)] shadow-[0_12px_40px_rgba(0,0,0,0.32)] backdrop-blur-xl transition-colors duration-200 hover:border-white/[0.13] ${className}`}
    >
      {title ? (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            {Icon ? (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-sky-300/90">
                <Icon className="h-3.5 w-3.5" aria-hidden />
              </span>
            ) : null}
            <div className="min-w-0">
              <h2 id={headingId} className="truncate text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                {title}
              </h2>
              {subtitle ? <p className="mt-0.5 truncate text-xs text-slate-500">{subtitle}</p> : null}
            </div>
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}
      <div className={bodyClassName || 'p-4 sm:p-5'}>{children}</div>
    </Tag>
  )
}

/* -------------------------------------------------------------- status pill */

/** Status chip with the shared icon + colour for a run status. */
export function StatusPill({ status, label, size = 'md', showIcon = true }) {
  const token = statusToken(status)
  const Icon = token.icon
  const compact = size === 'sm'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${token.border} ${token.bg} ${token.text} ${
        compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'
      }`}
    >
      {showIcon ? (
        <Icon className={`${compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} ${status === 'running' ? 'animate-spin' : ''}`} aria-hidden />
      ) : null}
      {label || token.label}
    </span>
  )
}

/** Small coloured dot, optionally pulsing for live states. */
export function StatusDot({ status, pulse = false, className = '' }) {
  const token = statusToken(status)
  return (
    <span className={`relative flex h-2 w-2 ${className}`} aria-hidden>
      {pulse ? <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${token.dot}`} /> : null}
      <span className={`relative inline-flex h-2 w-2 rounded-full ${token.dot}`} />
    </span>
  )
}

/* ---------------------------------------------------------------- count-up */

/**
 * Counts a number up on mount. Snaps straight to the value under
 * prefers-reduced-motion so the figure is never withheld from the reader.
 */
export function CountUp({ value, decimals = 0, suffix = '', duration = 760, className = '' }) {
  const reduced = useReducedMotion()
  const animatable = !reduced && typeof value === 'number'

  // `progress` is the eased 0..1 position, not the number itself, so the
  // rendered figure stays derived from the current `value` prop. A value that
  // changes mid-flight is picked up on the next frame instead of animating
  // toward a stale target.
  const [progress, setProgress] = useState(animatable ? 0 : 1)
  const frame = useRef(0)

  useEffect(() => {
    if (!animatable) return undefined
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      // easeOutCubic — fast settle, no bounce.
      setProgress(1 - Math.pow(1 - t, 3))
      if (t < 1) frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
  }, [duration, animatable])

  const text =
    typeof value === 'number'
      ? (value * (animatable ? progress : 1)).toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : value

  return (
    <span className={`tabular-nums ${className}`}>
      {text}
      {suffix}
    </span>
  )
}

/* --------------------------------------------------------------- sparkline */

/**
 * Compact trend line. Draws itself once on mount unless motion is reduced.
 * Decorative by default — pair it with a text value for the actual number.
 */
export function Sparkline({ points = [], stroke = '#38bdf8', width = 72, height = 24, fill = true, className = '' }) {
  const reduced = useReducedMotion()
  const gradientId = useId()

  if (!points.length) return <div style={{ width, height }} className={className} aria-hidden />

  const min = Math.min(...points)
  const max = Math.max(...points)
  const span = max - min || 1
  const step = points.length > 1 ? width / (points.length - 1) : width

  const coords = points.map((v, i) => [i * step, height - ((v - min) / span) * (height - 2) - 1])
  const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${line} L${width},${height} L0,${height} Z`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className} aria-hidden focusable="false">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill ? <path d={area} fill={`url(#${gradientId})`} /> : null}
      <Motion.path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduced ? false : { pathLength: 0, opacity: 0.4 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={reduced ? { duration: 0 } : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  )
}

/* -------------------------------------------------------------- meter / bar */

/** Horizontal meter. `tone` accepts a hex so it can follow status colour. */
export function Meter({ value, max = 100, tone = '#34d399', label, className = '' }) {
  const reduced = useReducedMotion()
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0
  return (
    <div
      className={`h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06] ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <Motion.div
        className="h-full rounded-full"
        style={{ background: tone }}
        initial={reduced ? false : { width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={reduced ? { duration: 0 } : { duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  )
}

/* ------------------------------------------------------------- copy button */

/**
 * Copies a value and confirms inline. Used for commit hashes, where a toast
 * alone would be too heavy for something the user does repeatedly.
 */
export function CopyChip({ value, label, title, className = '' }) {
  const toast = useToast()
  const [copied, setCopied] = useState(false)
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const onCopy = async (event) => {
    event.stopPropagation()
    const ok = await copyText(value)
    if (!ok) {
      toast.error(CICD_COPY.toasts.copyFailed)
      return
    }
    setCopied(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      title={title || `Copy ${value}`}
      aria-label={title || `Copy ${value}`}
      className={`group/copy inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[11px] text-slate-300 transition-colors duration-200 hover:border-sky-400/35 hover:bg-sky-500/[0.08] hover:text-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 ${className}`}
    >
      {label ?? value}
      {copied ? (
        <Check className="h-3 w-3 text-emerald-400" aria-hidden />
      ) : (
        <Copy className="h-3 w-3 text-slate-500 transition-colors group-hover/copy:text-sky-300" aria-hidden />
      )}
    </button>
  )
}

/* ----------------------------------------------------------------- tooltip */

/**
 * Hover/focus tooltip. Uses `role="tooltip"` wired through aria-describedby so
 * it is announced rather than being a purely visual affordance.
 */
export function Tooltip({ label, children, placement = 'top', className = '' }) {
  const id = useId()
  const [open, setOpen] = useState(false)

  return (
    <span
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span aria-describedby={open ? id : undefined} className="inline-flex">
        {children}
      </span>
      {open ? (
        <span
          id={id}
          role="tooltip"
          className={`pointer-events-none absolute left-1/2 z-30 w-max max-w-[15rem] -translate-x-1/2 rounded-lg border border-white/[0.10] bg-[rgba(4,8,18,0.96)] px-2.5 py-1.5 text-[11px] font-medium leading-snug text-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.5)] ${
            placement === 'bottom' ? 'top-[calc(100%+6px)]' : 'bottom-[calc(100%+6px)]'
          }`}
        >
          {label}
        </span>
      ) : null}
    </span>
  )
}

/* ------------------------------------------------------------ misc chrome */

/** Muted key/value row used inside detail panels and drawers. */
export function DetailRow({ label, value, mono = false }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <dt className="shrink-0 text-[11px] uppercase tracking-[0.12em] text-slate-500">{label}</dt>
      <dd className={`min-w-0 truncate text-right text-[13px] text-slate-200 ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  )
}

/** Neutral empty state for filtered lists. */
export function EmptyNote({ icon: Icon, title, hint, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      {Icon ? (
        <span className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-slate-500">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      ) : null}
      <p className="text-sm font-medium text-slate-300">{title}</p>
      {hint ? <p className="max-w-sm text-xs leading-relaxed text-slate-500">{hint}</p> : null}
      {action}
    </div>
  )
}

/**
 * Shimmer block for skeleton states.
 *
 * A `block`-displayed span rather than a div: skeletons routinely stand in for
 * a value inside a `<p>` or `<dd>`, and a div there is invalid nesting that
 * React will warn about.
 */
export function Skeleton({ className = '', style }) {
  return <span className={`block animate-pulse rounded-lg bg-white/[0.05] ${className}`} style={style} aria-hidden />
}
