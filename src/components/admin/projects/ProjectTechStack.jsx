import { motion } from 'framer-motion'

export default function ProjectTechStack({ stack = [], max = 6, compact = false }) {
  const tags = stack.filter(Boolean).slice(0, max)
  if (!tags.length) return <span className="text-[10px] text-slate-600">No stack tagged</span>

  return (
    <div className={`flex flex-wrap gap-1 ${compact ? '' : 'gap-1.5'}`}>
      {tags.map((t, i) => (
        <motion.span
          key={t}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.04 }}
          whileHover={{ scale: 1.06, y: -1 }}
          className="proj-tech-chip"
        >
          {t}
        </motion.span>
      ))}
      {stack.length > max ? (
        <span className="proj-tech-chip opacity-60">+{stack.length - max}</span>
      ) : null}
    </div>
  )
}
