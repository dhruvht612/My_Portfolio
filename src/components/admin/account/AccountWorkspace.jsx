import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../../hooks/useAuth'
import { useToast } from '../../../hooks/useToast'
import { isSupabaseConfigured, supabase } from '../../../lib/supabase'
import AccountActivityTimeline from './AccountActivityTimeline'
import AccountAIInsights from './AccountAIInsights'
import AccountAmbient from './AccountAmbient'
import AccountHeroPanel from './AccountHeroPanel'
import AccountIdentitySection from './AccountIdentitySection'
import AccountSecurityPanel from './AccountSecurityPanel'
import AccountSessionCard from './AccountSessionCard'
import AccountStatusWidgets from './AccountStatusWidgets'
import AccountStickyFooter from './AccountStickyFooter'
import {
  buildInitialActivity,
  parseUserAgent,
  securityHealthScore,
} from './accountInsights'

function firstNameFromSession(session) {
  const raw = session?.user?.user_metadata?.full_name
  if (typeof raw === 'string' && raw.trim()) return raw.trim()
  const email = session?.user?.email
  if (typeof email === 'string' && email.includes('@')) return email.split('@')[0]
  return 'Admin User'
}

export default function AccountWorkspace() {
  const { session } = useAuth()
  const toast = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveState, setSaveState] = useState('idle')
  const [sessionStartedAt] = useState(() => Date.now())
  const [activity, setActivity] = useState([])

  const currentName = firstNameFromSession(session)
  const currentEmail = session?.user?.email || ''
  const lastSignIn = session?.user?.last_sign_in_at
  const avatarUrl = session?.user?.user_metadata?.avatar_url
  const emailConfirmed = Boolean(session?.user?.email_confirmed_at)
  const role = 'Administrator'

  const device = useMemo(() => parseUserAgent(typeof navigator !== 'undefined' ? navigator.userAgent : ''), [])

  const isDirty = name.trim() !== currentName.trim() || email.trim() !== currentEmail.trim()
  const nameError = !name.trim() ? 'Name cannot be empty' : ''
  const emailError = !email.trim() ? 'Email cannot be empty' : ''

  useEffect(() => {
    setName(currentName)
    setEmail(currentEmail)
  }, [currentName, currentEmail])

  useEffect(() => {
    setActivity(buildInitialActivity(session))
  }, [session])

  useEffect(() => {
    if (isDirty) setSaveState('dirty')
    else if (saveState === 'dirty') setSaveState('idle')
  }, [isDirty, saveState])

  const sessionUptimeMin = Math.max(0, Math.floor((Date.now() - sessionStartedAt) / 60_000))

  const securityScore = securityHealthScore({
    supabaseConfigured: isSupabaseConfigured,
    session,
    emailChanged: email.trim() !== currentEmail,
  })

  const pushActivity = useCallback((event) => {
    setActivity((prev) => [{ ...event, id: `${event.type}-${Date.now()}`, at: Date.now() }, ...prev].slice(0, 12))
  }, [])

  const handleSave = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    if (!trimmedName) {
      toast.error('Name cannot be empty.')
      return
    }
    if (!trimmedEmail) {
      toast.error('Email cannot be empty.')
      return
    }

    setSaving(true)
    try {
      const updatePayload = { data: { full_name: trimmedName } }
      if (trimmedEmail !== currentEmail) updatePayload.email = trimmedEmail
      const { error } = await supabase.auth.updateUser(updatePayload)
      if (error) throw error

      pushActivity({
        type: 'profile',
        label: 'Profile updated',
        detail: trimmedEmail !== currentEmail ? 'Email change pending verification' : 'Identity fields persisted',
      })

      if (trimmedEmail !== currentEmail) {
        toast.success('Profile saved. Check your inbox to confirm the new email.')
      } else {
        toast.success('Profile updated.')
      }
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2400)
    } catch (e) {
      toast.error(e.message || 'Failed to update profile.')
      setSaveState('dirty')
    } finally {
      setSaving(false)
    }
  }, [name, email, currentEmail, pushActivity, toast])

  const handleReset = useCallback(() => {
    setName(currentName)
    setEmail(currentEmail)
    pushActivity({ type: 'settings', label: 'Form reset', detail: 'Identity fields restored from session' })
    setSaveState('idle')
  }, [currentName, currentEmail, pushActivity])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        void handleSave()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleSave])

  const insightContext = {
    name,
    email,
    role,
    lastSignIn,
    supabaseConfigured: isSupabaseConfigured,
    isDirty,
    device,
    sessionActive: Boolean(session),
  }

  return (
    <AccountAmbient className="acc-workspace min-h-[min(88vh,920px)] border border-white/[0.06] p-3 md:p-4">
      <motion.div
        className="space-y-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.06 } },
        }}
      >
        <AccountHeroPanel
          name={name}
          email={email}
          role={role}
          lastSignIn={lastSignIn}
          supabaseConfigured={isSupabaseConfigured}
          sessionActive={Boolean(session)}
          device={device}
          avatarUrl={avatarUrl}
          isDirty={isDirty}
        />

        <AccountStatusWidgets
          securityScore={securityScore}
          sessionUptimeMin={sessionUptimeMin}
          supabaseConfigured={isSupabaseConfigured}
        />

        <motion.div
          variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
          className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]"
        >
          <motion.div
            className="space-y-4"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          >
            <AccountIdentitySection
              name={name}
              email={email}
              onNameChange={setName}
              onEmailChange={setEmail}
              disabled={!isSupabaseConfigured || saving}
              nameError={nameError && isDirty ? nameError : ''}
              emailError={emailError && isDirty ? emailError : ''}
              role={role}
              lastSignIn={lastSignIn}
            />
            <AccountSecurityPanel
              lastSignIn={lastSignIn}
              device={device}
              emailConfirmed={emailConfirmed}
              supabaseConfigured={isSupabaseConfigured}
            />
            <AccountSessionCard device={device} sessionStartedAt={sessionStartedAt} lastSignIn={lastSignIn} />
          </motion.div>

          <motion.aside
            className="space-y-4"
            variants={{ hidden: { opacity: 0, x: 8 }, visible: { opacity: 1, x: 0 } }}
          >
            <AccountAIInsights context={insightContext} />
            <AccountActivityTimeline events={activity} />
          </motion.aside>
        </motion.div>

        <AccountStickyFooter
          saveState={saveState}
          saving={saving}
          disabled={!isSupabaseConfigured || saving || !isDirty}
          onReset={handleReset}
          onSave={() => void handleSave()}
          supabaseConfigured={isSupabaseConfigured}
        />
      </motion.div>
    </AccountAmbient>
  )
}
