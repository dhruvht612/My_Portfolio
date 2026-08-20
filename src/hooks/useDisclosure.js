import { useCallback, useEffect, useRef, useState } from 'react'

/* Every tabbable thing we care about inside a panel. `[inert]` subtrees are excluded
   by the browser itself, so we only have to filter explicit opt-outs. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function focusableWithin(container) {
  if (!container) return []
  return Array.from(container.querySelectorAll(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null || el.getClientRects().length > 0,
  )
}

/**
 * Overlay/panel disclosure state with the full keyboard + pointer contract that an
 * open panel owes the user. Escape handling was previously re-implemented in ~10
 * components (AdminModal, ActionMenu, Projects, Skills, …), each with a different
 * subset of the behaviour; this is the single place it lives now.
 *
 * While open:
 *  - Escape closes and focus returns to whatever opened it.
 *  - Tab / Shift+Tab cycle inside `panelRef` instead of escaping into the page.
 *  - A pointer press outside both `panelRef` and `triggerRef` closes.
 *  - `document.body` scroll is locked, compensating for the scrollbar width so the
 *    layout behind the panel does not shift.
 *
 * Focus is restored to `triggerRef` (or the element that was focused at open time)
 * on every close path, so a keyboard user is never dumped at the top of the document.
 *
 * @param {object}  [options]
 * @param {boolean} [options.initialOpen=false]
 * @param {boolean} [options.trapFocus=true]  Cycle Tab inside the panel while open.
 * @param {boolean} [options.lockScroll=true] Freeze body scroll while open.
 * @returns {{
 *   isOpen: boolean, open: () => void, close: () => void, toggle: () => void,
 *   panelRef: React.RefObject<HTMLElement>, triggerRef: React.RefObject<HTMLElement>,
 * }}
 */
export function useDisclosure({ initialOpen = false, trapFocus = true, lockScroll = true } = {}) {
  const [isOpen, setIsOpen] = useState(initialOpen)
  const panelRef = useRef(null)
  const triggerRef = useRef(null)
  /* Whatever held focus when we opened. Preferred over triggerRef on restore so
     opening via a keyboard shortcut (no trigger element) still returns focus home. */
  const restoreRef = useRef(null)

  const open = useCallback(() => {
    if (typeof document !== 'undefined') restoreRef.current = document.activeElement
    setIsOpen(true)
  }, [])

  /* Restores focus synchronously. Callers that close in response to a *pointer*
     event pass `{ refocus: false }`: yanking focus back to the trigger after a
     click paints a focus ring the mouse user never asked for. */
  const close = useCallback(({ refocus = true } = {}) => {
    setIsOpen(false)
    if (!refocus) return
    const target = triggerRef.current ?? restoreRef.current
    if (target && typeof target.focus === 'function') target.focus()
  }, [])

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev && typeof document !== 'undefined') restoreRef.current = document.activeElement
      return !prev
    })
  }, [])

  /* Escape + focus trap. One keydown listener for both, since they share a guard. */
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        return
      }
      if (event.key !== 'Tab' || !trapFocus) return
      const items = focusableWithin(panelRef.current)
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      /* Focus can sit outside the panel entirely (the trigger keeps it after a
         click-to-open), so treat "not in the panel" as "wrap to the near edge"
         rather than letting Tab walk off into the page behind. */
      if (!panelRef.current?.contains(active)) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
        return
      }
      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, trapFocus, close])

  /* Outside press. `pointerdown` rather than `click`: a click that starts inside the
     panel and ends outside it (a drag) should not count as dismissal. */
  useEffect(() => {
    if (!isOpen) return
    const onPointerDown = (event) => {
      const target = event.target
      if (panelRef.current?.contains(target)) return
      if (triggerRef.current?.contains(target)) return
      close({ refocus: false })
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [isOpen, close])

  /* Body scroll lock. Padding compensates for the scrollbar the lock removes, so
     fixed-position chrome (the nav itself) does not jump sideways on open. */
  useEffect(() => {
    if (!isOpen || !lockScroll || typeof document === 'undefined') return
    const { body } = document
    const previousOverflow = body.style.overflow
    const previousPadding = body.style.paddingRight
    const gap = window.innerWidth - document.documentElement.clientWidth
    body.style.overflow = 'hidden'
    if (gap > 0) body.style.paddingRight = `${gap}px`
    return () => {
      body.style.overflow = previousOverflow
      body.style.paddingRight = previousPadding
    }
  }, [isOpen, lockScroll])

  return { isOpen, open, close, toggle, panelRef, triggerRef }
}

export default useDisclosure
