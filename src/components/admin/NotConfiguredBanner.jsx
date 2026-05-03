import { isSupabaseConfigured } from '../../lib/supabase'

export default function NotConfiguredBanner() {
  if (isSupabaseConfigured) return null
  return (
    <div
      className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100"
      role="status"
    >
      <p className="font-semibold text-amber-50">Supabase is not configured</p>
      <p className="mt-2 text-amber-100/90">
        Add <code className="rounded bg-black/25 px-1">VITE_SUPABASE_URL</code> and{' '}
        <code className="rounded bg-black/25 px-1">VITE_SUPABASE_ANON_KEY</code> (or{' '}
        <code className="rounded bg-black/25 px-1">VITE_SUPABASE_PUBLISHABLE_KEY</code>) to{' '}
        <code className="rounded bg-black/25 px-1">.env</code> or <code className="rounded bg-black/25 px-1">.env.local</code>, run the SQL from the integration plan, then restart{' '}
        <code className="rounded bg-black/25 px-1">npm run dev</code>.
      </p>
    </div>
  )
}
