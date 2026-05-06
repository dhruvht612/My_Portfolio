import { ScrollText } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { InteractiveLogsTable } from '@/components/ui/interactive-logs-table-shadcnui'

/** Demo page: sample log rows only (no live health coupling). */
export default function AdminLogs() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <div className="admin-card-premium p-6 md:p-8">
        <AdminPageHeader
          eyebrow="Observability"
          title="Logs explorer"
          description="Terminal-inspired event console with rich filters, severity cues, and expandable diagnostics."
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
