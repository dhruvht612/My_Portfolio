import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

/* jsdom implements neither of these, and the app calls both on mount:
   ParticlesBackground / CursorGlow gate on matchMedia, and several components
   observe intersection or resize. Without stubs the very first render throws. */
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })
}

class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

vi.stubGlobal('IntersectionObserver', NoopObserver)
vi.stubGlobal('ResizeObserver', NoopObserver)

if (!window.requestIdleCallback) {
  window.requestIdleCallback = (cb) => window.setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 0 }), 0)
  window.cancelIdleCallback = (id) => window.clearTimeout(id)
}

/* jsdom defines scrollTo but throws "Not implemented" on every call, which Layout
   triggers on each route change. Overridden unconditionally to keep output readable. */
window.scrollTo = () => {}

afterEach(() => {
  cleanup()
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
})
