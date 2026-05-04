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

function firstNameFromSession(session) {
  const raw = session?.user?.user_metadata?.full_name
  if (typeof raw === 'string' && raw.trim()) {
    return raw.trim().split(/\s+/)[0]
  }
  const email = session?.user?.email
  if (typeof email === 'string' && email.includes('@')) {
    return email.split('@')[0]
  }
  return 'Dhruv'
}

export default function AdminHeader({ onMenuClick }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { session, signOut } = useAuth()

  const pathname = location.pathname
  const isDashboardHome = pathname === '/admin' || pathname === '/admin/'
  const title = useMemo(() => titleFromPath(pathname), [pathname])
  const firstName = useMemo(() => firstNameFromSession(session), [session])
  const email = session?.user?.email ?? ''

  const handleLogout = async () => {
    await signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <header
      className={`sticky top-0 z-30 flex shrink-0 items-center justify-between gap-4 border-b border-[var(--color-admin-border)] bg-[var(--color-admin-canvas)]/80 px-4 backdrop-blur-xl md:px-6 ${
        isDashboardHome ? 'min-h-[5.25rem] py-3' : 'h-14'
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          className="shrink-0 rounded-lg p-2 text-slate-400 transition-colors duration-200 hover:bg-white/10 hover:text-slate-100 md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {isDashboardHome ? (
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight text-slate-50 md:text-xl">
              Welcome back, {firstName}{' '}
              <span className="font-normal" aria-hidden>
                👋
              </span>
            </h1>
            <p className="mt-0.5 max-w-md text-sm leading-snug text-slate-500">
              Here&apos;s an overview of your portfolio activity
            </p>
          </div>
        ) : (
          <h1 className="truncate text-lg font-semibold tracking-tight text-slate-50">{title}</h1>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {email ? (
          <>
            <span
              className="hidden max-w-[11rem] truncate rounded-full border border-white/10 bg-black/25 px-3 py-1.5 font-mono text-[11px] text-slate-400 sm:inline md:max-w-[16rem] md:text-xs"
              title={email}
            >
              {email}
            </span>
            <span className="hidden h-6 w-px shrink-0 bg-white/10 sm:block" aria-hidden />
          </>
        ) : null}
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-200 shadow-sm transition-[background-color,transform,box-shadow] duration-200 ease-out hover:bg-white/[0.09] hover:text-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 sm:text-sm"
        >
          <LogOut className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </header>
  )
}
