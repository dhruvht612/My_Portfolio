import { motion } from 'framer-motion'
import { BadgeCheck, Camera } from 'lucide-react'
import { initialsFromName } from './accountInsights'

export default function AccountAvatarRing({ name, email, avatarUrl, online = true }) {
  const initials = initialsFromName(name, email)

  return (
    <motion.div
      className="relative flex shrink-0 flex-col items-center"
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 380, damping: 24 }}
    >
      <motion.div
        className="acc-avatar-glow absolute inset-0 rounded-full"
        animate={{ opacity: [0.45, 0.75, 0.45], scale: [1, 1.04, 1] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      />
      <div className="acc-avatar-ring relative">
        <svg className="absolute -inset-1 h-[calc(100%+8px)] w-[calc(100%+8px)] -rotate-90" viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="3" />
          <motion.circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="url(#accAvatarGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={289}
            initial={{ strokeDashoffset: 289 }}
            animate={{ strokeDashoffset: 72 }}
            transition={{ type: 'spring', stiffness: 50, damping: 16 }}
          />
          <defs>
            <linearGradient id="accAvatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
        </svg>
        <motion.div
          className="acc-avatar-inner relative flex h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-full border border-white/15 bg-gradient-to-br from-slate-800/90 to-indigo-950/90 text-2xl font-bold tracking-tight text-sky-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
          whileHover={{ boxShadow: '0 0 32px rgba(99,102,241,0.35)' }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span>{initials}</span>
          )}
          <motion.span
            className="absolute inset-0 bg-gradient-to-t from-indigo-500/20 to-transparent opacity-0"
            whileHover={{ opacity: 1 }}
          />
        </motion.div>
        {online ? (
          <motion.span
            className="absolute bottom-1 right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-slate-950 bg-emerald-500"
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            title="Online"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
          </motion.span>
        ) : null}
        <motion.span
          className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-sky-400/30 bg-slate-900/90 text-sky-300 opacity-0 shadow-lg backdrop-blur-sm transition group-hover:opacity-100"
          whileHover={{ scale: 1.08 }}
          title="Avatar managed via auth provider"
        >
          <Camera className="h-3.5 w-3.5" />
        </motion.span>
      </div>
      <motion.span
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 inline-flex items-center gap-1 rounded-full border border-sky-400/25 bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-200/90"
      >
        <BadgeCheck className="h-3 w-3" aria-hidden />
        Verified workspace
      </motion.span>
    </motion.div>
  )
}
