import { motion } from 'framer-motion'

export default function SkillsLoadingSkeleton() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 p-4">
      <div className="adm-sk-shimmer h-28 rounded-2xl" />
      <div className="adm-sk-shimmer h-12 rounded-xl" />
      <div className="adm-sk-shimmer h-40 rounded-2xl" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="adm-sk-shimmer h-44 rounded-2xl" />
        <div className="adm-sk-shimmer h-44 rounded-2xl" />
      </div>
    </motion.div>
  )
}
