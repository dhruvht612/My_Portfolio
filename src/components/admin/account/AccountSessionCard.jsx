import { motion } from 'framer-motion'
import { Globe, Laptop, ShieldCheck, Timer } from 'lucide-react'
import { formatRelativeTime } from './accountInsights'

export default function AccountSessionCard({ device, sessionStartedAt, lastSignIn }) {
  const durationMin = sessionStartedAt
    ? Math.max(0, Math.floor((Date.now() - sessionStartedAt) / 60_000))
    : 0

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="acc-glass-card relative overflow-hidden p-4"
    >
      <motion.div
        className="pointer-events-none absolute -right-8 top-0 h-32 w-32 rounded-full bg-sky-500/10 blur-3xl"
        animate={{ opacity: [0.3, 0.55, 0.3] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      <header className="relative mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-500/15">
          <Laptop className="h-4 w-4 text-sky-300" />
        </span>
        <motion.div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-300/90">Active device</p>
          <h3 className="text-sm font-semibold text-slate-100">Current session</h3>
        </motion.div>
      </header>
      <motion.div className="relative flex gap-4">
        <motion.div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/80 to-indigo-950/80"
          whileHover={{ scale: 1.04, boxShadow: '0 0 24px rgba(56,189,248,0.15)' }}
        >
          <Globe className="h-7 w-7 text-sky-200/90" />
        </motion.div>
        <motion.div className="min-w-0 flex-1 space-y-2">
          <p className="text-sm font-semibold text-slate-100">
            {device?.browser} on {device?.os}
          </p>
          <p className="text-xs text-slate-500">{device?.device} · This browser tab</p>
          <motion.div
            className="flex flex-wrap gap-2"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
          >
            <motion.span variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="acc-status-chip">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              Trusted device
            </motion.span>
            <motion.span variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="acc-status-chip">
              <Timer className="h-3 w-3" />
              {durationMin}m session
            </motion.span>
            <motion.span variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="acc-status-chip">
              Auth {formatRelativeTime(lastSignIn)}
            </motion.span>
          </motion.div>
        </motion.div>
        <motion.div
          className="relative hidden shrink-0 flex-col items-center justify-center sm:flex"
          animate={{ rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
        >
          <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
            <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(148,163,184,0.12)" strokeWidth="4" />
            <circle
              cx="28"
              cy="28"
              r="24"
              fill="none"
              stroke="url(#accSessionGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={151}
              strokeDashoffset={38}
            />
            <defs>
              <linearGradient id="accSessionGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute mt-0 text-[9px] font-bold uppercase tracking-wider text-emerald-300">Live</span>
        </motion.div>
      </motion.div>
    </motion.section>
  )
}
