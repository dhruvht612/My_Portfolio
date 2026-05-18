import { motion } from 'framer-motion'
import { KeyRound, Lock, MapPin, MonitorSmartphone, Shield, Timer } from 'lucide-react'
import { formatRelativeTime } from './accountInsights'

function SecurityRow({ icon, label, value, status = 'ok' }) {
  const statusClass =
    status === 'ok'
      ? 'acc-trust-ok'
      : status === 'warn'
        ? 'acc-trust-warn'
        : 'acc-trust-neutral'

  return (
    <motion.div
      whileHover={{ x: 2 }}
      className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 transition hover:border-indigo-400/15 hover:bg-white/[0.04]"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-300">
        {icon}
      </span>
      <motion.div
        className="min-w-0 flex-1"
        animate={{ opacity: [0.92, 1, 0.92] }}
        transition={{ duration: 5, repeat: Infinity, delay: Math.random() * 2 }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
        <p className="mt-0.5 truncate text-sm text-slate-200">{value}</p>
      </motion.div>
      <span className={`acc-trust-chip ${statusClass}`}>{status === 'ok' ? 'Trusted' : status === 'warn' ? 'Review' : '—'}</span>
    </motion.div>
  )
}

export default function AccountSecurityPanel({ lastSignIn, device, emailConfirmed, supabaseConfigured }) {
  const location = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Local'

  return (
    <section className="acc-glass-card p-4">
      <header className="mb-3 flex items-center justify-between gap-2">
        <motion.div
          className="flex items-center gap-2"
          animate={{ opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/15">
            <Shield className="h-4 w-4 text-emerald-300" />
          </span>
          <motion.div animate={{ opacity: [0.85, 1, 0.85] }} transition={{ duration: 4, repeat: Infinity }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300/90">Security mesh</p>
            <h3 className="text-sm font-semibold text-slate-100">Account protection</h3>
          </motion.div>
        </motion.div>
        <motion.span
          className="acc-protection-pulse inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-200"
          animate={{ boxShadow: ['0 0 0 rgba(52,211,153,0)', '0 0 16px rgba(52,211,153,0.2)', '0 0 0 rgba(52,211,153,0)'] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Realtime protection
        </motion.span>
      </header>
      <motion.div
        className="space-y-2"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.05 } },
        }}
      >
        <motion.div variants={{ hidden: { opacity: 0, y: 6 }, visible: { opacity: 1, y: 0 } }}>
          <SecurityRow
            icon={<Timer className="h-4 w-4" />}
            label="Last login"
            value={lastSignIn ? new Date(lastSignIn).toLocaleString() : '—'}
            status="ok"
          />
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 6 }, visible: { opacity: 1, y: 0 } }}>
          <SecurityRow
            icon={<MonitorSmartphone className="h-4 w-4" />}
            label="Active session"
            value={`${device?.browser || 'Browser'} · ${device?.os || 'OS'} · ${device?.device || 'Desktop'}`}
            status="ok"
          />
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 6 }, visible: { opacity: 1, y: 0 } }}>
          <SecurityRow
            icon={<MapPin className="h-4 w-4" />}
            label="Login context"
            value={location}
            status="ok"
          />
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 6 }, visible: { opacity: 1, y: 0 } }}>
          <SecurityRow
            icon={<KeyRound className="h-4 w-4" />}
            label="Authentication health"
            value={
              supabaseConfigured
                ? emailConfirmed
                  ? 'Email verified · JWT session'
                  : 'Session active · verify email for full trust'
                : 'Auth provider not configured'
            }
            status={supabaseConfigured ? (emailConfirmed ? 'ok' : 'warn') : 'warn'}
          />
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 6 }, visible: { opacity: 1, y: 0 } }}>
          <SecurityRow
            icon={<Lock className="h-4 w-4" />}
            label="Session protection"
            value={`Hardened · last activity ${formatRelativeTime(lastSignIn)}`}
            status={supabaseConfigured ? 'ok' : 'warn'}
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
