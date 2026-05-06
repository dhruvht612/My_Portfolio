import { NavLink } from 'react-router-dom'
import { Bell, ChevronLeft, ChevronRight, LayoutDashboard, Settings, Sparkles, UserRound, X } from 'lucide-react'
import { ADMIN_NAV } from '../../constants/adminNav'
import SidebarNavItem from './SidebarNavItem'

export default function AdminSidebar({ open, onClose, collapsed = false, onToggleCollapsed }) {
  const primary = ADMIN_NAV.slice(0, 8)
  const system = ADMIN_NAV.slice(8)

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
        className={`fixed left-0 top-0 z-50 flex h-full min-h-screen flex-col border-r border-[var(--color-admin-border)] bg-black/20 shadow-[8px_0_36px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-[transform,width] duration-300 ease-out md:relative md:z-0 md:h-auto md:min-h-screen md:translate-x-0 md:shrink-0 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${collapsed ? 'w-[5.2rem]' : 'w-[15rem]'}`}
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

        <div className="hidden border-b border-[var(--color-admin-border)] px-3 py-3 md:block">
          <NavLink
            to="/admin"
            className={`flex items-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-admin-canvas)] ${
              collapsed ? 'justify-center px-1 py-2' : 'gap-2.5 px-1 py-2'
            }`}
            onClick={() => onClose?.()}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/15 ring-1 ring-sky-400/25">
              <LayoutDashboard className="h-5 w-5 text-sky-300" aria-hidden />
            </span>
            {!collapsed ? (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-tight text-slate-100">Portfolio</p>
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">AI Workspace</p>
              </div>
            ) : null}
          </NavLink>
          <button
            type="button"
            onClick={onToggleCollapsed}
            className={`mt-3 inline-flex items-center rounded-lg border border-white/10 bg-white/[0.03] p-1.5 text-slate-400 transition hover:border-sky-400/35 hover:text-sky-300 ${
              collapsed ? 'mx-auto' : ''
            }`}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-1 pb-3">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-1">
            {!collapsed ? <p className="px-3 pb-1 pt-2 text-[10px] uppercase tracking-[0.16em] text-slate-500">Primary</p> : null}
            <nav className="flex flex-col gap-0.5 p-1 pt-0" aria-label="Primary admin navigation">
              {primary.map(({ to, label, icon, end }) => (
                <SidebarNavItem
                  key={to}
                  to={to}
                  end={end}
                  label={label}
                  icon={icon}
                  onNavigate={onClose}
                  collapsed={collapsed}
                  badge={to === '/admin/messages' ? '!' : undefined}
                />
              ))}
            </nav>
            {!collapsed ? <p className="px-3 pb-1 pt-3 text-[10px] uppercase tracking-[0.16em] text-slate-500">System</p> : null}
            <nav className="flex flex-col gap-0.5 p-1 pt-0" aria-label="Secondary admin navigation">
              {system.map(({ to, label, icon, end }) => (
                <SidebarNavItem
                  key={to}
                  to={to}
                  end={end}
                  label={label}
                  icon={icon}
                  onNavigate={onClose}
                  collapsed={collapsed}
                />
              ))}
            </nav>
          </div>
        </div>

        <div className="border-t border-white/10 p-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2">
            <NavLink
              to="/admin/notifications"
              className={`flex w-full items-center rounded-lg px-2 py-2 text-sm text-slate-300 transition hover:bg-white/[0.06] ${
                collapsed ? 'justify-center' : 'gap-2.5'
              }`}
              title={collapsed ? 'Notifications' : undefined}
              onClick={() => onClose?.()}
            >
              <Bell className="h-4 w-4 text-sky-300" />
              {!collapsed ? <span>Notifications</span> : null}
            </NavLink>
            <NavLink
              to="/admin/settings"
              className={`mt-1 flex w-full items-center rounded-lg px-2 py-2 text-sm text-slate-300 transition hover:bg-white/[0.06] ${
                collapsed ? 'justify-center' : 'gap-2.5'
              }`}
              title={collapsed ? 'Settings' : undefined}
              onClick={() => onClose?.()}
            >
              <Settings className="h-4 w-4 text-violet-300" />
              {!collapsed ? <span>Settings</span> : null}
            </NavLink>
            <NavLink
              to="/admin/account"
              className={`mt-1 flex w-full items-center rounded-lg px-2 py-2 text-sm text-slate-300 transition hover:bg-white/[0.06] ${
                collapsed ? 'justify-center' : 'gap-2.5'
              }`}
              title={collapsed ? 'Account profile' : undefined}
              onClick={() => onClose?.()}
            >
              <UserRound className="h-4 w-4 text-cyan-300" />
              {!collapsed ? <span>Account profile</span> : null}
            </NavLink>
            <div
              className={`mt-2 rounded-lg border border-emerald-400/20 bg-emerald-500/[0.08] px-2 py-2 text-[11px] text-emerald-200 ${
                collapsed ? 'text-center' : ''
              }`}
              title={collapsed ? 'System stable' : undefined}
            >
              <Sparkles className={`inline h-3.5 w-3.5 ${collapsed ? '' : 'mr-1'}`} />
              {!collapsed ? 'System stable' : null}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
