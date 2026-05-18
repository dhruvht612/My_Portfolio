import { motion } from 'framer-motion'
import { Crown, Mail, Shield, UserRound } from 'lucide-react'
import AccountGlassField from './AccountGlassField'

function InfoCard({ icon, label, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -2 }}
      className="acc-info-card group"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 transition group-hover:border-indigo-400/25 group-hover:text-indigo-200">
          {icon}
        </span>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      </div>
      {children}
    </motion.div>
  )
}

export default function AccountIdentitySection({
  name,
  email,
  onNameChange,
  onEmailChange,
  disabled,
  nameError,
  emailError,
  role,
  lastSignIn,
}) {
  return (
    <section className="acc-glass-card p-4 md:p-5">
      <header className="mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-500/15">
          <UserRound className="h-4 w-4 text-sky-300" />
        </span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-300/90">Identity</p>
          <h3 className="text-sm font-semibold text-slate-100">Account information</h3>
        </div>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        <InfoCard icon={<UserRound className="h-4 w-4" />} label="Display name" delay={0.05}>
          <AccountGlassField
            label="Full name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            disabled={disabled}
            error={nameError}
            hint="Shown across admin headers and workspace context"
          />
        </InfoCard>
        <InfoCard icon={<Mail className="h-4 w-4" />} label="Email address" delay={0.1}>
          <AccountGlassField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            disabled={disabled}
            error={emailError}
            hint="Changing email triggers a confirmation link"
          />
        </InfoCard>
        <InfoCard icon={<Crown className="h-4 w-4" />} label="Role hierarchy" delay={0.15}>
          <div className="rounded-xl border border-violet-400/20 bg-violet-500/[0.06] px-3 py-3">
            <p className="text-lg font-semibold text-violet-100">{role}</p>
            <p className="mt-1 text-[11px] text-slate-500">Full portfolio CMS · analytics · content modules</p>
          </div>
        </InfoCard>
        <InfoCard icon={<Shield className="h-4 w-4" />} label="Session activity" delay={0.2}>
          <motion.div
            className="rounded-xl border border-emerald-400/20 bg-emerald-500/[0.06] px-3 py-3"
            animate={{ boxShadow: ['0 0 0 rgba(52,211,153,0)', '0 0 20px rgba(52,211,153,0.08)', '0 0 0 rgba(52,211,153,0)'] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <p className="text-sm font-medium text-emerald-100">Active session</p>
            <p className="mt-1 text-[11px] text-slate-400">
              Last sign-in {lastSignIn ? new Date(lastSignIn).toLocaleString() : '—'}
            </p>
          </motion.div>
        </InfoCard>
      </div>
    </section>
  )
}
