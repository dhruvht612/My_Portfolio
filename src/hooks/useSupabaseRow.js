import { useCallback, useEffect, useState } from 'react'
import { isSupabaseConfigured } from '../lib/supabase'
import { ensureClient, fetchSingle } from '../lib/admin/queries'
import { useToast } from './useToast'

/**
 * Single-row table (profile, education).
 * @param {'profile' | 'education'} table
 */
export function useSupabaseRow(table) {
  const toast = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setData(null)
      setError(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const row = await fetchSingle(table)
      setData(row)
      setError(null)
    } catch (e) {
      setError(e)
      if (e.code !== 'NOT_CONFIGURED') toast.error(e.message || 'Failed to load')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [table, toast])

  useEffect(() => {
    refresh()
  }, [refresh])

  const save = useCallback(
    async (payload) => {
      if (!isSupabaseConfigured) return
      const c = ensureClient()
      try {
        if (data?.id) {
          const { data: row, error: err } = await c.from(table).update(payload).eq('id', data.id).select().single()
          if (err) throw err
          setData(row)
          toast.success('Saved')
        } else {
          const { data: row, error: err } = await c.from(table).insert(payload).select().single()
          if (err) throw err
          setData(row)
          toast.success('Saved')
        }
      } catch (e) {
        toast.error(e.message || 'Save failed')
        throw e
      }
    },
    [data, table, toast],
  )

  return { data, loading, error, refresh, save, setData }
}
