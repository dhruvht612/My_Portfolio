import { NavLink } from 'react-router-dom'

/**
 * @param {{ to: string, end?: boolean, label: string, icon: import('lucide-react').LucideIcon, onNavigate?: () => void, collapsed?: boolean, badge?: string }} props
 */
export default function SidebarNavItem({ to, end, label, icon, onNavigate, collapsed = false, badge }) {
  const NavIcon = icon
  return (
    <NavLink
      to={to}
      end={Boolean(end)}
      onClick={() => onNavigate?.()}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        [
          `group relative flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-[background-color,color,transform,box-shadow] duration-200 ease-out ${
            collapsed ? 'justify-center gap-0 px-2' : 'gap-3'
          }`,
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-admin-canvas)]',
          isActive
            ? 'bg-white/[0.1] text-slate-50 shadow-[0_1px_0_rgba(255,255,255,0.06)]'
            : 'border border-transparent text-slate-400 hover:bg-[var(--color-admin-surface-hover)] hover:text-slate-200 hover:translate-x-0.5',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          {isActive ? (
            <span
              className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.65)]"
              aria-hidden
            />
          ) : null}
          <NavIcon
            className={`relative z-[1] h-5 w-5 shrink-0 transition-colors duration-200 ${
              isActive ? 'text-sky-300' : 'text-slate-500 group-hover:text-slate-300'
            }`}
            aria-hidden
          />
          {!collapsed ? <span className="relative z-[1] truncate">{label}</span> : null}
          {!collapsed && badge ? (
            <span className="ml-auto rounded-full border border-sky-400/30 bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-sky-200">
              {badge}
            </span>
          ) : null}
        </>
      )}
    </NavLink>
  )
}
