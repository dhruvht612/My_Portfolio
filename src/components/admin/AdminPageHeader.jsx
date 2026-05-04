/**
 * Consistent page chrome for admin CRUD pages (eyebrow, title, description, optional actions).
 */
export default function AdminPageHeader({ eyebrow, title, description, children }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-400/55">{eyebrow}</p>
        ) : null}
        <h2 className={`font-bold tracking-tight text-slate-50 ${eyebrow ? 'mt-1.5' : ''} text-2xl md:text-3xl`}>{title}</h2>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">{description}</p> : null}
      </div>
      {children ? <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">{children}</div> : null}
    </div>
  )
}
