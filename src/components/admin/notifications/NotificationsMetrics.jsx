import { motion } from 'framer-motion'
import { Activity, Bell, Gauge, Radio, Zap } from 'lucide-react'
import DashboardAnimatedNumber from '../dashboard/DashboardAnimatedNumber'

function Widget({ icon, title, value, suffix = '', subtitle, tint = 'violet', pulse = false }) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 420, damping: 30 }} className={`notif-widget-card notif-widget-${tint}`}>
      {pulse ? (
        <motion.span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-emerald-400" animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity }} aria-hidden />
      ) : null}
      <motion.div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</p>
        <span className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-1">{icon}</span>
      </motion.div>
      <p className="relative mt-2 font-mono text-lg font-semibold tabular-nums text-slate-50">
        {typeof value === 'number' ? <DashboardAnimatedNumber value={value} /> : value}
        {suffix}
      </p>
      {subtitle ? <p className="relative mt-1 text-[11px] text-slate-500">{subtitle}</p> : null}
    </motion.div>
  )
}

export default function NotificationsMetrics({ metrics }) {
  const items = [
    { title: 'Active alerts', value: metrics.activeAlerts, subtitle: 'Inbox signals', tint: 'amber', icon: <Bell className="h-4 w-4" />, pulse: metrics.activeAlerts > 0 },
    { title: 'AI filtered', value: metrics.aiFiltered, subtitle: 'Classified passive', tint: 'violet', icon: <Zap className="h-4 w-4" /> },
    { title: 'Uptime', value: metrics.uptime, suffix: '%', subtitle: 'Operational plane', tint: 'emerald', icon: <Gauge className="h-4 w-4" />, pulse: true },
    { title: 'Velocity', value: metrics.velocity, subtitle: 'Signals / window', tint: 'sky', icon: <Activity className="h-4 w-4" /> },
    { title: 'Response rate', value: metrics.responseRate, suffix: '%', subtitle: 'Resolved ratio', tint: 'cyan', icon: <Radio className="h-4 w-4" /> },
    { title: 'Activity score', value: metrics.health, suffix: '%', subtitle: 'Workspace health', tint: 'emerald', icon: <Gauge className="h-4 w-4" /> },
  ]

  return (
    <motion.div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}>
      {items.map((w) => (
        <motion.div key={w.title} variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
          <Widget {...w} />
        </motion.div>
      ))}
    </motion.div>
  )
}
