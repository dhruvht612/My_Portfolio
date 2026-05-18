import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Palette, Shield, SlidersHorizontal } from 'lucide-react'
import { useToast } from '../../../hooks/useToast'
import SettingsAIInsights from './SettingsAIInsights'
import SettingsAmbient from './SettingsAmbient'
import SettingsHeroPanel from './SettingsHeroPanel'
import SettingsModuleCard from './SettingsModuleCard'
import SettingsStatusWidgets from './SettingsStatusWidgets'
import SettingsStickyFooter from './SettingsStickyFooter'
import {
  DEFAULT_SETTINGS,
  MODULES,
  buildActivityFromSave,
  loadSettings,
  saveSettings,
} from './settingsConfig'

const MODULE_ICONS = {
  appearance: Palette,
  notifications: Bell,
  security: Shield,
  preferences: SlidersHorizontal,
}

export default function SettingsWorkspace() {
  const toast = useToast()
  const [settings, setSettings] = useState(loadSettings)
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(loadSettings()))
  const [expanded, setExpanded] = useState('appearance')
  const [saveState, setSaveState] = useState('idle')
  const [syncState, setSyncState] = useState('live')
  const [saving, setSaving] = useState(false)
  const [activity, setActivity] = useState([
    { id: 'boot', type: 'sync', label: 'Workspace boot', detail: 'Configuration store initialized', at: Date.now() - 180_000 },
  ])

  const isDirty = useMemo(() => JSON.stringify(settings) !== savedSnapshot, [settings, savedSnapshot])

  useEffect(() => {
    if (isDirty) setSaveState('dirty')
    else if (saveState === 'dirty') setSaveState('idle')
  }, [isDirty, saveState])

  const handleSave = useCallback(() => {
    setSaving(true)
    setSyncState('syncing')
    window.setTimeout(() => {
      saveSettings(settings)
      setSavedSnapshot(JSON.stringify(settings))
      setSaving(false)
      setSyncState('saved')
      setSaveState('saved')
      setActivity((prev) => buildActivityFromSave(prev, 'Configuration saved'))
      toast.success('Workspace configuration saved.')
      window.setTimeout(() => {
        setSyncState('live')
        setSaveState('idle')
      }, 2200)
    }, 520)
  }, [settings, toast])

  const handleReset = useCallback(() => {
    setSettings({ ...DEFAULT_SETTINGS })
    setSaveState('dirty')
    setActivity((prev) => buildActivityFromSave(prev, 'Defaults restored'))
    toast.success('Settings reset to defaults. Save to persist.')
  }, [toast])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (isDirty) handleSave()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleSave, isDirty])

  return (
    <SettingsAmbient className="set-workspace min-h-[min(88vh,920px)] border border-white/[0.06] p-3 md:p-4">
      <motion.div
        className="space-y-4"
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
      >
        <SettingsHeroPanel settings={settings} syncState={syncState} />
        <SettingsStatusWidgets settings={settings} />

        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,300px)]">
          <div className="grid gap-3 md:grid-cols-2">
            {MODULES.map((mod) => (
              <SettingsModuleCard
                key={mod.id}
                module={mod}
                icon={MODULE_ICONS[mod.id]}
                settings={settings}
                onChange={setSettings}
                expanded={expanded === mod.id}
                onToggle={() => setExpanded((id) => (id === mod.id ? '' : mod.id))}
              />
            ))}
          </div>
          <aside className="space-y-4">
            <SettingsAIInsights settings={settings} />
            <section className="set-glass-card p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Activity log</p>
              <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto">
                {activity.map((e) => (
                  <li key={e.id} className="rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2 font-mono text-[11px]">
                    <span className="text-cyan-400/80">›</span> {e.label}
                    <span className="ml-2 text-slate-600">{new Date(e.at).toLocaleTimeString()}</span>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </motion.div>

        <SettingsStickyFooter saveState={saveState} saving={saving} isDirty={isDirty} onReset={handleReset} onSave={handleSave} />
      </motion.div>
    </SettingsAmbient>
  )
}
