import { ScrollText } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { InteractiveLogsTable } from '@/components/ui/interactive-logs-table-shadcnui'

/** Demo page: sample log rows only (no live health coupling). */
export default function AdminLogs() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <div className="rounded-2xl border border-white/[0.08] bg-[#0b0f17]/92 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.45)] ring-1 ring-inset ring-white/[0.05] md:p-8">
        <AdminPageHeader
          eyebrow="Observability"
          title="Logs explorer"
          description="Sample infrastructure-style rows to exercise search, filters, and row expansion. Live health events appear on System health."
        >
          <div className="hidden sm:flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-400">
            <ScrollText className="h-4 w-4 text-sky-400/80" aria-hidden />
            Demo data
          </div>
        </AdminPageHeader>

        <div className="mt-8 min-h-0">
          <InteractiveLogsTable embedded title="Sample logs" />
        </div>
      </div>
    </div>
  )
}
