import { SupabaseConfigureHintBody } from './SupabaseConfigureHint'
import { isSupabaseConfigured } from '../../lib/supabase'

export default function NotConfiguredBanner() {
  if (isSupabaseConfigured) return null
  return (
    <div
      className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100"
      role="status"
    >
      <p className="font-semibold text-amber-50">Supabase is not configured</p>
      <SupabaseConfigureHintBody includeSqlReminder className="mt-2 text-amber-100/90" />
    </div>
  )
}
