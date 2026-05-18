import { motion } from 'framer-motion'

export default function EducationLoadingSkeleton() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="edu-workspace space-y-4">
      <motion.div className="edu-shimmer h-36 rounded-2xl" />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          <div className="edu-shimmer h-10 rounded-xl" />
          <div className="edu-shimmer h-64 rounded-2xl" />
          <motion.div className="edu-shimmer h-48 rounded-2xl" />
        </div>
        <div className="space-y-3">
          <div className="edu-shimmer h-40 rounded-2xl" />
          <div className="edu-shimmer h-52 rounded-2xl" />
        </div>
      </div>
    </motion.div>
  )
}
