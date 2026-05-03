import { supabase } from '../supabase'

export function ensureClient() {
  if (!supabase) {
    const e = new Error('NOT_CONFIGURED')
    e.code = 'NOT_CONFIGURED'
    throw e
  }
  return supabase
}

export async function listTable(table, order = { column: 'display_order', ascending: true }) {
  const c = ensureClient()
  const { data, error } = await c.from(table).select('*').order(order.column, { ascending: order.ascending })
  if (error) throw error
  return data ?? []
}

export async function insertRow(table, row) {
  const c = ensureClient()
  const { data, error } = await c.from(table).insert(row).select().single()
  if (error) throw error
  return data
}

export async function updateRow(table, id, patch) {
  const c = ensureClient()
  const { data, error } = await c.from(table).update(patch).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteRow(table, id) {
  const c = ensureClient()
  const { error } = await c.from(table).delete().eq('id', id)
  if (error) throw error
}

export async function fetchSingle(table) {
  const c = ensureClient()
  const { data, error } = await c.from(table).select('*').limit(1).maybeSingle()
  if (error) throw error
  return data
}

export async function fetchRowById(table, id) {
  const c = ensureClient()
  const { data, error } = await c.from(table).select('*').eq('id', id).single()
  if (error) throw error
  return data
}

/** @returns {string[]} */
export async function listSlugs(table, excludeId) {
  const c = ensureClient()
  let q = c.from(table).select('id, slug')
  const { data, error } = await q
  if (error) throw error
  return (data || []).filter((r) => (excludeId ? r.id !== excludeId : true)).map((r) => r.slug)
}

export async function countTable(table, filter) {
  const c = ensureClient()
  let q = c.from(table).select('*', { count: 'exact', head: true })
  if (filter) {
    Object.entries(filter).forEach(([k, v]) => {
      if (v !== undefined && v !== null) q = q.eq(k, v)
    })
  }
  const { count, error } = await q
  if (error) throw error
  return count ?? 0
}

export async function countBlogByStatus() {
  const c = ensureClient()
  const { count: draft, error: e1 } = await c.from('blog_posts').select('*', { count: 'exact', head: true }).eq('status', 'draft')
  const { count: pub, error: e2 } = await c.from('blog_posts').select('*', { count: 'exact', head: true }).eq('status', 'published')
  if (e1) throw e1
  if (e2) throw e2
  return { draft: draft ?? 0, published: pub ?? 0 }
}

export async function fetchRecentActivity() {
  const c = ensureClient()
  const tables = [
    { table: 'projects', labelKey: 'title' },
    { table: 'blog_posts', labelKey: 'title' },
    { table: 'certifications', labelKey: 'title' },
    { table: 'experiences', labelKey: 'role_title' },
    { table: 'skills', labelKey: 'name' },
  ]
  const chunks = await Promise.all(
    tables.map(async ({ table, labelKey }) => {
      const { data, error } = await c.from(table).select(`id, updated_at, ${labelKey}`).order('updated_at', { ascending: false }).limit(1)
      if (error) return []
      return (data || []).map((r) => ({
        id: r.id,
        table,
        label: r[labelKey] || table,
        updated_at: r.updated_at,
      }))
    }),
  )
  return chunks.flat().sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 5)
}
