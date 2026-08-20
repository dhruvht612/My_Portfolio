import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Layout from './Layout'
import { PortfolioProvider, navLinks } from '../context/PortfolioContext'
import { ThemeProvider } from '../context/ThemeContext'

/* Behaviour tests for the global nav. Rendered through Layout rather than Header
   directly: Header owns its own drawer state now, and the interesting assertions
   (active link vs. route, drawer lifecycle) are exactly the wiring between the two.

   No Supabase env under test, so PortfolioProvider serves the bundled static slice. */
function renderAt(path = '/home') {
  return render(
    <ThemeProvider>
      <PortfolioProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route element={<Layout />}>
              {navLinks.map((link) => (
                <Route key={link.id} path={link.path} element={<main>{link.label} route content</main>} />
              ))}
            </Route>
          </Routes>
        </MemoryRouter>
      </PortfolioProvider>
    </ThemeProvider>,
  )
}

const drawer = () => document.getElementById('mobile-nav')
const hamburger = () => screen.getByRole('button', { name: /open menu|close menu/i })

describe('nav active state', () => {
  /* The regression this guards: active styling used to be
     routerMatch || observedSection, which could mark two links active at once and
     needed a hand-maintained tiebreak to keep the framer indicator unique. */
  it.each(['/home', '/about', '/projects', '/skills'])(
    'marks exactly one link as the current page on %s',
    (path) => {
      renderAt(path)
      expect(document.querySelectorAll('#nav-links [aria-current="page"]')).toHaveLength(1)
    },
  )

  it('marks the link matching the route, not a neighbour', () => {
    renderAt('/projects')
    expect(document.querySelector('#nav-links [aria-current="page"]')).toHaveTextContent('Projects')
  })

  /* Contact is promoted out of the link strip into the CTA, so it is the one route
     that used to leave the whole nav with no current-page indication at all. */
  it('marks the Contact CTA as current on /contact', () => {
    renderAt('/contact')
    const ctas = document.querySelectorAll('.global-nav-cta[aria-current="page"]')
    expect(ctas.length).toBeGreaterThan(0)
    ctas.forEach((cta) => expect(cta).toHaveClass('is-current'))
  })

  it('keeps Contact out of the link strip', () => {
    renderAt('/home')
    expect(within(document.getElementById('nav-links')).queryByText('Contact')).toBeNull()
  })

  /* The Admin link moved to the footer; it is not visitor-facing navigation. */
  it('does not advertise Admin in the header', () => {
    renderAt('/home')
    expect(within(screen.getByRole('banner')).queryByText(/admin/i)).toBeNull()
  })
})

describe('nav semantics', () => {
  /* role="menubar"/"menuitem" promised arrow-key navigation that never existed, and
     two menuitems sat outside any menubar container at all. */
  it('uses list semantics rather than an application menu', () => {
    renderAt('/home')
    expect(screen.queryAllByRole('menubar')).toHaveLength(0)
    expect(screen.queryAllByRole('menuitem')).toHaveLength(0)
    expect(document.getElementById('nav-links').tagName).toBe('UL')
  })

  it('names both navigation landmarks', () => {
    renderAt('/home')
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: /mobile navigation/i })).toBeInTheDocument()
  })

  it('exposes scroll progress as a progressbar', () => {
    renderAt('/home')
    const bar = screen.getByRole('progressbar', { name: /scroll progress/i })
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuemax', '100')
  })
})

describe('mobile drawer', () => {
  it('starts closed and collapsed', () => {
    renderAt('/home')
    expect(hamburger()).toHaveAttribute('aria-expanded', 'false')
    expect(drawer()).toHaveClass('max-h-0')
  })

  /* The real defect this covers: the drawer used to collapse with max-height and
     opacity alone, leaving every link in the tab order and in the a11y tree while
     invisible. `inert` is what actually removes them. */
  it('keeps its links out of reach while closed', () => {
    renderAt('/home')
    expect(drawer()).toHaveAttribute('inert')
  })

  it('releases its links once opened', () => {
    renderAt('/home')
    fireEvent.click(hamburger())
    expect(drawer()).not.toHaveAttribute('inert')
    expect(drawer()).toHaveClass('max-h-[80vh]')
  })

  it('flips the trigger label and expanded state', () => {
    renderAt('/home')
    const button = hamburger()
    expect(button).toHaveAccessibleName('Open menu')
    fireEvent.click(button)
    expect(button).toHaveAccessibleName('Close menu')
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('closes on Escape and returns focus to the trigger', async () => {
    renderAt('/home')
    const button = hamburger()
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')

    fireEvent.keyDown(document, { key: 'Escape' })

    await waitFor(() => expect(button).toHaveAttribute('aria-expanded', 'false'))
    expect(document.activeElement).toBe(button)
  })

  it('closes on a pointer press outside the panel', async () => {
    renderAt('/home')
    fireEvent.click(hamburger())
    expect(hamburger()).toHaveAttribute('aria-expanded', 'true')

    fireEvent.pointerDown(document.body)

    await waitFor(() => expect(hamburger()).toHaveAttribute('aria-expanded', 'false'))
  })

  it('stays open when the press lands inside the panel', () => {
    renderAt('/home')
    fireEvent.click(hamburger())
    fireEvent.pointerDown(drawer())
    expect(hamburger()).toHaveAttribute('aria-expanded', 'true')
  })

  /* Navigating is the common close path, and the one that also has to survive the
     browser back button — which no onClick handler on a link can observe. */
  it('closes when the route changes', async () => {
    renderAt('/home')
    fireEvent.click(hamburger())

    fireEvent.click(within(drawer()).getByRole('link', { name: 'Projects' }))

    await waitFor(() => expect(hamburger()).toHaveAttribute('aria-expanded', 'false'))
    expect(await screen.findByText('Projects route content')).toBeInTheDocument()
  })

  it('locks body scroll while open and restores it on close', async () => {
    renderAt('/home')
    expect(document.body.style.overflow).not.toBe('hidden')

    fireEvent.click(hamburger())
    expect(document.body.style.overflow).toBe('hidden')

    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(document.body.style.overflow).not.toBe('hidden'))
  })

  it('groups its links under the footer column headings', () => {
    renderAt('/home')
    const panel = drawer()
    expect(within(panel).getByText('Portfolio')).toBeInTheDocument()
    expect(within(panel).getByText('Background')).toBeInTheDocument()
  })
})
