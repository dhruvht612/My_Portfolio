import { motion } from 'framer-motion'
import { accentColor } from './settingsConfig'
import { SettingsChipGroup, SettingsColorChips, SettingsSlider, SettingsToggle } from './SettingsControls'

const INTENSITY_MAP = { low: 25, balanced: 55, high: 90 }

export default function SettingsModulePanel({ moduleId, settings, onChange }) {
  const patch = (key, value) => onChange({ ...settings, [key]: value })

  if (moduleId === 'appearance') {
    const previewAccent = accentColor(settings.accent)
    const motionVal = INTENSITY_MAP[settings.motionIntensity] ?? 55

    return (
      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 border-t border-white/[0.06] pt-4">
        <div className="set-preview-panel overflow-hidden rounded-xl border border-white/[0.08] p-3" style={{ boxShadow: `0 0 40px ${previewAccent}22` }}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Live preview</p>
          <motion.div className="mt-2 rounded-lg border border-white/10 bg-black/30 p-3" animate={{ scale: [1, 1 + motionVal / 2000, 1] }} transition={{ duration: 2 + motionVal / 40, repeat: Infinity }}>
            <motion.div className="h-2 w-24 rounded-full" style={{ background: `linear-gradient(90deg, ${previewAccent}, transparent)` }} />
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[1, 2, 3].map((n) => (
                <motion.div key={n} className="h-8 rounded-md border border-white/10 bg-white/[0.04]" whileHover={{ borderColor: `${previewAccent}66` }} />
              ))}
            </div>
          </motion.div>
        </div>
        <SettingsChipGroup
          label="Theme engine"
          value={settings.theme}
          onChange={(v) => patch('theme', v)}
          options={[
            { value: 'dark', label: 'Dark' },
            { value: 'midnight', label: 'Midnight' },
            { value: 'aurora', label: 'Aurora' },
          ]}
        />
        <SettingsColorChips
          label="Accent system"
          value={settings.accent}
          onChange={(v) => patch('accent', v)}
          options={[
            { value: 'sky', label: 'Sky', color: '#38bdf8' },
            { value: 'violet', label: 'Violet', color: '#818cf8' },
            { value: 'emerald', label: 'Emerald', color: '#34d399' },
            { value: 'amber', label: 'Amber', color: '#fbbf24' },
          ]}
        />
        <SettingsChipGroup
          label="Motion intensity"
          value={settings.motionIntensity}
          onChange={(v) => patch('motionIntensity', v)}
          options={[
            { value: 'low', label: 'Low' },
            { value: 'balanced', label: 'Balanced' },
            { value: 'high', label: 'High' },
          ]}
        />
        <SettingsChipGroup
          label="UI density"
          value={settings.density}
          onChange={(v) => patch('density', v)}
          options={[
            { value: 'compact', label: 'Compact' },
            { value: 'comfortable', label: 'Comfortable' },
            { value: 'spacious', label: 'Spacious' },
          ]}
        />
        <SettingsChipGroup
          label="Ambient lighting"
          value={settings.ambientLighting}
          onChange={(v) => patch('ambientLighting', v)}
          options={[
            { value: 'off', label: 'Off' },
            { value: 'subtle', label: 'Subtle' },
            { value: 'rich', label: 'Rich' },
          ]}
        />
        <SettingsToggle label="Developer mode" hint="Enable extended HUD overlays and denser diagnostics." checked={settings.developerMode} onChange={(v) => patch('developerMode', v)} />
      </motion.div>
    )
  }

  if (moduleId === 'notifications') {
    const intensityVal = settings.notificationIntensity === 'low' ? 30 : settings.notificationIntensity === 'high' ? 90 : 60
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 border-t border-white/[0.06] pt-4">
        <div className="set-signal-graph rounded-xl border border-white/[0.06] bg-black/25 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Signal flow</p>
          <div className="mt-2 flex h-12 items-end gap-1">
            {Array.from({ length: 12 }, (_, i) => (
              <motion.div
                key={i}
                className="flex-1 rounded-t bg-violet-400/50"
                animate={{ height: [`${20 + (i % 3) * 10}%`, `${intensityVal - i * 3}%`, `${25 + (i % 4) * 8}%`] }}
                transition={{ duration: 1.2 + i * 0.08, repeat: Infinity, repeatType: 'reverse' }}
              />
            ))}
          </div>
        </div>
        <SettingsToggle label="Notification bus" hint="Master switch for admin alert routing." checked={settings.notificationsEnabled} onChange={(v) => patch('notificationsEnabled', v)} />
        <SettingsChipGroup
          label="Alert intensity"
          value={settings.notificationIntensity}
          onChange={(v) => patch('notificationIntensity', v)}
          options={[
            { value: 'low', label: 'Low' },
            { value: 'normal', label: 'Normal' },
            { value: 'high', label: 'High' },
          ]}
        />
        <SettingsChipGroup
          label="Digest frequency"
          value={settings.digestFrequency}
          onChange={(v) => patch('digestFrequency', v)}
          options={[
            { value: 'realtime', label: 'Realtime' },
            { value: 'hourly', label: 'Hourly' },
            { value: 'daily', label: 'Daily' },
          ]}
        />
        <SettingsToggle label="AI filtering" hint="Suppress low-signal noise in the alert mesh." checked={settings.aiFiltering} onChange={(v) => patch('aiFiltering', v)} />
      </motion.div>
    )
  }

  if (moduleId === 'security') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 border-t border-white/[0.06] pt-4">
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { label: 'Auth health', value: 'JWT verified', ok: true },
            { label: 'Device trust', value: settings.deviceTrustMonitor ? 'Monitoring' : 'Paused', ok: settings.deviceTrustMonitor },
            { label: 'Session shield', value: settings.sessionProtection, ok: settings.sessionProtection === 'hardened' },
            { label: 'Protection pulse', value: 'Active', ok: true },
          ].map((row) => (
            <motion.div key={row.label} whileHover={{ x: 2 }} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">{row.label}</p>
                <p className="text-xs text-slate-200">{row.value}</p>
              </div>
              <span className={`set-trust-chip ${row.ok ? 'set-trust-ok' : 'set-trust-warn'}`}>{row.ok ? 'OK' : 'Review'}</span>
            </motion.div>
          ))}
        </div>
        <SettingsChipGroup
          label="Session protection"
          value={settings.sessionProtection}
          onChange={(v) => patch('sessionProtection', v)}
          options={[
            { value: 'standard', label: 'Standard' },
            { value: 'hardened', label: 'Hardened' },
          ]}
        />
        <SettingsToggle label="Device trust monitor" hint="Track trusted device patterns for this workspace." checked={settings.deviceTrustMonitor} onChange={(v) => patch('deviceTrustMonitor', v)} />
      </motion.div>
    )
  }

  if (moduleId === 'preferences') {
    const shortcuts = [
      { key: '⌘/Ctrl + K', action: 'Command palette' },
      { key: '?', action: 'Shortcuts overlay' },
      { key: '⌘/Ctrl + S', action: 'Save configuration' },
      { key: 'Esc', action: 'Close overlays' },
    ]
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 border-t border-white/[0.06] pt-4">
        <SettingsToggle label="Command palette" hint="Enable ⌘K quick navigation surface." checked={settings.commandPalette} onChange={(v) => patch('commandPalette', v)} />
        <SettingsToggle label="Keyboard shortcuts" hint="Global shortcut bindings for power users." checked={settings.shortcutsEnabled} onChange={(v) => patch('shortcutsEnabled', v)} />
        <SettingsToggle label="Focus mode" hint="Reduce visual noise during deep work sessions." checked={settings.focusMode} onChange={(v) => patch('focusMode', v)} />
        <SettingsChipGroup
          label="Layout preset"
          value={settings.layoutPreset}
          onChange={(v) => patch('layoutPreset', v)}
          options={[
            { value: 'default', label: 'Default' },
            { value: 'dense', label: 'Dense' },
            { value: 'wide', label: 'Wide' },
          ]}
        />
        <div className="set-terminal-keys rounded-xl border border-white/[0.06] bg-black/30 p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Keyboard map</p>
          <ul className="space-y-1.5">
            {shortcuts.map((s) => (
              <li key={s.key} className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-slate-400">{s.action}</span>
                <kbd className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-cyan-300/90">{s.key}</kbd>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    )
  }

  return null
}
