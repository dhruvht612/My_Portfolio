import { eachDayOfInterval, format, startOfDay, subDays } from 'date-fns'
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

export async function fetchRecentActivity(limit = 12) {
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
  return chunks.flat().sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, limit)
}

/** Daily visit counts for charts (best-effort — empty if `page_views` missing or RLS blocks). */
export async function fetchPageViewsDailyBuckets(days = 14) {
  const c = ensureClient()
  const end = startOfDay(new Date())
  const start = startOfDay(subDays(end, Math.max(1, days) - 1))
  const dayKeys = eachDayOfInterval({ start, end }).map((d) => format(d, 'yyyy-MM-dd'))
  const base = dayKeys.map((day) => ({ day, count: 0 }))

  try {
    const { data, error } = await c
      .from('page_views')
      .select('viewed_at')
      .gte('viewed_at', start.toISOString())
      .lte('viewed_at', new Date(end.getTime() + 86400000 - 1).toISOString())

    if (error) return { series: base, error: error.message }

    const bucket = Object.fromEntries(dayKeys.map((d) => [d, 0]))
    for (const row of data || []) {
      if (!row.viewed_at) continue
      const k = format(startOfDay(new Date(row.viewed_at)), 'yyyy-MM-dd')
      if (k in bucket) bucket[k]++
    }
    return { series: dayKeys.map((day) => ({ day, count: bucket[day] })), error: null }
  } catch (e) {
    return { series: base, error: e?.message || 'unknown' }
  }
}

/** Top paths in the last window (for insights). */
export async function fetchTopPagePaths(days = 14, limit = 6) {
  const c = ensureClient()
  const start = startOfDay(subDays(new Date(), Math.max(1, days) - 1))
  try {
    const { data, error } = await c.from('page_views').select('path').gte('viewed_at', start.toISOString())
    if (error) return { paths: [], error: error.message }
    const counts = {}
    for (const row of data || []) {
      const p = row.path || '/'
      counts[p] = (counts[p] || 0) + 1
    }
    const paths = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([path, hits]) => ({ path, hits }))
    return { paths, error: null }
  } catch (e) {
    return { paths: [], error: e?.message || 'unknown' }
  }
}

/** Tag frequency across projects for lightweight intelligence. */
/** Count rows updated across core tables since `isoSince` — lightweight activity velocity. */
export async function countRecentUpdatesSince(isoSince) {
  const c = ensureClient()
  const tables = ['projects', 'blog_posts', 'certifications', 'experiences', 'skills']
  const parts = await Promise.all(
    tables.map(async (table) => {
      const { count, error } = await c.from(table).select('*', { count: 'exact', head: true }).gte('updated_at', isoSince)
      if (error) return 0
      return count ?? 0
    })
  )
  return parts.reduce((a, b) => a + b, 0)
}

export async function fetchProjectTechFrequency() {
  const c = ensureClient()
  try {
    const { data, error } = await c.from('projects').select('tech_stack, categories')
    if (error) return { tags: [], error: error.message }
    const freq = {}
    for (const row of data || []) {
      const tags = [...(row.tech_stack || []), ...(row.categories || [])].map((x) => String(x).toLowerCase().trim()).filter(Boolean)
      for (const t of tags) {
        freq[t] = (freq[t] || 0) + 1
      }
    }
    const tags = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([tag, n]) => ({ tag, n }))
    return { tags, error: null }
  } catch (e) {
    return { tags: [], error: e?.message || 'unknown' }
  }
}
