/**
 * Copy for fixing missing Vite Supabase env. Production builds only see vars
 * present on the CI/host at build time — local .env does not apply to the live site.
 */
export function SupabaseConfigureHintBody({ includeSqlReminder = false, className = 'mt-2 text-amber-100/90' }) {
  const prod = import.meta.env.PROD

  if (prod) {
    return (
      <p className={className}>
        This build was produced without Supabase client variables. In your host (for example{' '}
        <strong className="font-semibold text-amber-50">Vercel</strong>: Project → Settings → Environment Variables),
        add <code className="rounded bg-black/20 px-1">VITE_SUPABASE_URL</code> and{' '}
        <code className="rounded bg-black/20 px-1">VITE_SUPABASE_ANON_KEY</code> (or{' '}
        <code className="rounded bg-black/20 px-1">VITE_SUPABASE_PUBLISHABLE_KEY</code>) for{' '}
        <strong className="font-semibold text-amber-50">Production</strong> (and Preview if you use it), then{' '}
        <strong className="font-semibold text-amber-50">redeploy</strong> so a new build can embed them.
      </p>
    )
  }

  return (
    <p className={className}>
      Add <code className="rounded bg-black/20 px-1">VITE_SUPABASE_URL</code> and{' '}
      <code className="rounded bg-black/20 px-1">VITE_SUPABASE_ANON_KEY</code> (or{' '}
      <code className="rounded bg-black/20 px-1">VITE_SUPABASE_PUBLISHABLE_KEY</code>) to{' '}
      <code className="rounded bg-black/20 px-1">.env</code> or <code className="rounded bg-black/20 px-1">.env.local</code>{' '}
      in the project root, then restart <code className="rounded bg-black/20 px-1">npm run dev</code>.
      {includeSqlReminder ? (
        <>
          {' '}
          Run the SQL from the integration plan if the database schema is not applied yet.
        </>
      ) : null}
    </p>
  )
}
