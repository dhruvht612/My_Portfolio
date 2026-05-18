import AdminPageHeader from '../../components/admin/AdminPageHeader'
import NotificationsWorkspace from '../../components/admin/notifications/NotificationsWorkspace'

export default function AdminNotifications() {
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <AdminPageHeader
        eyebrow="Inbox"
        title="Signal center"
        description="Realtime AI operational inbox — classified alerts, priority routing, and live workspace activity."
      />
      <NotificationsWorkspace />
    </div>
  )
}
