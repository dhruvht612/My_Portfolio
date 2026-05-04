import { NavLink } from 'react-router-dom'

/**
 * @param {{ to: string, end?: boolean, label: string, icon: import('lucide-react').LucideIcon, onNavigate?: () => void }} props
 */
export default function SidebarNavItem({ to, end, label, icon, onNavigate }) {
  const NavIcon = icon
  return (
    <NavLink
      to={to}
      end={Boolean(end)}
      onClick={() => onNavigate?.()}
      className={({ isActive }) =>
        [
          'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-[background-color,color,transform,box-shadow] duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-admin-canvas)]',
          isActive
            ? 'bg-white/[0.1] text-slate-50 shadow-[0_1px_0_rgba(255,255,255,0.06)]'
            : 'border border-transparent text-slate-400 hover:bg-[var(--color-admin-surface-hover)] hover:text-slate-200',
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
          <span className="relative z-[1]">{label}</span>
        </>
      )}
    </NavLink>
  )
}
