import { motion } from 'framer-motion'
import { BrainCircuit, Fingerprint, Shield, Sparkles, Terminal } from 'lucide-react'
import AccountAvatarRing from './AccountAvatarRing'
import { formatRelativeTime, generateAccountInsights } from './accountInsights'

export default function AccountHeroPanel({
  name,
  email,
  role,
  lastSignIn,
  supabaseConfigured,
  sessionActive,
  device,
  avatarUrl,
  isDirty,
}) {
  const insights = generateAccountInsights({
    name,
    email,
    role,
    lastSignIn,
    supabaseConfigured,
    isDirty,
    device,
    sessionActive,
  })
  const headline = insights[0]

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 90, damping: 18 }}
      className="acc-hero-panel relative overflow-hidden rounded-2xl border border-white/[0.08] p-4 md:p-5"
    >
      <motion.div
        className="acc-hero-banner pointer-events-none absolute inset-0"
        animate={{ opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 6, repeat: Infinity }}
        aria-hidden
      />
      <div className="relative grid gap-5 lg:grid-cols-[auto_1fr] lg:items-center">
        <AccountAvatarRing name={name} email={email} avatarUrl={avatarUrl} online={sessionActive} />
        <motion.div
          className="min-w-0 space-y-3"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.08 }}
        >
          <motion.div
            className="flex flex-wrap items-center gap-2"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.06 } },
            }}
          >
            <motion.span variants={{ hidden: { opacity: 0, y: 6 }, visible: { opacity: 1, y: 0 } }} className="acc-pill">
              <Terminal className="h-3.5 w-3.5" aria-hidden />
              Identity OS
            </motion.span>
            {sessionActive ? (
              <motion.span variants={{ hidden: { opacity: 0, y: 6 }, visible: { opacity: 1, y: 0 } }} className="acc-pill acc-pill-live">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Session active
              </motion.span>
            ) : null}
            <motion.span variants={{ hidden: { opacity: 0, y: 6 }, visible: { opacity: 1, y: 0 } }} className="acc-pill acc-pill-secure">
              <Shield className="h-3 w-3" aria-hidden />
              {supabaseConfigured ? 'Protected' : 'Offline'}
            </motion.span>
          </motion.div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-white md:text-2xl">{name || 'Workspace identity'}</h2>
            <p className="mt-1 truncate text-sm text-slate-400">{email || 'Connect auth to bind your admin email'}</p>
          </div>
          {headline ? (
            <motion.div
              key={headline.title}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="acc-insight-snippet flex gap-2 rounded-xl border border-indigo-400/20 bg-indigo-400/[0.06] px-3 py-2.5"
            >
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-indigo-300" aria-hidden />
              <motion.div animate={{ opacity: [0.92, 1, 0.92] }} transition={{ duration: 4, repeat: Infinity }}>
                <p className="text-xs font-medium text-indigo-100">{headline.title}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{headline.body}</p>
              </motion.div>
            </motion.div>
          ) : null}
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
            <span className="acc-status-chip">
              <Fingerprint className="h-3 w-3 text-violet-300" />
              {role} workspace active
            </span>
            <span className="acc-status-chip">
              Last secure sign-in {formatRelativeTime(lastSignIn)}
            </span>
            <span className="acc-status-chip text-emerald-300/90">
              {supabaseConfigured ? 'Workspace synced successfully' : 'Awaiting auth configuration'}
            </span>
          </div>
        </motion.div>
      </div>
      <div className="relative mt-3 flex items-center gap-2 border-t border-white/[0.06] pt-3 text-[10px] uppercase tracking-[0.16em] text-slate-500">
        <BrainCircuit className="h-3.5 w-3.5 text-indigo-400/80" />
        Identity command center · live session mesh
      </div>
    </motion.section>
  )
}
