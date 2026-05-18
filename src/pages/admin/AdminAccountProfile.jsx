import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AccountWorkspace from '../../components/admin/account/AccountWorkspace'

export default function AdminAccountProfile() {
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <AdminPageHeader
        eyebrow="Account"
        title="Identity workspace"
        description="Premium identity command center — session intelligence, security mesh, and profile sync for your admin workspace."
      />
      <AccountWorkspace />
    </div>
  )
}
