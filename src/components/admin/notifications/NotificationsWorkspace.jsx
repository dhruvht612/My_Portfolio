import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useToast } from '../../../hooks/useToast'
import NotificationsAIInsights from './NotificationsAIInsights'
import NotificationsAmbient from './NotificationsAmbient'
import NotificationsFilters from './NotificationsFilters'
import NotificationsHeroPanel from './NotificationsHeroPanel'
import NotificationsMetrics from './NotificationsMetrics'
import NotificationsTimeline from './NotificationsTimeline'
import {
  DEFAULT_SIGNALS,
  inboxMetrics,
  loadNotificationState,
  saveNotificationState,
} from './notificationsConfig'

function toggleId(list, id) {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
}

export default function NotificationsWorkspace() {
  const toast = useToast()
  const [signals] = useState(DEFAULT_SIGNALS)
  const [state, setState] = useState(loadNotificationState)
  const [category, setCategory] = useState('all')
  const [priority, setPriority] = useState('all')
  const [status, setStatus] = useState('inbox')
  const [expandedId, setExpandedId] = useState(null)
  const [tick, setTick] = useState(0)
  const [monitoring] = useState(true)

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 4000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    saveNotificationState(state)
  }, [state])

  const filtered = useMemo(() => {
    let list = [...signals]

    if (status === 'archived') list = list.filter((s) => state.archived.includes(s.id))
    else {
      list = list.filter((s) => !state.archived.includes(s.id))
      if (status === 'unread') list = list.filter((s) => !state.read.includes(s.id))
      if (status === 'pinned') list = list.filter((s) => state.pinned.includes(s.id))
    }

    if (category !== 'all') list = list.filter((s) => s.category === category)
    if (priority !== 'all') list = list.filter((s) => s.severity === priority)

    return list.sort((a, b) => a.priority - b.priority || b.at - a.at)
  }, [signals, state, category, priority, status])

  const metrics = useMemo(() => inboxMetrics(signals, state), [signals, state])

  const markRead = useCallback((id) => {
    setState((s) => ({ ...s, read: s.read.includes(id) ? s.read : [...s.read, id] }))
  }, [])

  const onToggle = useCallback(
    (id) => {
      markRead(id)
      setExpandedId((e) => (e === id ? null : id))
    },
    [markRead],
  )

  const onArchive = useCallback(
    (id) => {
      setState((s) => ({
        ...s,
        archived: toggleId(s.archived, id),
        read: [...s.read, id],
      }))
      setExpandedId(null)
      toast.success('Signal archived.')
    },
    [toast],
  )

  const onResolve = useCallback(
    (id) => {
      setState((s) => ({
        ...s,
        resolved: toggleId(s.resolved, id),
        read: [...s.read, id],
      }))
      toast.success('Signal resolved.')
    },
    [toast],
  )

  const onPin = useCallback((id) => {
    setState((s) => ({ ...s, pinned: toggleId(s.pinned, id) }))
  }, [])

  const onImportant = useCallback((id) => {
    setState((s) => ({ ...s, important: toggleId(s.important, id) }))
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'a' && expandedId) {
        e.preventDefault()
        onArchive(expandedId)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && expandedId) {
        e.preventDefault()
        onResolve(expandedId)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [expandedId, onArchive, onResolve])

  return (
    <NotificationsAmbient className="notif-workspace min-h-[min(88vh,920px)] border border-white/[0.06] p-3 md:p-4">
      <motion.div className="space-y-4" initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}>
        <NotificationsHeroPanel signals={signals} state={state} monitoring={monitoring} />
        <NotificationsMetrics metrics={metrics} />

        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,300px)]">
          <NotificationsTimeline
            signals={filtered}
            state={state}
            expandedId={expandedId}
            onToggle={onToggle}
            onArchive={onArchive}
            onResolve={onResolve}
            onPin={onPin}
            onImportant={onImportant}
            tick={tick}
          />
          <aside className="space-y-4">
            <NotificationsFilters
              category={category}
              priority={priority}
              status={status}
              onCategory={setCategory}
              onPriority={setPriority}
              onStatus={setStatus}
            />
            <NotificationsAIInsights signals={signals} state={state} />
            <section className="notif-glass-card p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Hotkeys</p>
              <ul className="mt-2 space-y-1.5 font-mono text-[11px] text-slate-500">
                <li>
                  <kbd className="text-cyan-300/90">⌘K</kbd> command palette
                </li>
                <li>
                  <kbd className="text-cyan-300/90">Ctrl+A</kbd> archive expanded
                </li>
                <li>
                  <kbd className="text-cyan-300/90">Ctrl+Enter</kbd> resolve expanded
                </li>
              </ul>
            </section>
          </aside>
        </motion.div>
      </motion.div>
    </NotificationsAmbient>
  )
}
