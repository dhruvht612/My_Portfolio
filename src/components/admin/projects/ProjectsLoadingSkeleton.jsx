import { motion } from 'framer-motion'

export default function ProjectsLoadingSkeleton() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 p-4">
      <div className="proj-shimmer h-28 rounded-2xl" />
      <div className="proj-shimmer h-12 rounded-xl" />
      <motion.div className="proj-shimmer h-48 rounded-2xl" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="proj-shimmer h-56 rounded-2xl" />
        <div className="proj-shimmer h-56 rounded-2xl" />
      </div>
    </motion.div>
  )
}
