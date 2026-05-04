import { SupabaseConfigureHintBody } from './SupabaseConfigureHint'
import { isSupabaseConfigured } from '../../lib/supabase'

export default function NotConfiguredBanner() {
  if (isSupabaseConfigured) return null
  return (
    <div
      className="mb-6 rounded-2xl border border-amber-500/35 bg-amber-500/[0.08] p-5 text-sm text-amber-100 shadow-lg shadow-black/20 backdrop-blur-sm"
      role="status"
    >
      <p className="font-semibold text-amber-50">Supabase is not configured</p>
      <SupabaseConfigureHintBody includeSqlReminder className="mt-2 text-amber-100/90" />
    </div>
  )
}
