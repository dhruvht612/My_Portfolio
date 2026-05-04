import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminHeader from '../../components/admin/AdminHeader'
import ToastHost from '../../components/admin/ToastHost'
import { ToastProvider } from '../../hooks/useToast'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ToastProvider>
      <div className="relative flex min-h-screen bg-[var(--color-admin-canvas)]/72 text-[var(--color-text)] [color-scheme:dark]">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-15%,rgba(56,189,248,0.07),transparent_55%),radial-gradient(ellipse_50%_40%_at_100%_50%,rgba(99,102,241,0.05),transparent_50%)]"
          aria-hidden
        />
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="relative flex min-w-0 flex-1 flex-col">
          <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="relative flex-1 overflow-auto p-6 md:p-8">
            <Outlet />
          </main>
        </div>
        <ToastHost />
      </div>
    </ToastProvider>
  )
}
