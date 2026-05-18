import { motion } from 'framer-motion'
import { Bell, Bot, Clock, RefreshCw, ShieldCheck, Wifi } from 'lucide-react'
import DashboardAnimatedNumber from '../dashboard/DashboardAnimatedNumber'

function Widget({ icon, title, value, suffix = '', subtitle, tint = 'sky', pulse = false }) {
  const tintMap = {
    sky: 'acc-widget-sky',
    emerald: 'acc-widget-emerald',
    violet: 'acc-widget-violet',
    amber: 'acc-widget-amber',
  }

  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
      className={`acc-widget-card ${tintMap[tint] || tintMap.sky}`}
    >
      {pulse ? (
        <motion.span
          className="absolute right-3 top-3 h-2 w-2 rounded-full bg-emerald-400"
          animate={{ scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
          aria-hidden
        />
      ) : null}
      <motion.div
        className="pointer-events-none absolute -right-6 -top-10 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.12),transparent_65%)]"
        animate={{ opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.div
        className="relative flex items-center justify-between gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</p>
        <span className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-1 text-slate-200/90">{icon}</span>
      </motion.div>
      <p className="relative mt-2 font-mono text-lg font-semibold tabular-nums text-slate-50">
        {typeof value === 'number' ? <DashboardAnimatedNumber value={value} /> : value}
        {suffix}
      </p>
      {subtitle ? <p className="relative mt-1 text-[11px] text-slate-500">{subtitle}</p> : null}
    </motion.div>
  )
}

export default function AccountStatusWidgets({
  securityScore,
  sessionUptimeMin,
  supabaseConfigured,
  notificationsEnabled = true,
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
      <Widget
        title="Security health"
        value={`${securityScore}%`}
        subtitle="Auth + session integrity"
        tint={securityScore >= 85 ? 'emerald' : 'amber'}
        icon={<ShieldCheck className="h-4 w-4" />}
        pulse={securityScore >= 85}
      />
      <Widget
        title="Workspace sync"
        value={supabaseConfigured ? 'Live' : 'Local'}
        subtitle={supabaseConfigured ? 'Supabase identity mesh' : 'Configure env keys'}
        tint={supabaseConfigured ? 'emerald' : 'amber'}
        icon={<RefreshCw className="h-4 w-4" />}
      />
      <Widget
        title="Notifications"
        value={notificationsEnabled ? 'Armed' : 'Muted'}
        subtitle="Admin alert channel"
        tint="sky"
        icon={<Bell className="h-4 w-4" />}
      />
      <Widget
        title="AI assistance"
        value="Online"
        subtitle="Deterministic workspace insights"
        tint="violet"
        icon={<Bot className="h-4 w-4" />}
        pulse
      />
      <Widget
        title="Session uptime"
        value={sessionUptimeMin}
        suffix=" min"
        subtitle="Current browser session"
        tint="sky"
        icon={<Clock className="h-4 w-4" />}
      />
      <Widget
        title="Device trust"
        value="Trusted"
        subtitle="This device fingerprint"
        tint="emerald"
        icon={<Wifi className="h-4 w-4" />}
        pulse
      />
    </div>
  )
}

