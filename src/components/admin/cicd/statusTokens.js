/**
 * Presentation tokens for CI/CD status.
 *
 * One mapping from a domain status to its colour, icon and label, so a passing
 * build looks identical in the pipeline graph, the history table, the drawer
 * and the activity feed. Colours follow the existing admin language: cyan/sky
 * for in-flight, emerald for healthy, amber for warnings, rose for genuine
 * failures, violet for secondary signal, slate for inert.
 */

import { AlertTriangle, Check, CircleDashed, Loader2, MinusCircle, X } from 'lucide-react'

/**
 * @typedef {object} StatusToken
 * @property {string} label
 * @property {import('lucide-react').LucideIcon} icon
 * @property {string} text     Text colour class.
 * @property {string} border   Border colour class.
 * @property {string} bg       Surface tint class.
 * @property {string} dot      Indicator background class.
 * @property {string} glow     Box-shadow class used sparingly on active nodes.
 * @property {string} hex      Raw colour for SVG strokes and gradients.
 */

/** @type {Record<string, StatusToken>} */
export const RUN_STATUS = {
  passed: {
    label: 'Passed',
    icon: Check,
    text: 'text-emerald-300',
    border: 'border-emerald-400/30',
    bg: 'bg-emerald-500/[0.08]',
    dot: 'bg-emerald-400',
    glow: 'shadow-[0_0_0_1px_rgba(52,211,153,0.14)]',
    hex: '#34d399',
  },
  running: {
    label: 'Running',
    icon: Loader2,
    text: 'text-sky-300',
    border: 'border-sky-400/40',
    bg: 'bg-sky-500/[0.10]',
    dot: 'bg-sky-400',
    glow: 'shadow-[0_0_0_1px_rgba(56,189,248,0.25),0_8px_32px_rgba(56,189,248,0.12)]',
    hex: '#38bdf8',
  },
  warning: {
    label: 'Warning',
    icon: AlertTriangle,
    text: 'text-amber-300',
    border: 'border-amber-400/30',
    bg: 'bg-amber-500/[0.08]',
    dot: 'bg-amber-400',
    glow: 'shadow-[0_0_0_1px_rgba(251,191,36,0.16)]',
    hex: '#fbbf24',
  },
  failed: {
    label: 'Failed',
    icon: X,
    text: 'text-rose-300',
    border: 'border-rose-400/35',
    bg: 'bg-rose-500/[0.09]',
    dot: 'bg-rose-400',
    glow: 'shadow-[0_0_0_1px_rgba(251,113,133,0.20)]',
    hex: '#fb7185',
  },
  queued: {
    label: 'Queued',
    icon: CircleDashed,
    text: 'text-slate-400',
    border: 'border-white/[0.10]',
    bg: 'bg-white/[0.03]',
    dot: 'bg-slate-500',
    glow: '',
    hex: '#94a3b8',
  },
  skipped: {
    label: 'Skipped',
    icon: MinusCircle,
    text: 'text-slate-500',
    border: 'border-white/[0.08]',
    bg: 'bg-white/[0.02]',
    dot: 'bg-slate-600',
    glow: '',
    hex: '#64748b',
  },
}

/** @type {Record<string, StatusToken>} */
export const HEALTH_LEVEL = {
  healthy: { ...RUN_STATUS.passed, label: 'Healthy' },
  degraded: { ...RUN_STATUS.warning, label: 'Degraded' },
  critical: { ...RUN_STATUS.failed, label: 'Critical' },
  active: {
    label: 'Active',
    icon: Loader2,
    text: 'text-violet-300',
    border: 'border-violet-400/30',
    bg: 'bg-violet-500/[0.09]',
    dot: 'bg-violet-400',
    glow: 'shadow-[0_0_0_1px_rgba(167,139,250,0.16)]',
    hex: '#a78bfa',
  },
  unknown: { ...RUN_STATUS.queued, label: 'Unknown' },
}

/** Activity-feed tone tokens. */
export const TONE = {
  success: { text: 'text-emerald-300', dot: 'bg-emerald-400', ring: 'ring-emerald-400/20' },
  warning: { text: 'text-amber-300', dot: 'bg-amber-400', ring: 'ring-amber-400/20' },
  error: { text: 'text-rose-300', dot: 'bg-rose-400', ring: 'ring-rose-400/20' },
  info: { text: 'text-violet-300', dot: 'bg-violet-400', ring: 'ring-violet-400/20' },
}

/** Log level tokens for the terminal panel. */
export const LOG_LEVEL = {
  INFO: { text: 'text-sky-300/90', bg: 'bg-sky-500/10' },
  PASS: { text: 'text-emerald-300', bg: 'bg-emerald-500/10' },
  WARN: { text: 'text-amber-300', bg: 'bg-amber-500/10' },
  FAIL: { text: 'text-rose-300', bg: 'bg-rose-500/10' },
  DEBUG: { text: 'text-slate-400', bg: 'bg-white/5' },
}

/** Levels the "errors only" log filter keeps. */
export const ERROR_LOG_LEVELS = ['WARN', 'FAIL']

export const statusToken = (status) => RUN_STATUS[status] || RUN_STATUS.queued
export const healthToken = (level) => HEALTH_LEVEL[level] || HEALTH_LEVEL.unknown

/* ------------------------------------------------------------- formatting */

/** `102` -> `1m 42s`; `48` -> `48s`. */
export function formatDuration(seconds) {
  if (seconds == null || Number.isNaN(seconds)) return '—'
  const s = Math.max(0, Math.round(seconds))
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const rem = s % 60
  if (m < 60) return rem ? `${m}m ${rem}s` : `${m}m`
  const h = Math.floor(m / 60)
  return `${h}h ${m % 60}m`
}

/** Compact relative time: `18m ago`, `4h ago`, `2d ago`. */
export function formatRelative(iso) {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  if (Number.isNaN(diff)) return '—'
  const sec = Math.round(diff / 1000)
  if (sec < 60) return sec <= 5 ? 'just now' : `${sec}s ago`
  const min = Math.round(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.round(hr / 24)
  return `${day}d ago`
}

/** Wall-clock time, e.g. `11:54 AM`. */
export function formatClock(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

/** `11:53:02` for log gutters. */
export function formatLogTime(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '--:--:--'
  return d.toLocaleTimeString(undefined, { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

/** Thousands separators without dragging in a formatting library. */
export const formatCount = (n) => (typeof n === 'number' ? n.toLocaleString() : '—')

/** Percentage with one decimal unless it is a whole number. */
export function formatPct(n, digits = 1) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '—'
  return `${Number.isInteger(n) ? n : n.toFixed(digits)}%`
}

/**
 * Writes to the clipboard, resolving to `true` on success.
 * Falls back to a hidden textarea where the async API is blocked (non-secure origins).
 */
export async function copyText(value) {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(value)
      return true
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const el = document.createElement('textarea')
    el.value = value
    el.setAttribute('readonly', '')
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(el)
    return ok
  } catch {
    return false
  }
}
