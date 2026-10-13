import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FuturisticContactForm from './FuturisticContactForm'

/* The form is the one place the city writes to Supabase, so the payload it
   sends is pinned here: same table, same three trimmed fields as before. */
const h = vi.hoisted(() => ({ on: true, insert: vi.fn() }))
vi.mock('../../lib/supabase', () => ({
  get isSupabaseConfigured() { return h.on },
  get supabase() { return h.on ? { from: (table) => ({ insert: (row) => h.insert(table, row) }) } : null },
}))

const fill = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } })

describe('FuturisticContactForm', () => {
  beforeEach(() => {
    h.on = true
    h.insert.mockReset().mockResolvedValue({ error: null })
  })

  it('inserts the trimmed message into contact_submissions', async () => {
    render(<FuturisticContactForm />)
    fill('Name', '  Ada Lovelace ')
    fill('Email', ' ada@example.com ')
    fill('Message', '  Hello from the city.  ')
    fireEvent.submit(screen.getByRole('form'))
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Message sent'))
    expect(h.insert).toHaveBeenCalledWith('contact_submissions', {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      message: 'Hello from the city.',
    })
  })

  it('rejects an invalid email without calling Supabase', async () => {
    render(<FuturisticContactForm />)
    fill('Name', 'Ada')
    fill('Email', 'not-an-email')
    fill('Message', 'Hi')
    fireEvent.submit(screen.getByRole('form'))
    expect(await screen.findByText('Please enter a valid email address.')).toBeInTheDocument()
    expect(h.insert).not.toHaveBeenCalled()
  })

  it('is disabled with a notice when Supabase is not configured', () => {
    h.on = false
    render(<FuturisticContactForm />)
    expect(screen.getByLabelText('Email')).toBeDisabled()
    expect(screen.getByRole('button', { name: /send message/i })).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('offline')
  })
})
