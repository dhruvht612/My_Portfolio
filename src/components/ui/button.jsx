import { cn } from '@/lib/utils'

const variants = {
  default: 'bg-sky-500 text-slate-950 hover:bg-sky-400 shadow-sm',
  outline: 'border border-[var(--line-hi)] bg-transparent text-slate-100 hover:bg-[var(--md-elevation-2)]',
  ghost: 'text-slate-200 hover:bg-[var(--md-elevation-2)]',
}

const sizes = {
  default: 'h-10 px-4 py-2',
  sm: 'h-8 rounded-md px-3 text-xs',
}

export function Button({ className, variant = 'default', size = 'default', type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 disabled:pointer-events-none disabled:opacity-50',
        variants[variant] || variants.default,
        sizes[size] || sizes.default,
        className
      )}
      {...props}
    />
  )
}
