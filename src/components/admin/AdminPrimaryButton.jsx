/** Shared gradient styles for primary admin CTAs (button or Link). */
export const ADMIN_PRIMARY_CLASS =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/20 transition-[transform,box-shadow] duration-200 hover:shadow-xl hover:shadow-sky-500/25 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-admin-canvas)]'

/**
 * Primary gradient CTA used across admin list pages.
 */
export default function AdminPrimaryButton({ children, className = '', ...props }) {
  return (
    <button type="button" className={`${ADMIN_PRIMARY_CLASS} ${className}`} {...props}>
      {children}
    </button>
  )
}
