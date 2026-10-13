import { useState } from 'react'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'
import { ArrowIcon } from './shared'

const IDLE = { busy: false, sent: false, error: null }

/* The uplink: a plain labelled form, posting the same contact_submissions
   insert the old Contact page made (src/components/Contact.jsx). */
export default function FuturisticContactForm() {
  const [st, setSt] = useState(IDLE)
  const off = !isSupabaseConfigured || !supabase

  async function onSubmit(e) {
    e.preventDefault()
    if (off || st.busy) return
    const fd = new FormData(e.currentTarget)
    const [name, email, message] = ['name', 'email', 'message'].map((k) => String(fd.get(k) ?? '').trim())
    if (!name || !email || !message) return setSt({ ...IDLE, error: 'Please fill in all required fields.' })
    if (!/\S+@\S+\.\S+/.test(email)) return setSt({ ...IDLE, error: 'Please enter a valid email address.' })
    setSt({ ...IDLE, busy: true })
    try {
      const { error } = await supabase.from('contact_submissions').insert({ name, email, message })
      setSt(error ? { ...IDLE, error: error.message || 'Could not send your message. Please try again or use email above.' } : { ...IDLE, sent: true })
    } catch {
      setSt({ ...IDLE, error: 'Could not send your message. Please try again or use email above.' })
    }
  }

  const lock = off || st.busy || st.sent
  const status = off
    ? 'The form is offline right now. Email and LinkedIn above still work.'
    : st.error ?? (st.sent ? 'Message sent. Thank you.' : '')

  return (
    <form id="message" className="form" onSubmit={onSubmit} aria-labelledby="message-title" data-rv="up">
      <h2 id="message-title" className="k">Send a message</h2>
      <label>Name<input name="name" autoComplete="name" required maxLength={120} disabled={lock} /></label>
      <label>Email<input name="email" type="email" autoComplete="email" required maxLength={200} disabled={lock} /></label>
      <label>Message<textarea name="message" rows={6} required maxLength={5000} disabled={lock} /></label>
      <div className="fin-actions">
        <button className="cta cta--signal" type="submit" disabled={lock}>
          <i aria-hidden="true" /><span>{st.busy ? 'Sending…' : st.sent ? 'Sent' : 'Send message'}</span><ArrowIcon />
        </button>
        <p className={`form-status${st.error ? ' err' : ''}`} role="status">{status}</p>
      </div>
    </form>
  )
}
