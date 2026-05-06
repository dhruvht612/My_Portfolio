import { Bell, Palette, Shield, SlidersHorizontal } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'

const items = [
  {
    title: 'Appearance',
    copy: 'Control dashboard visuals, density, and motion intensity for your workspace.',
    icon: Palette,
  },
  {
    title: 'Notifications',
    copy: 'Choose event alerts, digest cadence, and priority routing behavior.',
    icon: Bell,
  },
  {
    title: 'Security',
    copy: 'Review account access patterns and strengthen session policies.',
    icon: Shield,
  },
  {
    title: 'Preferences',
    copy: 'Tune keyboard shortcuts, default views, and productivity settings.',
    icon: SlidersHorizontal,
  },
]

export default function AdminSettings() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <AdminPageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Configure your admin workspace behavior, appearance, and operational preferences."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <article key={item.title} className="admin-card-premium p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]">
                  <Icon className="h-5 w-5 text-sky-300" />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-slate-100">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">{item.copy}</p>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
