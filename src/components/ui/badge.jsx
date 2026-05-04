import { cn } from '@/lib/utils'

const variants = {
  secondary: 'border-transparent bg-slate-700/50 text-slate-200 hover:bg-slate-700/70',
  outline: 'border border-white/15 text-slate-200 bg-transparent',
}

export function Badge({ className, variant = 'secondary', ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/40',
        variants[variant] || variants.secondary,
        className
      )}
      {...props}
    />
  )
}
