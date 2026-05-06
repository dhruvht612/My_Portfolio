import { BellRing, CheckCircle2, Clock3, Zap } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'

const samples = [
  { id: 'n1', title: 'Unread messages spike', detail: '5 new contact submissions in the last hour.', tone: 'amber', icon: BellRing },
  { id: 'n2', title: 'Project updated', detail: '“Trail” metadata was edited successfully.', tone: 'sky', icon: Zap },
  { id: 'n3', title: 'Health checks stable', detail: 'All services are reporting operational status.', tone: 'emerald', icon: CheckCircle2 },
  { id: 'n4', title: 'Draft reminder', detail: 'You have blog drafts not published for 7+ days.', tone: 'violet', icon: Clock3 },
]

const toneClass = {
  amber: 'border-amber-400/20 bg-amber-500/[0.08] text-amber-200',
  sky: 'border-sky-400/20 bg-sky-500/[0.08] text-sky-200',
  emerald: 'border-emerald-400/20 bg-emerald-500/[0.08] text-emerald-200',
  violet: 'border-violet-400/20 bg-violet-500/[0.08] text-violet-200',
}

export default function AdminNotifications() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <AdminPageHeader
        eyebrow="Inbox"
        title="Notifications"
        description="Track important admin signals, workflow reminders, and operational updates."
      />

      <section className="admin-card-premium p-3 sm:p-4">
        <ul className="space-y-2">
          {samples.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <div className="flex items-start gap-3">
                  <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border ${toneClass[item.tone]}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-100">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{item.detail}</p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
