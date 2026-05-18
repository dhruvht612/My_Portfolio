export function formatRelativeTime(date) {
  if (!date) return '—'
  const d = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(d.getTime())) return '—'
  const sec = Math.floor((Date.now() - d.getTime()) / 1000)
  if (sec < 60) return 'just now'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 48) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  return `${day}d ago`
}

export function initialsFromName(name, email) {
  const n = (name || '').trim()
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return n.slice(0, 2).toUpperCase()
  }
  if (email && email.includes('@')) return email.slice(0, 2).toUpperCase()
  return 'AD'
}

export function parseUserAgent(ua) {
  if (!ua || typeof ua !== 'string') return { browser: 'Unknown', os: 'Unknown', device: 'Desktop' }
  let browser = 'Browser'
  if (/Edg\//i.test(ua)) browser = 'Edge'
  else if (/Chrome\//i.test(ua) && !/Edg/i.test(ua)) browser = 'Chrome'
  else if (/Firefox\//i.test(ua)) browser = 'Firefox'
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari'

  let os = 'OS'
  if (/Windows/i.test(ua)) os = 'Windows'
  else if (/Mac OS X/i.test(ua)) os = 'macOS'
  else if (/Android/i.test(ua)) os = 'Android'
  else if (/iPhone|iPad/i.test(ua)) os = 'iOS'
  else if (/Linux/i.test(ua)) os = 'Linux'

  const device = /Mobile|Android|iPhone/i.test(ua) ? 'Mobile' : 'Desktop'
  return { browser, os, device }
}

export function securityHealthScore({ supabaseConfigured, session, emailChanged }) {
  let score = 72
  if (supabaseConfigured) score += 12
  if (session?.user?.email_confirmed_at) score += 8
  if (session?.user?.last_sign_in_at) score += 6
  if (emailChanged) score -= 4
  return Math.min(100, Math.max(0, score))
}

export function generateAccountInsights(ctx) {
  const {
    name,
    email,
    role,
    lastSignIn,
    supabaseConfigured,
    isDirty,
    device,
    sessionActive,
  } = ctx
  const lines = []

  if (sessionActive && supabaseConfigured) {
    lines.push({
      tone: 'emerald',
      title: 'Workspace security is healthy',
      body: 'Administrator session is active with Supabase-backed authentication. Session tokens refresh on a secure channel.',
    })
  } else if (!supabaseConfigured) {
    lines.push({
      tone: 'amber',
      title: 'Local preview mode',
      body: 'Connect Supabase auth to enable live profile sync, email verification, and production-grade session protection.',
    })
  }

  if (lastSignIn) {
    lines.push({
      tone: 'sky',
      title: 'Trusted device pattern detected',
      body: `Your account was last accessed ${formatRelativeTime(lastSignIn)} from this ${device?.device?.toLowerCase() || 'device'} (${device?.browser || 'browser'} on ${device?.os || 'OS'}).`,
    })
  }

  if (role === 'Administrator') {
    lines.push({
      tone: 'violet',
      title: 'Admin privileges active',
      body: 'Full workspace permissions are enabled. Changes to profile identity propagate to your public portfolio admin context.',
    })
  }

  if (isDirty) {
    lines.push({
      tone: 'cyan',
      title: 'Unsaved identity draft',
      body: `Review ${name || 'name'} and ${email || 'email'} before syncing — Ctrl+S saves when focused on this workspace.`,
    })
  }

  if (lines.length < 3) {
    lines.push({
      tone: 'sky',
      title: 'Workspace synced successfully',
      body: 'Profile metadata is aligned with your authenticated session. Notification and content modules inherit this identity.',
    })
  }

  return lines.slice(0, 4)
}

export function buildInitialActivity(session, savedAt) {
  const events = []
  const now = Date.now()
  const signIn = session?.user?.last_sign_in_at
  if (signIn) {
    events.push({
      id: 'sign-in',
      type: 'auth',
      label: 'Secure sign-in detected',
      detail: 'Session established via Supabase auth',
      at: new Date(signIn).getTime(),
    })
  }
  events.push({
    id: 'workspace-sync',
    type: 'sync',
    label: 'Workspace synced',
    detail: 'Admin identity context loaded',
    at: now - 120_000,
  })
  if (savedAt) {
    events.push({
      id: 'profile-saved',
      type: 'profile',
      label: 'Profile updated',
      detail: 'Identity fields persisted',
      at: savedAt,
    })
  }
  return events.sort((a, b) => b.at - a.at)
}
