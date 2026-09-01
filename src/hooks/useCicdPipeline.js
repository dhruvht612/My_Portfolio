import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { logsService, pipelineService } from '../services/cicd'

/**
 * Loads and owns the CI/CD dashboard snapshot.
 *
 * Exposes the three states the UI actually renders — `loading`, `error`,
 * `ready` — rather than a bare `data` object, so skeleton and failure paths are
 * impossible to forget at the call site. `refresh()` keeps the previous
 * snapshot on screen while it re-fetches, so the page never flashes empty.
 *
 * Appending `?cicdFail=1` to the URL forces the provider call to reject. That
 * makes the error path reachable in a browser without editing code, which is
 * the only way to keep it honest as the page evolves.
 */
export function useCicdPipeline() {
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [checkedAt, setCheckedAt] = useState(null)
  const abortRef = useRef(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      abortRef.current?.abort()
    }
  }, [])

  const load = useCallback(async ({ isRefresh = false } = {}) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    if (isRefresh) setRefreshing(true)
    else setStatus('loading')
    setError(null)

    try {
      const forceFail =
        typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('cicdFail') === '1'
      const snapshot = await pipelineService.getSnapshot({ signal: controller.signal })
      if (forceFail) throw new Error('Provider unreachable (simulated via ?cicdFail=1)')
      if (!mountedRef.current || controller.signal.aborted) return
      setData(snapshot)
      setCheckedAt(snapshot.checkedAt)
      setStatus('ready')
    } catch (err) {
      if (err?.name === 'AbortError' || !mountedRef.current) return
      setError(err)
      setStatus('error')
    } finally {
      if (mountedRef.current) setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const refresh = useCallback(() => load({ isRefresh: true }), [load])

  return { data, status, error, refreshing, checkedAt, refresh }
}

/**
 * Appends synthetic lines to the log stream while `live` is true.
 *
 * The buffer is capped so a tab left open overnight cannot grow without bound.
 * Pausing stops the timer outright rather than filtering, so a paused stream
 * costs nothing.
 */
export function useLiveLogs(initialLogs, live, { intervalMs = 2600, max = 300 } = {}) {
  // Only the streamed lines are state; the fetched transcript stays a prop.
  // A refresh replaces the transcript, so the tail resets with it — handled by
  // adjusting state during render rather than in an effect, which avoids a
  // second render pass showing the old tail against the new transcript.
  const [base, setBase] = useState(initialLogs)
  const [tail, setTail] = useState([])
  const cursor = useRef(0)

  if (base !== initialLogs) {
    setBase(initialLogs)
    setTail([])
  }

  useEffect(() => {
    if (!live) return undefined
    const id = window.setInterval(() => {
      const next = logsService.tail(cursor.current++)
      setTail((prev) => [...prev, next])
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [live, intervalMs])

  return useMemo(() => {
    const all = [...(initialLogs || []), ...tail]
    return all.length > max ? all.slice(all.length - max) : all
  }, [initialLogs, tail, max])
}

/**
 * Advances the in-flight stage so a running pipeline visibly progresses.
 * Holds just short of complete — the stage finishes when the backend says so,
 * not because a timer ran out.
 */
export function useStageProgress(initial = 0, { active = true, reduced = false } = {}) {
  // State holds only the drift accumulated since the backend figure arrived, so
  // a new `initial` from a refresh is respected without a sync effect.
  const [drift, setDrift] = useState(0)
  const [base, setBase] = useState(initial)

  if (base !== initial) {
    setBase(initial)
    setDrift(0)
  }

  useEffect(() => {
    if (!active || reduced) return undefined
    const id = window.setInterval(() => setDrift((d) => d + 0.012), 900)
    return () => window.clearInterval(id)
  }, [active, reduced])

  return Math.min(0.94, initial + drift)
}

export default useCicdPipeline
