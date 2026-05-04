import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export const DEGRADED_MS = 600
export const HISTORY_MAX = 20
export const POLL_INTERVAL_MS = 12_000
const PROBE_TIMEOUT_MS = 10_000
const FE_FETCH_TIMEOUT_MS = 8000
const MAX_EVENTS = 50

/** @typedef {'operational' | 'degraded' | 'down' | 'not_configured'} HealthStatus */

/**
 * @param {number | null} latencyMs
 * @param {string | null} error
 * @returns {HealthStatus}
 */
export function deriveStatus(latencyMs, error) {
  if (error) return 'down'
  if (latencyMs == null) return 'down'
  if (latencyMs > DEGRADED_MS) return 'degraded'
  return 'operational'
}

function pushHistory(history, point) {
  return [...history, point].slice(-HISTORY_MAX)
}

/** @param {{ status: HealthStatus }[]} history */
export function computeUptimePct(history) {
  if (!history.length) return null
  const operational = history.filter((h) => h.status === 'operational').length
  return Math.round((100 * operational) / history.length)
}

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    }),
  ])
}

const SERVICE_LABELS = {
  database: 'Supabase Database',
  auth: 'Supabase Auth',
  storage: 'Supabase Storage',
  frontend: 'Frontend',
  api: 'Backend API',
}

/**
 * @param {Record<string, { status: HealthStatus, latencyMs: number | null }>} prev
 * @param {Record<string, { status: HealthStatus, latencyMs: number | null }>} next
 */
function diffEvents(prev, next) {
  const events = []
  const ts = new Date().toISOString()
  for (const key of Object.keys(next)) {
    if (key === 'api' && next[key].status === 'not_configured') continue
    const p = prev[key]
    const n = next[key]
    if (!p) continue
    if (p.status === n.status && p.latencyMs === n.latencyMs) continue

    const label = SERVICE_LABELS[key] || key

    if (n.status === 'down') {
      events.push({ id: `${ts}-${key}-down`, at: ts, severity: 'critical', message: `${label} unreachable or error` })
    } else if (p.status === 'down' && (n.status === 'operational' || n.status === 'degraded')) {
      events.push({ id: `${ts}-${key}-up`, at: ts, severity: 'info', message: `${label} recovered` })
    } else if (n.status === 'degraded' && p.status === 'operational') {
      events.push({
        id: `${ts}-${key}-slow`,
        at: ts,
        severity: 'warning',
        message: `${label} latency spike (${n.latencyMs != null ? `${Math.round(n.latencyMs)}ms` : 'unknown'})`,
      })
    } else if (n.status === 'operational' && p.status === 'degraded') {
      events.push({ id: `${ts}-${key}-norm`, at: ts, severity: 'info', message: `${label} latency returned to normal` })
    } else if (n.status === 'degraded' && p.status === 'down') {
      events.push({ id: `${ts}-${key}-partial`, at: ts, severity: 'warning', message: `${label} responding but slow` })
    }
  }
  return events
}

function emptyResult(status, error = null, latencyMs = null) {
  return { status, latencyMs, error, checkedAt: new Date().toISOString() }
}

