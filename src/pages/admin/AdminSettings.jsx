import AdminPageHeader from '../../components/admin/AdminPageHeader'
import SettingsWorkspace from '../../components/admin/settings/SettingsWorkspace'

export default function AdminSettings() {
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <AdminPageHeader
        eyebrow="Workspace"
        title="Control center"
        description="Futuristic developer operating system — configure appearance, security, notifications, and productivity subsystems."
      />
      <SettingsWorkspace />
    </div>
  )
}
