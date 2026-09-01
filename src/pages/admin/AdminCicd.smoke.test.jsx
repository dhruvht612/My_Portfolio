import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import AdminCicd from './AdminCicd'
import { ToastProvider } from '../../hooks/useToast'
import { ADMIN_NAV } from '../../constants/adminNav'

/**
 * Smoke coverage for the CI/CD command centre.
 *
 * Asserts the page gets from its loading state to real content against the mock
 * provider, that the primary interactions are wired, and that the nav entry
 * lands in the SYSTEM group — which AdminSidebar derives from an array index
 * rather than a flag, so it is easy to break from a distance.
 *
 * Queries are scoped to a section's `region` wherever a value legitimately
 * appears more than once: without CSS, jsdom renders both the desktop table and
 * the mobile card list, so an unscoped `getByText` is ambiguous by construction.
 */

function renderPage() {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <AdminCicd />
      </ToastProvider>
    </MemoryRouter>,
  )
}

/** Resolves once the mock provider has replaced the skeletons with real rows. */
async function findHistory() {
  const history = await screen.findByRole('region', { name: 'Deployment history' })
  await waitFor(() => expect(within(history).getAllByText('v2.8.4').length).toBeGreaterThan(0))
  return history
}

describe('AdminCicd', () => {
  it('resolves from loading to a healthy snapshot', async () => {
    renderPage()

    expect(await screen.findByRole('heading', { name: 'CI/CD Pipeline', level: 1 })).toBeInTheDocument()

    // Global verdict plus the four headline rates.
    expect(await screen.findByRole('heading', { name: 'Healthy', level: 2 })).toBeInTheDocument()
    expect(screen.getByText('Build success rate')).toBeInTheDocument()
    expect(screen.getByText('Production uptime')).toBeInTheDocument()
  })

  it('renders every pipeline stage and opens one on click', async () => {
    const user = userEvent.setup()
    renderPage()

    const stages = await screen.findByRole('list', { name: 'Pipeline stages' })
    // Source through Production.
    expect(within(stages).getAllByRole('listitem')).toHaveLength(7)

    const build = within(stages).getByRole('button', { name: /^Build —/ })
    await user.click(build)
    expect(build).toHaveAttribute('aria-expanded', 'true')

    // The detail panel exposes that stage's runner.
    expect(await screen.findByText('ubuntu-latest')).toBeInTheDocument()
  })

  it('filters deployment history and shows an empty state when nothing matches', async () => {
    const user = userEvent.setup()
    renderPage()
    const history = await findHistory()

    await user.click(within(history).getByRole('button', { name: 'Failed' }))
    expect(within(history).queryByText('v2.8.4')).not.toBeInTheDocument()
    expect(within(history).getAllByText('v2.8.1').length).toBeGreaterThan(0)

    await user.type(screen.getByRole('searchbox', { name: /Search deployments/i }), 'nothing-matches-this')
    expect(await within(history).findByText('No deployments match these filters.')).toBeInTheDocument()
  })

  it('requires a reason before a rollback can be confirmed', async () => {
    const user = userEvent.setup()
    renderPage()
    const history = await findHistory()

    // v2.8.4 is the newest production release, so v2.8.3 is the rollback target.
    await user.click(within(history).getAllByRole('button', { name: /Rollback/ })[0])

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Roll back deployment?')).toBeInTheDocument()
    expect(within(dialog).getAllByText('v2.8.3').length).toBeGreaterThan(0)

    // Confirming with an empty reason surfaces the requirement instead of acting.
    await user.click(within(dialog).getByRole('button', { name: 'Confirm Rollback' }))
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('A reason is required')
    expect(within(dialog).queryByText('Rollback complete')).not.toBeInTheDocument()
  })

  it('registers CI/CD in the SYSTEM half of the sidebar nav', () => {
    // AdminSidebar renders ADMIN_NAV.slice(0, 8) as Primary and the rest as System.
    const index = ADMIN_NAV.findIndex((item) => item.to === '/admin/cicd')
    expect(index).toBeGreaterThanOrEqual(8)
    expect(ADMIN_NAV[index].label).toBe('CI/CD')
  })
})
