import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LogOut, Menu } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { ADMIN_NAV } from '../../constants/adminNav'

function titleFromPath(pathname) {
  if (pathname === '/admin' || pathname === '/admin/') return 'Dashboard'
  if (pathname.startsWith('/admin/blog/new')) return 'New blog post'
  if (pathname.startsWith('/admin/blog/edit/')) return 'Edit blog post'
  const matches = ADMIN_NAV.filter((item) => pathname === item.to || pathname.startsWith(`${item.to}/`))
  if (matches.length) {
    return [...matches].sort((a, b) => b.to.length - a.to.length)[0].label
  }
  return 'Admin'
}

export default function AdminHeader({ onMenuClick }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { session, signOut } = useAuth()

  const title = useMemo(() => titleFromPath(location.pathname), [location.pathname])
  const email = session?.user?.email ?? ''

  const handleLogout = async () => {
    await signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 px-4 backdrop-blur-md md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text)] md:hidden focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="truncate text-lg font-semibold text-[var(--color-text)]">{title}</h1>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {email ? (
          <span className="hidden max-w-[10rem] truncate text-xs text-[var(--color-text-muted)] sm:inline md:max-w-xs">
            {email}
          </span>
        ) : null}
        <button
          type="button"
          onClick={handleLogout}
          className="theme-btn theme-btn-secondary inline-flex items-center gap-2 px-3 py-2 text-xs sm:text-sm"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </header>
  )
}
