import { cn } from '../../lib/utils'

/**
 * Hero quick-stat tile.
 *
 * Purely CSS-driven interaction: .stat-card in src/styles/interactions.css owns
 * the lift, border, value glow and the detail reveal for both :hover and
 * :focus-within, so there is nothing to gate behind prefers-reduced-motion here
 * (base.css already neuters the transition durations under RM, which leaves the
 * reveal working — just instantly).
 *
 * The card is not a link or a button, so it gets tabIndex={0} rather than a
 * role: that is what lets :focus-within fire for keyboard users. The detail
 * text is always present in the DOM and only visually collapsed (max-height /
 * opacity), never display:none and never aria-hidden, so screen readers read
 * value, label and detail in that order.
 */
export default function HeroStatCard({ value, label, detail, accent = '', className = '' }) {
  return (
    <div className={cn('stat-card', className)} tabIndex={0}>
      <p className={cn('stat-card__value', accent)}>{value}</p>
      <p className="stat-card__label">{label}</p>
      {detail ? <p className="stat-card__detail">{detail}</p> : null}
    </div>
  )
}
