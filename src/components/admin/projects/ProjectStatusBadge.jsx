import { motion } from 'framer-motion'
import { deploymentState } from './projectInsights'

const TONE = {
  emerald: 'proj-status-emerald',
  amber: 'proj-status-amber',
  violet: 'proj-status-violet',
  slate: 'proj-status-slate',
}

export default function ProjectStatusBadge({ row, size = 'sm' }) {
  const { label, tone, key } = deploymentState(row)
  const pulse = key === 'live'

  return (
    <span className={`proj-status-badge ${TONE[tone] || TONE.slate} ${size === 'lg' ? 'proj-status-lg' : ''}`}>
      {pulse ? (
        <motion.span
          className="proj-status-dot"
          animate={{ opacity: [1, 0.4, 1], scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      ) : (
        <span className="proj-status-dot" />
      )}
      {label.toUpperCase()}
    </span>
  )
}
