export const STORAGE_KEY = 'admin.notifications.state'

export const SEVERITY = {
  critical: { label: 'Critical', bar: 'bg-red-400', border: 'notif-sev-critical', glow: 'shadow-[0_0_28px_rgba(248,113,113,0.15)]', text: 'text-red-200' },
  high: { label: 'High', bar: 'bg-amber-400', border: 'notif-sev-high', glow: 'shadow-[0_0_24px_rgba(251,191,36,0.12)]', text: 'text-amber-200' },
  medium: { label: 'Medium', bar: 'bg-sky-400', border: 'notif-sev-medium', glow: 'shadow-[0_0_22px_rgba(56,189,248,0.1)]', text: 'text-sky-200' },
  passive: { label: 'Passive', bar: 'bg-slate-400', border: 'notif-sev-passive', glow: '', text: 'text-slate-300' },
  ai: { label: 'AI Summary', bar: 'bg-violet-400', border: 'notif-sev-ai', glow: 'shadow-[0_0_24px_rgba(167,139,250,0.12)]', text: 'text-violet-200' },
}

export const CATEGORIES = [
  { id: 'all', label: 'All signals' },
  { id: 'operations', label: 'Operations' },
  { id: 'projects', label: 'Projects' },
  { id: 'health', label: 'Health' },
  { id: 'content', label: 'Content' },
  { id: 'security', label: 'Security' },
]

export const PRIORITY_FILTERS = [
  { id: 'all', label: 'All priorities' },
  { id: 'critical', label: 'Critical' },
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'passive', label: 'Passive' },
]

export const STATUS_FILTERS = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'unread', label: 'Unread' },
  { id: 'pinned', label: 'Pinned' },
  { id: 'archived', label: 'Archived' },
]

const now = Date.now()

export const DEFAULT_SIGNALS = [
  {
    id: 'sig-1',
    title: 'Unread messages spike',
    detail: '5 new contact submissions in the last hour require triage.',
    severity: 'high',
    category: 'operations',
    source: 'Contact mesh',
    aiClass: 'Action required',
    at: now - 12 * 60_000,
    priority: 1,
  },
  {
    id: 'sig-2',
    title: 'Project metadata updated',
    detail: '“Trail” project fields were edited and synced to the public surface.',
    severity: 'medium',
    category: 'projects',
    source: 'CMS pipeline',
    aiClass: 'Operational',
    at: now - 38 * 60_000,
    priority: 2,
  },
  {
    id: 'sig-3',
    title: 'Health checks stable',
    detail: 'All Supabase probes reporting operational status across regions.',
    severity: 'passive',
    category: 'health',
    source: 'Observability',
    aiClass: 'Informational',
    at: now - 52 * 60_000,
    priority: 4,
  },
  {
    id: 'sig-4',
    title: 'Draft publishing reminder',
    detail: 'Blog drafts idle for 7+ days — AI suggests scheduling a publish window.',
    severity: 'medium',
    category: 'content',
    source: 'Content OS',
    aiClass: 'Action required',
    at: now - 2 * 3600_000,
    priority: 3,
  },
  {
    id: 'sig-5',
    title: 'Session trust anomaly',
    detail: 'New device fingerprint detected on admin session — within expected variance.',
    severity: 'critical',
    category: 'security',
    source: 'Auth mesh',
    aiClass: 'Review recommended',
    at: now - 8 * 60_000,
    priority: 0,
  },
  {
    id: 'sig-6',
    title: 'AI inbox summary',
    detail: 'Operational health remains stable. 2 signals may require action today.',
    severity: 'ai',
    category: 'operations',
    source: 'Copilot',
    aiClass: 'AI Summary',
    at: now - 3 * 60_000,
    priority: 5,
  },
]

export function loadNotificationState() {
  if (typeof window === 'undefined') {
    return { archived: [], resolved: [], pinned: [], read: [], important: [] }
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { archived: [], resolved: [], pinned: [], read: [], important: [] }
    return { archived: [], resolved: [], pinned: [], read: [], important: [], ...JSON.parse(raw) }
  } catch {
    return { archived: [], resolved: [], pinned: [], read: [], important: [] }
  }
}

export function saveNotificationState(state) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function formatRelativeTime(date) {
  if (!date) return '—'
  const d = typeof date === 'number' ? date : new Date(date).getTime()
  const sec = Math.floor((Date.now() - d) / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 48) return `${hr}h ago`
  return `${Math.floor(hr / 24)}d ago`
}

export function generateInboxInsights(signals, state) {
  const active = signals.filter((s) => !state.archived.includes(s.id))
  const unread = active.filter((s) => !state.read.includes(s.id) && !state.resolved.includes(s.id))
  const action = active.filter((s) => s.aiClass === 'Action required' || s.aiClass === 'Review recommended')
  const byCat = active.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + 1
    return acc
  }, {})
  const topCat = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0]

  const lines = []

  if (!active.length) {
    lines.push({
      tone: 'emerald',
      title: 'All systems stable',
      body: 'No active operational signals. Workspace calm — monitoring remains online.',
    })
    return lines
  }

  if (topCat) {
    lines.push({
      tone: 'sky',
      title: `Most alerts originate from ${topCat[0]}`,
      body: `${topCat[1]} signal${topCat[1] > 1 ? 's' : ''} in the current window. Prioritize that subsystem if response time matters.`,
    })
  }

  if (action.length) {
    lines.push({
      tone: 'amber',
      title: `${action.length} notification${action.length > 1 ? 's' : ''} may require action`,
      body: 'AI classified these as action-required or review-recommended. Expand cards for routing and resolution.',
    })
  } else {
    lines.push({
      tone: 'emerald',
      title: 'Operational health remains stable',
      body: 'No abnormal system activity detected in the current ingest window.',
    })
  }

  if (unread.length <= 1) {
    lines.push({
      tone: 'violet',
      title: 'AI filtering engine running normally',
      body: 'Signal routing and priority lanes are within expected operational bounds.',
    })
  }

  return lines.slice(0, 4)
}

export function inboxMetrics(signals, state) {
  const active = signals.filter((s) => !state.archived.includes(s.id))
  const unread = active.filter((s) => !state.read.includes(s.id))
  const critical = active.filter((s) => s.severity === 'critical' && !state.resolved.includes(s.id))
  const resolved = state.resolved.length
  const velocity = Math.min(99, active.length * 12 + 18)

  return {
    activeAlerts: active.length - state.resolved.filter((id) => active.some((s) => s.id === id)).length,
    aiFiltered: active.filter((s) => s.severity === 'ai' || s.aiClass === 'Informational').length,
    uptime: 99.2,
    velocity,
    responseRate: resolved ? Math.min(100, Math.round((resolved / (resolved + unread.length || 1)) * 100)) : 72,
    health: critical.length ? Math.max(62, 88 - critical.length * 8) : 94,
  }
}
