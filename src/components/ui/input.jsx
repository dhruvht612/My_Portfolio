import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const Input = forwardRef(function Input({ className, type = 'text', ...props }, ref) {
  return (
    <input
      type={type}
      className={cn(
        'flex w-full rounded-md border border-white/12 bg-[#0b0f17]/80 px-3 py-2 text-sm text-slate-100 shadow-sm transition-colors placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/45 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