export function useSystemHealth() {
  const [results, setResults] = useState({
    database: emptyResult('down', 'Not checked yet'),
    auth: emptyResult('down', 'Not checked yet'),
    storage: emptyResult('down', 'Not checked yet'),
    frontend: emptyResult('down', 'Not checked yet'),
    api: emptyResult('not_configured', null, null),
  })
  const [histories, setHistories] = useState({
    database: [],
    auth: [],
    storage: [],
    frontend: [],
    api: [],
  })
  const [events, setEvents] = useState([])
  const [lastRunAt, setLastRunAt] = useState(null)
  const [, setTick] = useState(0)
  const [running, setRunning] = useState(false)
  const [initialComplete, setInitialComplete] = useState(false)
  const prevSnapshot = useRef(null)
  const mounted = useRef(true)

  const apiBase = useMemo(() => {
    const raw = import.meta.env.VITE_API_URL
    if (typeof raw !== 'string' || !raw.trim()) return null
    return raw.replace(/\/+$/, '')
  }, [])

  const runOnce = useCallback(async () => {
    if (!mounted.current) return
    setRunning(true)
    const tChecked = new Date().toISOString()
    const now = Date.now()

    const healthOrigin =
      (typeof import.meta.env.VITE_HEALTH_CHECK_ORIGIN === 'string' && import.meta.env.VITE_HEALTH_CHECK_ORIGIN.trim()) ||
      (typeof window !== 'undefined' ? window.location.origin : '')

    const probeDb = async () => {
      if (!isSupabaseConfigured || !supabase) {
        return { key: 'database', latencyMs: null, error: 'Supabase not configured' }
      }
      const t0 = performance.now()
      try {
        const { error } = await withTimeout(
          supabase.from('profile').select('id').limit(1).maybeSingle(),
          PROBE_TIMEOUT_MS,
          'Database'
        )
        const ms = Math.round(performance.now() - t0)
        return { key: 'database', latencyMs: error ? null : ms, error: error?.message || null }
      } catch (e) {
        return { key: 'database', latencyMs: null, error: e?.message || 'Database check failed' }
      }
    }

    const probeAuth = async () => {
      if (!isSupabaseConfigured || !supabase) {
        return { key: 'auth', latencyMs: null, error: 'Supabase not configured' }
      }
      const t0 = performance.now()
      try {
        const { error } = await withTimeout(supabase.auth.getSession(), PROBE_TIMEOUT_MS, 'Auth')
        const ms = Math.round(performance.now() - t0)
        return { key: 'auth', latencyMs: error ? null : ms, error: error?.message || null }
      } catch (e) {
        return { key: 'auth', latencyMs: null, error: e?.message || 'Auth check failed' }
      }
    }

    const probeStorage = async () => {
      if (!isSupabaseConfigured || !supabase) {
        return { key: 'storage', latencyMs: null, error: 'Supabase not configured' }
      }
      const t0 = performance.now()
      try {
        let { error } = await withTimeout(
          supabase.storage.from('logos').list('', { limit: 1 }),
          PROBE_TIMEOUT_MS,
          'Storage'
        )
        if (error) {
          const second = await withTimeout(
            supabase.storage.from('project-images').list('', { limit: 1 }),
            PROBE_TIMEOUT_MS,
            'Storage'
          )
          error = second.error
        }
        const ms = Math.round(performance.now() - t0)
        return { key: 'storage', latencyMs: error ? null : ms, error: error?.message || null }
      } catch (e) {
        return { key: 'storage', latencyMs: null, error: e?.message || 'Storage check failed' }
      }
    }

    const probeFrontend = async () => {
      if (!healthOrigin) {
        return { key: 'frontend', latencyMs: null, error: 'No origin for health check' }
      }
      const t0 = performance.now()
      try {
        const res = await withTimeout(
          fetch(`${healthOrigin}/`, { method: 'GET', cache: 'no-store', signal: AbortSignal.timeout(FE_FETCH_TIMEOUT_MS) }),
          FE_FETCH_TIMEOUT_MS + 500,
          'Frontend'
        )
        const ms = Math.round(performance.now() - t0)
        if (!res.ok) return { key: 'frontend', latencyMs: ms, error: `HTTP ${res.status}` }
        return { key: 'frontend', latencyMs: ms, error: null }
      } catch (e) {
        return { key: 'frontend', latencyMs: null, error: e?.message || 'Frontend unreachable' }
      }
    }

    const probeApi = async () => {
      if (!apiBase) {
        return { key: 'api', latencyMs: null, error: null, skip: true }
      }
      const t0 = performance.now()
      try {
        let res = await fetch(`${apiBase}/health`, {
          method: 'GET',
          cache: 'no-store',
          signal: AbortSignal.timeout(FE_FETCH_TIMEOUT_MS),
        }).catch(() => null)
        if (!res || !res.ok) {
          res = await fetch(`${apiBase}/`, {
            method: 'GET',
            cache: 'no-store',
            signal: AbortSignal.timeout(FE_FETCH_TIMEOUT_MS),
          })
        }
        const ms = Math.round(performance.now() - t0)
        if (!res.ok) return { key: 'api', latencyMs: ms, error: `HTTP ${res.status}`, skip: false }
        return { key: 'api', latencyMs: ms, error: null, skip: false }
      } catch (e) {
        return { key: 'api', latencyMs: null, error: e?.message || 'API unreachable', skip: false }
      }
    }

    const outcomes = await Promise.allSettled([probeDb(), probeAuth(), probeStorage(), probeFrontend(), probeApi()])

    /** @type {Record<string, { status: HealthStatus, latencyMs: number | null, error: string | null, checkedAt: string }>} */
    const nextResults = {}

    for (const o of outcomes) {
      if (o.status !== 'fulfilled') continue
      const r = o.value
      if (r.skip) {
        nextResults.api = { status: 'not_configured', latencyMs: null, error: null, checkedAt: tChecked }
        continue
      }
      const { key } = r
      const status = deriveStatus(r.latencyMs, r.error)
      nextResults[key] = {
        status,
        latencyMs: r.error ? null : r.latencyMs,
        error: r.error,
        checkedAt: tChecked,
      }
    }

    const required = ['database', 'auth', 'storage', 'frontend', 'api']
    for (const k of required) {
      if (!nextResults[k]) {
        nextResults[k] = emptyResult('down', 'Probe did not complete')
      }
    }

    const snapshot = {}
    for (const k of ['database', 'auth', 'storage', 'frontend', 'api']) {
      snapshot[k] = { status: nextResults[k].status, latencyMs: nextResults[k].latencyMs }
    }

    if (prevSnapshot.current) {
      const newEvents = diffEvents(prevSnapshot.current, snapshot)
      if (newEvents.length) {
        setEvents((ev) => [...newEvents, ...ev].slice(0, MAX_EVENTS))
      }
    } else {
      setEvents((ev) =>
        [{ id: `${tChecked}-init`, at: tChecked, severity: 'info', message: 'Health monitoring started' }, ...ev].slice(
          0,
          MAX_EVENTS
        )
      )
    }
    prevSnapshot.current = snapshot

    if (!mounted.current) return

    setResults(nextResults)
    setHistories((prev) => {
      const next = { ...prev }
      for (const k of ['database', 'auth', 'storage', 'frontend', 'api']) {
        if (k === 'api' && nextResults.api.status === 'not_configured') continue
        const row = nextResults[k]
        const status = row.status
        const ms = row.latencyMs
        const point = { t: now, ms, status }
        next[k] = pushHistory(prev[k] || [], point)
      }
      return next
    })

    setLastRunAt(Date.now())
    setRunning(false)
    setInitialComplete(true)
  }, [apiBase])

  useEffect(() => {
    mounted.current = true
    runOnce()
    const id = setInterval(runOnce, POLL_INTERVAL_MS)
    return () => {
      mounted.current = false
      clearInterval(id)
    }
  }, [runOnce])

  useEffect(() => {
    if (!lastRunAt) return undefined
    const id = setInterval(() => setTick((x) => x + 1), 1000)
    return () => clearInterval(id)
  }, [lastRunAt])

  const refresh = useCallback(() => {
    runOnce()
  }, [runOnce])

  const overall = useMemo(() => {
    const list = ['database', 'auth', 'storage', 'frontend', ...(apiBase ? ['api'] : [])]
    for (const k of list) {
      const s = results[k]?.status
      if (s === 'down') return { level: 'down', headline: 'Service disruption', tone: 'red' }
    }
    for (const k of list) {
      const s = results[k]?.status
      if (s === 'degraded') return { level: 'degraded', headline: 'Degraded performance', tone: 'amber' }
    }
    return { level: 'operational', headline: 'All systems operational', tone: 'green' }
  }, [apiBase, results])

  const secondsSinceUpdate = lastRunAt ? Math.max(0, Math.floor((Date.now() - lastRunAt) / 1000)) : null

  return {
    results,
    histories,
    events,
    running,
    initialComplete,
    overall,
    lastRunAt,
    secondsSinceUpdate,
    refresh,
    apiConfigured: Boolean(apiBase),
  }
}
