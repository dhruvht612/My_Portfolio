import { Mail, Save, ShieldCheck, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'

function firstNameFromSession(session) {
  const raw = session?.user?.user_metadata?.full_name
  if (typeof raw === 'string' && raw.trim()) return raw.trim()
  const email = session?.user?.email
  if (typeof email === 'string' && email.includes('@')) return email.split('@')[0]
  return 'Admin User'
}

export default function AdminAccountProfile() {
  const { session } = useAuth()
  const toast = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)

  const currentName = firstNameFromSession(session)
  const currentEmail = session?.user?.email || ''
  const lastSignIn = session?.user?.last_sign_in_at ? new Date(session.user.last_sign_in_at).toLocaleString() : '—'

  useEffect(() => {
    setName(currentName)
    setEmail(currentEmail)
  }, [currentName, currentEmail])

  const handleSave = async () => {
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

      if (trimmedEmail !== currentEmail) {
        toast.success('Profile saved. Check your inbox to confirm the new email.')
      } else {
        toast.success('Profile updated.')
      }
    } catch (e) {
      toast.error(e.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <AdminPageHeader
        eyebrow="Account"
        title="Profile"
        description="View and edit your admin identity, session details, and account status."
      />

      <section className="admin-card-premium p-5 md:p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-400/25 bg-sky-500/15">
            <UserRound className="h-8 w-8 text-sky-200" />
          </div>
          <div className="grid flex-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Name</p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isSupabaseConfigured || saving}
                className="admin-field-input mt-2 w-full text-sm"
                placeholder="Your name"
              />
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Email</p>
              <div className="mt-2 flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isSupabaseConfigured || saving}
                  className="admin-field-input w-full text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Role</p>
              <p className="mt-2 text-sm font-semibold text-slate-100">Administrator</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Last sign-in</p>
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-200">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                {lastSignIn}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => {
              setName(currentName)
              setEmail(currentEmail)
            }}
            disabled={saving}
            className="theme-btn theme-btn-secondary px-4 py-2 text-sm disabled:opacity-60"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isSupabaseConfigured || saving}
            className="theme-btn theme-btn-primary px-4 py-2 text-sm disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save profile'}
          </button>
          {!isSupabaseConfigured ? (
            <p className="text-xs text-amber-200/90">Configure Supabase auth to edit account profile.</p>
          ) : null}
        </div>
      </section>
    </div>
  )
}
