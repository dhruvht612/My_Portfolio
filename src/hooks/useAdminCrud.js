import { useCallback, useEffect, useState } from 'react'
import { isSupabaseConfigured } from '../lib/supabase'
import { deleteRow, insertRow, listTable, updateRow } from '../lib/admin/queries'
import { useToast } from './useToast'

/**
 * Generic list + CRUD for a Supabase table.
 * @param {string} table
 * @param {{ column: string, ascending?: boolean }} [order]
 */
export function useAdminCrud(table, order = { column: 'display_order', ascending: true }) {
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const orderKey = JSON.stringify(order)

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setRows([])
      setError(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const ord = JSON.parse(orderKey)
      const data = await listTable(table, ord)
      setRows(data)
      setError(null)
    } catch (e) {
      setError(e)
      if (e.code !== 'NOT_CONFIGURED') toast.error(e.message || 'Failed to load')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [table, orderKey, toast])

  useEffect(() => {
    refresh()
  }, [refresh])

  const create = useCallback(
    async (row) => {
      if (!isSupabaseConfigured) return null
      try {
        const data = await insertRow(table, row)
        toast.success('Created')
        await refresh()
        return data
      } catch (e) {
        toast.error(e.message || 'Create failed')
        throw e
      }
    },
    [table, refresh, toast],
  )

  const update = useCallback(
    async (id, patch) => {
      if (!isSupabaseConfigured) return null
      try {
        const data = await updateRow(table, id, patch)
        toast.success('Saved')
        await refresh()
        return data
      } catch (e) {
        toast.error(e.message || 'Update failed')
        throw e
      }
    },
    [table, refresh, toast],
  )

  const remove = useCallback(
    async (id) => {
      if (!isSupabaseConfigured) return
      try {
        await deleteRow(table, id)
        toast.success('Deleted')
        await refresh()
      } catch (e) {
        toast.error(e.message || 'Delete failed')
        throw e
      }
    },
    [table, refresh, toast],
  )

  /** Updates display_order only; does not toast or refresh (call `refresh` after batch swaps). */
  const reorder = useCallback(
    async (id, newOrder) => {
      if (!isSupabaseConfigured) return
      try {
        await updateRow(table, id, { display_order: newOrder })
      } catch (e) {
        toast.error(e.message || 'Reorder failed')
        throw e
      }
    },
    [table, toast],
  )

  return { rows, loading, error, refresh, create, update, remove, reorder }
}
