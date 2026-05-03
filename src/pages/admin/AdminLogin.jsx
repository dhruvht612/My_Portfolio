import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SkipLink from '../../components/SkipLink'
import { useAuth } from '../../hooks/useAuth'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'

export default function AdminLogin() {
  const navigate = useNavigate()
  const { session, loading, configured } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && configured && session) {
      navigate('/admin', { replace: true })
    }
  }, [loading, configured, session, navigate])

  const inputClass =
    'w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/70 px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!supabase) {
      setError('Supabase is not configured.')
      return
    }
    setSubmitting(true)
    const { error: signError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setSubmitting(false)
    if (signError) {
      setError(signError.message || 'Could not sign in.')
      return
    }
    navigate('/admin', { replace: true })
  }

  if (loading && configured) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'transparent' }}>
        <div
          className="h-10 w-10 rounded-full border-2 border-[var(--color-accent)]/30 border-t-[var(--color-accent)]"
          style={{ animation: 'spin 0.7s linear infinite' }}
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12" style={{ background: 'transparent' }}>
      <SkipLink />
      <main id="main-content" className="w-full max-w-sm">
        <div className="glass-card rounded-2xl border border-[var(--color-border)] p-8 shadow-xl">
          <div className="mb-6 text-center">
            <span className="mb-2 inline-block rounded-full border border-[var(--color-accent)]/35 bg-[var(--color-accent)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)]">
              Admin
            </span>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">Sign in</h1>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">Portfolio admin portal</p>
          </div>

          {!isSupabaseConfigured ? (
            <div
              className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100"
              role="status"
            >
              <p className="font-semibold text-amber-50">Supabase not configured</p>
              <p className="mt-2 text-amber-100/90">
                Add <code className="rounded bg-black/20 px-1">VITE_SUPABASE_URL</code> and{' '}
                <code className="rounded bg-black/20 px-1">VITE_SUPABASE_ANON_KEY</code> to{' '}
                <code className="rounded bg-black/20 px-1">.env.local</code>, then restart{' '}
                <code className="rounded bg-black/20 px-1">npm run dev</code>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="admin-email" className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">
                  Email
                </label>
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="admin-password" className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">
                  Password
                </label>
                <input
                  id="admin-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>
              {error ? (
                <p className="text-sm text-red-300" role="alert">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={submitting}
                className="theme-btn theme-btn-primary w-full py-3 text-sm font-semibold disabled:opacity-60"
              >
                {submitting ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-[var(--color-text-muted)]">
            <Link to="/home" className="text-[var(--color-accent)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] rounded">
              Back to site
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
