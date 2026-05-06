import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminHeader from '../../components/admin/AdminHeader'
import AdminCommandPalette from '../../components/admin/AdminCommandPalette'
import AdminShortcutsOverlay from '../../components/admin/AdminShortcutsOverlay'
import ToastHost from '../../components/admin/ToastHost'
import { ToastProvider } from '../../hooks/useToast'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem('admin.sidebar.collapsed') === '1'
  })
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen(true)
      }
      if (event.key === '?') {
        event.preventDefault()
        setShortcutsOpen(true)
      }
      if (event.key === 'Escape') {
        setPaletteOpen(false)
        setShortcutsOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('admin.sidebar.collapsed', sidebarCollapsed ? '1' : '0')
  }, [sidebarCollapsed])

  return (
    <ToastProvider>
      <div className="admin-shell-bg relative flex min-h-screen text-[var(--color-text)] [color-scheme:dark]">
        <div className="admin-shell-noise pointer-events-none absolute inset-0" aria-hidden />
        <AdminSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed((s) => !s)}
        />
        <div className="relative flex min-w-0 flex-1 flex-col">
          <AdminHeader
            onMenuClick={() => setSidebarOpen(true)}
            onOpenCommandPalette={() => setPaletteOpen(true)}
            onOpenShortcuts={() => setShortcutsOpen(true)}
          />
          <main className="relative flex-1 overflow-auto p-4 md:p-6 lg:p-7">
            <Outlet />
          </main>
        </div>
        <AdminCommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
        <AdminShortcutsOverlay open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
        <ToastHost />
      </div>
    </ToastProvider>
  )
}
