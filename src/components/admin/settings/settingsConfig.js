export const STORAGE_KEY = 'admin.workspace.settings'

export const DEFAULT_SETTINGS = {
  theme: 'dark',
  accent: 'sky',
  motionIntensity: 'balanced',
  density: 'comfortable',
  ambientLighting: 'subtle',
  developerMode: false,
  notificationsEnabled: true,
  notificationIntensity: 'normal',
  digestFrequency: 'hourly',
  aiFiltering: true,
  sessionProtection: 'hardened',
  deviceTrustMonitor: true,
  commandPalette: true,
  focusMode: false,
  shortcutsEnabled: true,
  layoutPreset: 'default',
}

export const MODULES = [
  {
    id: 'appearance',
    title: 'Appearance',
    subtitle: 'Visual engine & motion subsystem',
    copy: 'Theme engine, accent routing, motion intensity, UI density, and ambient lighting.',
    statusLabel: 'Motion Engine',
    statusFn: (s) => (s.motionIntensity === 'high' ? 'Performance' : s.motionIntensity === 'low' ? 'Reduced' : 'Optimized'),
    tone: 'sky',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    subtitle: 'Signal routing & alert mesh',
    copy: 'Alert intensity, digest cadence, AI filtering, and priority lanes.',
    statusLabel: 'Notification Bus',
    statusFn: (s) => (s.notificationsEnabled ? 'Active' : 'Muted'),
    tone: 'violet',
  },
  {
    id: 'security',
    title: 'Security',
    subtitle: 'Protection layer & trust mesh',
    copy: 'Session hardening, device trust monitoring, and authentication health.',
    statusLabel: 'Security Layer',
    statusFn: (s) => (s.sessionProtection === 'hardened' ? 'Hardened' : 'Standard'),
    tone: 'emerald',
  },
  {
    id: 'preferences',
    title: 'Preferences',
    subtitle: 'Productivity & command surface',
    copy: 'Command palette, shortcuts, focus modes, and workspace layout presets.',
    statusLabel: 'Command Surface',
    statusFn: (s) => (s.commandPalette && s.shortcutsEnabled ? 'Armed' : 'Partial'),
    tone: 'cyan',
  },
]

const ACCENT_COLORS = {
  sky: '#38bdf8',
  violet: '#818cf8',
  emerald: '#34d399',
  amber: '#fbbf24',
}

export function loadSettings() {
  if (typeof window === 'undefined') return { ...DEFAULT_SETTINGS }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function accentColor(accent) {
  return ACCENT_COLORS[accent] || ACCENT_COLORS.sky
}

export function workspaceHealthScore(settings) {
  let score = 78
  if (settings.motionIntensity === 'balanced') score += 6
  if (settings.sessionProtection === 'hardened') score += 8
  if (settings.notificationsEnabled) score += 4
  if (settings.deviceTrustMonitor) score += 4
  if (settings.developerMode) score -= 2
  return Math.min(100, Math.max(0, score))
}

export function generateSettingsInsights(settings) {
  const lines = []
  const motion = settings.motionIntensity

  lines.push({
    tone: motion === 'balanced' ? 'emerald' : 'sky',
    title: motion === 'balanced' ? 'Balanced motion mode recommended' : `Motion engine set to ${motion}`,
    body:
      motion === 'high'
        ? 'High motion increases visual feedback but may feel heavy on lower-end devices. Consider balanced for daily admin work.'
        : motion === 'low'
          ? 'Reduced motion minimizes animation overhead — ideal for focus sessions or accessibility preferences.'
          : 'Balanced motion delivers cinematic polish without unnecessary GPU load on the admin shell.',
  })

  if (settings.sessionProtection === 'hardened') {
    lines.push({
      tone: 'emerald',
      title: 'Security configuration meets best practices',
      body: 'Hardened session protection with device trust monitoring keeps your workspace aligned with production admin posture.',
    })
  }

  if (settings.notificationsEnabled && settings.aiFiltering) {
    lines.push({
      tone: 'violet',
      title: 'AI notification filtering active',
      body: 'Signal routing prioritizes actionable events while suppressing low-signal noise in the alert mesh.',
    })
  }

  if (settings.developerMode) {
    lines.push({
      tone: 'cyan',
      title: 'Developer mode engaged',
      body: 'Extended diagnostics and denser HUD overlays are available across the workspace control plane.',
    })
  }

  lines.push({
    tone: 'sky',
    title: 'Workspace performance optimized',
    body: `Environment synced · ${settings.density} density · ${settings.ambientLighting} ambient lighting.`,
  })

  return lines.slice(0, 4)
}

export function buildActivityFromSave(prev, label) {
  return [{ id: `save-${Date.now()}`, type: 'sync', label, detail: 'Configuration persisted to local workspace store', at: Date.now() }, ...prev].slice(0, 10)
}
