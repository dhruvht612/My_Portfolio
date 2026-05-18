import { motion } from 'framer-motion'
import { Bell, Bot, Gauge, RefreshCw, Shield, Zap } from 'lucide-react'
import DashboardAnimatedNumber from '../dashboard/DashboardAnimatedNumber'
import { workspaceHealthScore } from './settingsConfig'

function Widget({ icon, title, value, subtitle, tint = 'sky', pulse = false }) {
  const tintClass = `set-widget-${tint}`
  return (
    <motion.div layout whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 420, damping: 30 }} className={`set-widget-card ${tintClass}`}>
      {pulse ? (
        <motion.span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-emerald-400" animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity }} aria-hidden />
      ) : null}
      <div className="relative flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</p>
        <span className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-1 text-slate-200/90">{icon}</span>
      </div>
      <p className="relative mt-2 font-mono text-lg font-semibold tabular-nums text-slate-50">
        {typeof value === 'number' ? <DashboardAnimatedNumber value={value} /> : value}
      </p>
      {subtitle ? <p className="relative mt-1 text-[11px] text-slate-500">{subtitle}</p> : null}
    </motion.div>
  )
}

export default function SettingsStatusWidgets({ settings }) {
  const health = workspaceHealthScore(settings)
  const motionLabel = settings.motionIntensity === 'high' ? 'High' : settings.motionIntensity === 'low' ? 'Low' : 'Balanced'

  return (
    <motion.div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}>
      {[
        { title: 'System health', value: `${health}%`, subtitle: 'Workspace diagnostics', tint: health >= 85 ? 'emerald' : 'amber', icon: <Gauge className="h-4 w-4" />, pulse: health >= 85 },
        { title: 'Motion engine', value: motionLabel, subtitle: 'Animation subsystem', tint: 'sky', icon: <Zap className="h-4 w-4" />, pulse: true },
        { title: 'Workspace sync', value: 'Healthy', subtitle: 'Local config store', tint: 'emerald', icon: <RefreshCw className="h-4 w-4" /> },
        { title: 'AI assistant', value: 'Online', subtitle: 'Optimization mesh', tint: 'violet', icon: <Bot className="h-4 w-4" />, pulse: true },
        { title: 'Security layer', value: settings.sessionProtection === 'hardened' ? 'Hardened' : 'Standard', subtitle: 'Protection status', tint: 'emerald', icon: <Shield className="h-4 w-4" /> },
        { title: 'Alert bus', value: settings.notificationsEnabled ? 'Active' : 'Muted', subtitle: 'Signal routing', tint: 'violet', icon: <Bell className="h-4 w-4" /> },
      ].map((w) => (
        <motion.div key={w.title} variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
          <Widget {...w} />
        </motion.div>
      ))}
    </motion.div>
  )
}
