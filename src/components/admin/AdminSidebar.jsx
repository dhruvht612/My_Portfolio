import { NavLink } from 'react-router-dom'
import { LayoutDashboard, X } from 'lucide-react'
import { ADMIN_NAV } from '../../constants/adminNav'
import SidebarNavItem from './SidebarNavItem'

export default function AdminSidebar({ open, onClose }) {
  const navInner = (
    <nav className="flex flex-col gap-0.5 p-3 pt-2" aria-label="Admin navigation">
      {ADMIN_NAV.map(({ to, label, icon, end }) => (
        <SidebarNavItem key={to} to={to} end={end} label={label} icon={icon} onNavigate={onClose} />
      ))}
    </nav>
  )

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out md:hidden ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!open}
        onClick={onClose}
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full min-h-screen w-[15.5rem] flex-col border-r border-[var(--color-admin-border)] bg-black/25 shadow-[8px_0_32px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-transform duration-300 ease-out md:relative md:z-0 md:h-auto md:min-h-screen md:translate-x-0 md:shrink-0 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-admin-border)] px-4 py-4 md:hidden">
          <span className="text-sm font-semibold tracking-wide text-slate-200">Menu</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors duration-200 hover:bg-white/10 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-[var(--color-admin-border)] px-4 py-4 md:hidden">
          <NavLink
            to="/admin"
            className="flex items-center gap-2.5 rounded-xl transition-colors duration-200 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60"
            onClick={() => onClose?.()}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/15 ring-1 ring-sky-400/25">
              <LayoutDashboard className="h-5 w-5 text-sky-300" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-100">Portfolio</p>
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Admin</p>
            </div>
          </NavLink>
        </div>

        <div className="hidden border-b border-[var(--color-admin-border)] px-4 py-5 md:block">
          <NavLink
            to="/admin"
            className="flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-admin-canvas)]"
            onClick={() => onClose?.()}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/15 ring-1 ring-sky-400/25">
              <LayoutDashboard className="h-5 w-5 text-sky-300" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight text-slate-100">Portfolio</p>
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Admin</p>
            </div>
          </NavLink>
        </div>

        <div className="flex-1 overflow-y-auto">{navInner}</div>
      </aside>
    </>
  )
}
