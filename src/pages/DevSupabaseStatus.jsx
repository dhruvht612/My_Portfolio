import { useState } from 'react'
import { Link } from 'react-router-dom'
import SkipLink from '../components/SkipLink'
import { usePortfolio } from '../context/PortfolioContext'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

function maskUrl(raw) {
  if (raw == null || String(raw).trim() === '') return '— missing —'
  try {
    const u = new URL(String(raw).trim())
    const host = u.host
    if (host.length <= 14) return `${u.protocol}//${host.slice(0, 4)}***`
    return `${u.protocol}//${host.slice(0, 5)}***${host.slice(-10)}`
  } catch {
    return '*** (invalid URL)'
  }
}

function maskKey(raw) {
  if (raw == null || String(raw).trim() === '') return '— missing —'
  const s = String(raw).trim()
  if (s.length <= 10) return '***'
  return `${s.slice(0, 4)}…${s.slice(-4)}`
}

function formatError(err) {
  if (err == null) return ''
  if (typeof err === 'string') return err
  if (typeof err.message === 'string' && err.message) {
    const code = err.code != null ? String(err.code) : ''
    return code ? `${code}: ${err.message}` : err.message
  }
  try {
    return JSON.stringify(err)
  } catch {
    return String(err)
  }
}

export default function DevSupabaseStatus() {
  const portfolio = usePortfolio()
  const { __source, __loading, __error, projects, experienceByOrg, certifications, skillGroups, aboutTabs } = portfolio

  const [probe, setProbe] = useState({ status: 'idle', ms: null, message: '' })

  const urlEnv = import.meta.env.VITE_SUPABASE_URL
  const keyEnv = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  const keySource = import.meta.env.VITE_SUPABASE_ANON_KEY
    ? 'VITE_SUPABASE_ANON_KEY'
    : import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
      ? 'VITE_SUPABASE_PUBLISHABLE_KEY'
      : '—'

  const roleCount = (experienceByOrg || []).reduce((n, org) => n + (org.roles?.length || 0), 0)

  const runProbe = async () => {
    if (!supabase) return
    setProbe({ status: 'running', ms: null, message: '' })
    const t0 = performance.now()
    const { error } = await supabase.from('profile').select('id').limit(1)
    const ms = Math.round(performance.now() - t0)
    if (error) {
      setProbe({
        status: 'error',
        ms,
        message: error.code ? `${error.code}: ${error.message}` : error.message || 'Unknown error',
      })
    } else {
      setProbe({ status: 'ok', ms, message: 'Row readable (or empty result without error).' })
    }
  }

  return (
    <div className="min-h-screen text-[var(--color-text)] relative z-10 px-6 py-12" style={{ background: 'transparent' }}>
      <SkipLink />
      <main id="main-content" className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--color-text-muted)] mb-1">Phase 1</p>
            <h1 className="text-2xl font-bold">Supabase status</h1>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${
              isSupabaseConfigured
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                : 'border-amber-500/40 bg-amber-500/10 text-amber-200'
            }`}
          >
            {isSupabaseConfigured ? 'Configured' : 'Not configured'}
          </span>
        </div>

        <section className="glass-card rounded-2xl p-6 border border-[var(--color-border)]" aria-labelledby="env-heading">
          <h2 id="env-heading" className="text-lg font-semibold mb-4">
            Environment
          </h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-[var(--color-text-muted)]">VITE_SUPABASE_URL</dt>
              <dd className="font-mono text-[var(--color-text)] break-all">{maskUrl(urlEnv)}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-text-muted)]">Public client key ({keySource})</dt>
              <dd className="font-mono text-[var(--color-text)] break-all">{maskKey(keyEnv)}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-[var(--color-text-muted)]">
            Set these in <code className="rounded bg-[var(--color-bg-card)] px-1">.env.local</code> then restart{' '}
            <code className="rounded bg-[var(--color-bg-card)] px-1">npm run dev</code>.
          </p>
        </section>

        <section className="glass-card rounded-2xl p-6 border border-[var(--color-border)]" aria-labelledby="client-heading">
          <h2 id="client-heading" className="text-lg font-semibold mb-4">
            Client
          </h2>
          <p className="text-sm text-[var(--color-text)]">
            Supabase client:{' '}
            <strong className={supabase ? 'text-emerald-300' : 'text-amber-200'}>{supabase ? 'created' : 'null'}</strong>
          </p>
        </section>

        <section className="glass-card rounded-2xl p-6 border border-[var(--color-border)]" aria-labelledby="probe-heading">
          <h2 id="probe-heading" className="text-lg font-semibold mb-3">
            Connectivity
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            Runs <code className="rounded bg-[var(--color-bg-card)] px-1">profile</code> read (limit 1). If tables are
            not migrated yet, the error message is expected.
          </p>
          <button
            type="button"
            onClick={runProbe}
            disabled={!supabase || probe.status === 'running'}
            className="theme-btn theme-btn-primary px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {probe.status === 'running' ? 'Running…' : 'Run check'}
          </button>
          {probe.status === 'ok' && (
            <p className="mt-3 text-sm text-emerald-300">
              OK · {probe.ms}ms — {probe.message}
            </p>
          )}
          {probe.status === 'error' && (
            <p className="mt-3 text-sm text-red-300" role="alert">
              Failed · {probe.ms}ms — {probe.message}
            </p>
          )}
        </section>

        <section className="glass-card rounded-2xl p-6 border border-[var(--color-border)]" aria-labelledby="ctx-heading">
          <h2 id="ctx-heading" className="text-lg font-semibold mb-4">
            Context resolution
          </h2>
          <ul className="text-sm space-y-2 text-[var(--color-text)]">
            <li>
              <span className="text-[var(--color-text-muted)]">__source:</span> <strong>{__source}</strong>
            </li>
            <li>
              <span className="text-[var(--color-text-muted)]">__loading:</span> <strong>{__loading ? 'true' : 'false'}</strong>
            </li>
            <li>
              <span className="text-[var(--color-text-muted)]">__error:</span>{' '}
              <strong className="text-red-300/90">{__error ? formatError(__error) : 'none'}</strong>
            </li>
            <li>
              <span className="text-[var(--color-text-muted)]">projects:</span> <strong>{projects?.length ?? 0}</strong>{' '}
              items
            </li>
            <li>
              <span className="text-[var(--color-text-muted)]">experienceByOrg:</span> <strong>{experienceByOrg?.length ?? 0}</strong>{' '}
              orgs, <strong>{roleCount}</strong> roles
            </li>
            <li>
              <span className="text-[var(--color-text-muted)]">certifications:</span> <strong>{certifications?.length ?? 0}</strong>{' '}
              items
            </li>
            <li>
              <span className="text-[var(--color-text-muted)]">skillGroups:</span> <strong>{skillGroups?.length ?? 0}</strong>{' '}
              groups
            </li>
            <li>
              <span className="text-[var(--color-text-muted)]">aboutTabs:</span> story{' '}
              <strong>{aboutTabs?.story?.length ?? 0}</strong>, interests <strong>{aboutTabs?.interests?.length ?? 0}</strong>, facts{' '}
              <strong>{aboutTabs?.facts?.length ?? 0}</strong>
            </li>
          </ul>
        </section>

        <p className="text-xs text-[var(--color-text-muted)] text-center pb-8">
          Available only in development (<code className="rounded bg-[var(--color-bg-card)] px-1">npm run dev</code>). Not
          shipped in production routes.
        </p>

        <div className="text-center">
          <Link to="/home" className="theme-btn theme-btn-secondary inline-flex px-4 py-2 text-sm">
            Back to site
          </Link>
        </div>
      </main>
    </div>
  )
}
