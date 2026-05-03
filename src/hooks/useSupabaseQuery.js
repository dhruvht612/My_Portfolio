import { useEffect, useRef, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

/**
 * Generic async read against Supabase. Skips when the client is not configured.
 *
 * @template T
 * @param {(client: import('@supabase/supabase-js').SupabaseClient) => Promise<T>} executor
 * @param {import('react').DependencyList} [deps]
 * @returns {{ data: T | null, loading: boolean, error: Error | null }}
 */
export function useSupabaseQuery(executor, deps = []) {
  const fnRef = useRef(executor)
  fnRef.current = executor
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(Boolean(isSupabaseConfigured && supabase))
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setData(null)
      setError(null)
      setLoading(false)
      return undefined
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const result = await fnRef.current(supabase)
        if (!cancelled) setData(result)
      } catch (e) {
        if (!cancelled) {
          setData(null)
          setError(e instanceof Error ? e : new Error(String(e)))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- executor ref; deps are caller-controlled
  }, [isSupabaseConfigured, supabase, ...deps])

  return { data, loading, error }
}
