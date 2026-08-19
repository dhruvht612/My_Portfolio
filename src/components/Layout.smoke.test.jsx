import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Layout from './Layout'
import { PortfolioProvider } from '../context/PortfolioContext'
import { ThemeProvider } from '../context/ThemeContext'

/* Boot smoke test. It asserts almost nothing about appearance and everything about
   the app actually mounting: providers resolve, the router renders, the shell's two
   landmarks exist, and the theme toggle is wired end to end. This is the test that
   catches "it doesn't even start" — the failure mode unit tests never see.

   No Supabase env is set under test, so PortfolioProvider serves the bundled static
   slice. That is the same path a fork PR builds on in CI. */

function renderApp() {
  return render(
    <ThemeProvider>
      <PortfolioProvider>
        <MemoryRouter initialEntries={['/home']}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/home" element={<main>Home route content</main>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </PortfolioProvider>
    </ThemeProvider>,
  )
}

describe('app shell', () => {
  it('mounts without throwing', () => {
    expect(() => renderApp()).not.toThrow()
  })

  it('renders the routed page content', async () => {
    renderApp()
    expect(await screen.findByText('Home route content')).toBeInTheDocument()
  })

  /* Exactly one of each. The footer previously nested a second <footer> inside the
     first, which produced two contentinfo landmarks. */
  it('renders exactly one banner and one contentinfo landmark', () => {
    renderApp()
    expect(screen.getAllByRole('banner')).toHaveLength(1)
    expect(screen.getAllByRole('contentinfo')).toHaveLength(1)
  })

  it('renders the primary navigation', () => {
    renderApp()
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument()
  })

  it('offers a skip link as the route into keyboard navigation', () => {
    renderApp()
    expect(screen.getByRole('link', { name: /skip/i })).toBeInTheDocument()
  })

  /* fireEvent rather than userEvent here: the assertion is that the button is wired to
     the provider, not that a real pointer sequence works. userEvent replays the full
     hover/down/up chain against the whole mounted shell, which was slow enough on a
     loaded machine to trip the timeout without ever indicating a real failure. */
  it('flips data-theme when the header toggle is activated', async () => {
    renderApp()

    const toggle = screen.getByRole('button', { name: /switch to (light|dark) theme/i })
    const before = document.documentElement.getAttribute('data-theme')

    fireEvent.click(toggle)

    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).not.toBe(before)
    })
  })

  it('exposes the toggle state to assistive technology', () => {
    renderApp()
    const toggle = screen.getByRole('button', { name: /switch to (light|dark) theme/i })
    expect(toggle).toHaveAttribute('aria-pressed')
  })
})
