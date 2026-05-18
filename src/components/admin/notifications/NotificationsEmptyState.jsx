import { motion } from 'framer-motion'
import { CheckCircle2, Sparkles } from 'lucide-react'

export default function NotificationsEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="notif-empty-state relative overflow-hidden rounded-2xl border border-emerald-400/20 p-10 text-center"
    >
      <motion.div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(52,211,153,0.12),transparent_65%)]" animate={{ opacity: [0.5, 0.85, 0.5] }} transition={{ duration: 5, repeat: Infinity }} />
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 24, repeat: Infinity, ease: 'linear' }} className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10">
        <CheckCircle2 className="h-8 w-8 text-emerald-300" />
      </motion.div>
      <h3 className="relative text-lg font-semibold text-emerald-100">All systems stable</h3>
      <p className="relative mt-2 text-sm text-slate-400">Workspace calm — no active signals in this view. Monitoring remains online.</p>
      <motion.p className="relative mt-4 inline-flex items-center gap-1.5 text-xs text-violet-300/90" animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 3, repeat: Infinity }}>
        <Sparkles className="h-3.5 w-3.5" />
        AI idle state · operational health summary available
      </motion.p>
    </motion.div>
  )
}
