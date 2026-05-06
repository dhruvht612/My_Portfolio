import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

const sizes = {
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[min(96vw,1200px)]',
}

const drawerSizes = {
  md: 'w-[min(100vw,520px)]',
  lg: 'w-[min(100vw,680px)]',
  xl: 'w-[min(100vw,820px)]',
  full: 'w-[min(100vw,960px)]',
}

export default function AdminModal({
  open,
  onClose,
  title,
  children,
  size = 'lg',
  closeOnBackdrop = true,
  variant = 'centered',
}) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    const t = window.setTimeout(() => panelRef.current?.querySelector('input,textarea,select,button')?.focus(), 0)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(t)
    }
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] p-4 sm:p-6 ${variant === 'drawer' ? 'flex items-stretch justify-end' : 'flex items-center justify-center'}`}
      role="presentation"
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose?.()
      }}
    >
      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-md" aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        className={`relative z-10 flex h-[min(88vh,860px)] max-h-[88vh] flex-col overflow-hidden border border-white/[0.08] bg-slate-950/95 shadow-[0_24px_80px_rgba(0,0,0,0.55)] ring-1 ring-inset ring-white/[0.04] ${
          variant === 'drawer'
            ? `${drawerSizes[size] || drawerSizes.lg} rounded-2xl sm:rounded-3xl`
            : `w-full rounded-2xl ${sizes[size] || sizes.lg}`
        }`}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/25 to-transparent" aria-hidden />
        <div className="flex items-center justify-between border-b border-white/[0.07] bg-gradient-to-b from-white/[0.04] to-transparent px-5 py-3.5">
          <h2 id="admin-modal-title" className="text-lg font-semibold tracking-tight text-slate-50">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden px-5 py-4">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
