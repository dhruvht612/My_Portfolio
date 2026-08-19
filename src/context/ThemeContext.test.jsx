import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider, useTheme } from './ThemeContext'

/** Drives matchMedia so `(prefers-color-scheme: light)` can be forced either way. */
function setSystemLight(isLight) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: query.includes('prefers-color-scheme: light') ? isLight : false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }))
}

function Probe() {
  const { theme, toggleTheme, followSystemTheme, isSystem } = useTheme()
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="is-system">{String(isSystem)}</span>
      <button onClick={toggleTheme}>toggle</button>
      <button onClick={followSystemTheme}>follow</button>
    </div>
  )
}

const renderProbe = () =>
  render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  )

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    document.head.innerHTML = '<meta name="theme-color" content="#07080d">'
  })

  it('follows the system when nothing is stored', () => {
    setSystemLight(true)
    renderProbe()
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    expect(screen.getByTestId('is-system')).toHaveTextContent('true')
  })

  it('falls back to dark when the system is not light', () => {
    setSystemLight(false)
    renderProbe()
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
  })

  it('lets an explicit stored choice beat the system preference', () => {
    localStorage.setItem('theme', 'dark')
    setSystemLight(true)
    renderProbe()
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(screen.getByTestId('is-system')).toHaveTextContent('false')
  })

  /* A malformed value must not be trusted: `localStorage.getItem() || 'dark'` would
     have accepted any string here and set data-theme to garbage. */
  it('ignores a stored value that is neither light nor dark', () => {
    localStorage.setItem('theme', 'sepia')
    setSystemLight(true)
    renderProbe()
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
  })

  it('writes the resolved theme to the document element', () => {
    setSystemLight(false)
    renderProbe()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('toggles, persists the choice, and stops following the system', async () => {
    const user = userEvent.setup()
    setSystemLight(false)
    renderProbe()

    await user.click(screen.getByText('toggle'))

    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(localStorage.getItem('theme')).toBe('light')
    expect(screen.getByTestId('is-system')).toHaveTextContent('false')
  })

  /* Persisting the mirrored OS value would silently pin the theme and stop it
     tracking the system from then on. */
  it('does not persist anything while still following the system', () => {
    setSystemLight(true)
    renderProbe()
    expect(localStorage.getItem('theme')).toBeNull()
  })

  it('hands control back to the system and clears the stored choice', async () => {
    const user = userEvent.setup()
    localStorage.setItem('theme', 'dark')
    setSystemLight(true)
    renderProbe()

    await user.click(screen.getByText('follow'))

    expect(localStorage.getItem('theme')).toBeNull()
    expect(screen.getByTestId('is-system')).toHaveTextContent('true')
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
  })

  it('keeps the theme-color meta tag in step with the theme', async () => {
    const user = userEvent.setup()
    setSystemLight(false)
    renderProbe()
    const meta = () => document.querySelector('meta[name="theme-color"]').getAttribute('content')

    expect(meta()).toBe('#07080d')
    await user.click(screen.getByText('toggle'))
    expect(meta()).toBe('#f7f8fc')
  })
})

/* The pre-paint script in index.html duplicates getInitialTheme so the page never
   flashes the wrong scheme. Nothing links the two, so this asserts the duplicate
   still exists and still encodes the same precedence. */
describe('index.html pre-paint script', () => {
  /* Vitest runs from the project root; import.meta.url is not a file URL under jsdom. */
  const html = readFileSync(join(process.cwd(), 'index.html'), 'utf8')

  it('runs before the app bundle loads', () => {
    expect(html.indexOf('data-theme')).toBeLessThan(html.indexOf('src="/src/main.jsx"'))
  })

  it('prefers an explicit stored choice over the system preference', () => {
    expect(html).toContain("localStorage.getItem('theme')")
    expect(html).toContain("stored === 'light' || stored === 'dark'")
    expect(html).toContain('prefers-color-scheme: light')
  })

  it('sets the theme-color meta tag to the same values the provider uses', () => {
    expect(html).toContain('#f7f8fc')
    expect(html).toContain('#07080d')
  })
})
