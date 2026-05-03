import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import { ADMIN_NAV } from '../../constants/adminNav'

export default function AdminSidebar({ open, onClose }) {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)] ${
      isActive
        ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)] border border-[var(--color-accent)]/30'
        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-card)] border border-transparent'
    }`

  const navInner = (
    <nav className="flex flex-col gap-1 p-3" aria-label="Admin navigation">
      {ADMIN_NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={Boolean(end)} className={linkClass} onClick={() => onClose?.()}>
          <Icon className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
          {label}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity duration-200 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!open}
        onClick={onClose}
      />

      {/* Sidebar panel */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full min-h-screen w-60 border-r border-[var(--color-border)] bg-[var(--color-bg-card)]/85 backdrop-blur-md transition-transform duration-200 ease-out md:relative md:z-0 md:h-auto md:min-h-screen md:translate-x-0 md:shrink-0 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-4 md:hidden">
          <span className="text-sm font-semibold tracking-wide text-[var(--color-text)]">Menu</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {navInner}
      </aside>
    </>
  )
}
