import { normalizeBadge } from '../../../lib/portfolioFetchers'

/** @returns {{ label: string, icon: string, gradient: string }} */
export function parseProjectBadge(raw) {
  return normalizeBadge(raw)
}

export function badgeLabel(raw) {
  return parseProjectBadge(raw).label
}

/** Persist badge for Supabase (JSON column or text). */
export function serializeProjectBadge(label, existingRaw = null) {
  const trimmed = label?.trim()
  if (!trimmed) return null
  const prev = parseProjectBadge(existingRaw)
  return JSON.stringify({
    label: trimmed,
    icon: prev.icon,
    gradient: prev.gradient,
  })
}
