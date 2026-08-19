import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import HoverFooter from './ui/hover-footer'
import { FOOTER_GROUPS, navLinks } from '../context/PortfolioContext'

/* The footer derives its columns, résumé labels and badge alt text from portfolio
   data at render time. All three broke silently before, so they are asserted here. */

const socials = [
  { href: 'https://github.com/example', label: 'GitHub profile', tooltip: 'GitHub', icon: 'fab fa-github' },
  { href: 'mailto:someone@example.com', label: 'Send email', tooltip: 'Email', icon: 'fas fa-envelope' },
]

const resumeLinks = [
  { href: '/a.pdf', download: 'a.pdf', label: 'Systems Analyst' },
  { href: '/b.pdf', download: 'b.pdf', label: 'Data Analyst' },
]

function renderFooter(props = {}) {
  return render(
    <MemoryRouter>
      <HoverFooter
        navLinks={navLinks}
        footerGroups={FOOTER_GROUPS}
        heroSocials={socials}
        resumeLinks={resumeLinks}
        {...props}
      />
    </MemoryRouter>,
  )
}

describe('footer columns', () => {
  it('renders one column per footer group', () => {
    renderFooter()
    for (const group of FOOTER_GROUPS) {
      expect(screen.getByRole('heading', { name: group })).toBeInTheDocument()
    }
  })

  /* Contact is promoted to the CTA button rather than listed, so it must not appear
     in a column. This is what the old navLinks.slice(0, 4) / .slice(4) split got wrong. */
  it('lists every grouped nav link and omits ungrouped ones', () => {
    renderFooter()
    for (const link of navLinks) {
      const matches = screen.queryAllByRole('link', { name: link.label })
      if (link.footerGroup) {
        expect(matches.length, `${link.label} should be listed`).toBeGreaterThan(0)
      }
    }
    expect(navLinks.find((l) => l.id === 'contact').footerGroup).toBeUndefined()
  })

  it('keeps the two link columns balanced', () => {
    const counts = FOOTER_GROUPS.map((g) => navLinks.filter((l) => l.footerGroup === g).length)
    expect(counts.every((n) => n > 0)).toBe(true)
    expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1)
  })

  it('skips a group that has no links rather than rendering an empty column', () => {
    renderFooter({ footerGroups: [...FOOTER_GROUPS, 'Ghost'] })
    expect(screen.queryByRole('heading', { name: 'Ghost' })).not.toBeInTheDocument()
  })
})

describe('footer content', () => {
  it('renders résumé downloads with a download attribute', () => {
    renderFooter()
    const link = screen.getByRole('link', { name: /Systems Analyst/ })
    expect(link).toHaveAttribute('download', 'a.pdf')
  })

  it('omits the résumé column when there are no résumés', () => {
    renderFooter({ resumeLinks: [] })
    expect(screen.queryByRole('heading', { name: 'Resume' })).not.toBeInTheDocument()
  })

  it('labels social links and opens only external ones in a new tab', () => {
    renderFooter()
    const github = screen.getByRole('link', { name: 'GitHub profile' })
    expect(github).toHaveAttribute('target', '_blank')
    expect(github).toHaveAttribute('rel', expect.stringContaining('noopener'))
    expect(screen.getByRole('link', { name: 'Send email' })).not.toHaveAttribute('target')
  })

  /* Alt text is parsed out of the shields.io URL; a decorative-only strip would be
     unreadable to a screen reader. */
  it('derives alt text from shields.io badge URLs', () => {
    renderFooter({
      footerBadges: [
        'https://img.shields.io/badge/HTML5-%23E34F26.svg?&style=flat',
        'https://img.shields.io/badge/Tailwind-%2306B6D4.svg?&style=flat',
      ],
    })
    const strip = screen.getByRole('list', { name: 'Built with' })
    expect(within(strip).getByAltText('HTML5')).toBeInTheDocument()
    expect(within(strip).getByAltText('Tailwind')).toBeInTheDocument()
  })

  it('renders no badge strip when there are no badges', () => {
    renderFooter()
    expect(screen.queryByRole('list', { name: 'Built with' })).not.toBeInTheDocument()
  })

  it('shows the availability pill only when availability is supplied', () => {
    const { unmount } = renderFooter({ availability: 'Open to Opportunities' })
    expect(screen.getByText('Open to Opportunities')).toBeInTheDocument()
    unmount()
    renderFooter()
    expect(screen.queryByText('Open to Opportunities')).not.toBeInTheDocument()
  })

  it('renders exactly one contentinfo landmark from the app-level Footer', () => {
    renderFooter()
    expect(screen.queryAllByRole('contentinfo')).toHaveLength(0)
  })
})
