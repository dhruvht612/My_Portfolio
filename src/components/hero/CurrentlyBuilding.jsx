import { motion } from 'framer-motion'
import { EASE } from '../../lib/motion'
import { useReducedMotion } from '../../hooks/useReducedMotion'

/**
 * Compact "Currently Building" glass card.
 *
 * Sits under the hero CTAs — deliberately quiet so it never competes with them.
 * Styling hooks (.build-card / .build-card__pulse) live in styles/interactions.css.
 *
 * @param {{ data?: { label: string, name: string, description: string, tags: string[] }, className?: string }} props
 */
export default function CurrentlyBuilding({ data, className = '' }) {
  const reduced = useReducedMotion()

  if (!data) return null

  const tags = Array.isArray(data.tags) ? data.tags : []

  const motionProps = reduced
    ? { initial: false, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, ease: EASE.emphasized },
      }

  return (
    <motion.div {...motionProps} className={`build-card w-full max-w-sm mx-auto text-left ${className}`.trim()}>
      <div className="flex items-center gap-2">
        <span className="build-card__pulse" aria-hidden="true" />
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
          {data.label}
        </span>
      </div>

      <div>
        <p className="text-base font-semibold leading-tight text-[var(--color-text)]">{data.name}</p>
        {data.description ? (
          <p className="mt-1 text-[0.8rem] leading-snug text-[var(--color-text-muted)] sm:truncate">
            {data.description}
          </p>
        ) : null}
      </div>

      {tags.length > 0 ? (
        <ul className="flex flex-wrap items-center gap-x-1.5 gap-y-1 font-mono text-[0.66rem] tracking-[0.04em] text-[var(--color-text-muted)]">
          {tags.map((tag, index) => (
            <li key={tag} className="flex items-center gap-x-1.5">
              {index > 0 ? <span aria-hidden="true">·</span> : null}
              <span>{tag}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </motion.div>
  )
}
