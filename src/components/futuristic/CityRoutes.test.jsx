import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import App from '../../App'

/* The whole public site now lives under one persistent city layout. jsdom has
   no WebGL, so the engine takes its no-WebGL path: the routing, redirects and
   nav state under test are exactly what a visitor without WebGL gets. */
vi.mock('../../lib/supabase', () => ({ isSupabaseConfigured: false, supabase: null }))

beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = () => null
})
afterEach(() => window.history.replaceState(null, '', '/'))

const at = (path) => {
  window.history.replaceState(null, '', path)
  return render(<App />)
}

describe('city routes', () => {
  it.each([
    ['/home', '/', ''],
    ['/education', '/about', '#education'],
    ['/certifications', '/about', '#certifications'],
    ['/beyond', '/about', '#beyond'],
  ])('%s redirects to %s%s', async (from, path, hash) => {
    at(from)
    await waitFor(() => expect(window.location.pathname + window.location.hash).toBe(path + hash))
    if (hash) expect(document.querySelector(hash)).toBeInTheDocument()
  })

  it('marks exactly the current page in the nav', async () => {
    at('/projects')
    const nav = await screen.findByRole('navigation', { name: 'Primary' })
    const current = nav.querySelectorAll('[aria-current="page"]')
    expect(current).toHaveLength(1)
    expect(current[0]).toHaveTextContent('Projects')
  })

  it('gives each subpage its own h1', async () => {
    at('/skills')
    expect(await screen.findByRole('heading', { level: 1, name: /the stack/i })).toBeInTheDocument()
  })
})
