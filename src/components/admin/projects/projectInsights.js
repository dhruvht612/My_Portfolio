/** Stable pseudo-metrics from project id/title (no analytics backend). */
function hash(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i)
  return Math.abs(h)
}

export function projectMetrics(row) {
  const key = row?.id || row?.title || 'p'
  const h = hash(String(key))
  const views = 120 + (h % 2400)
  const engagement = 42 + (h % 52)
  const clicks = 18 + (h % 180)
  const trend = (h % 3) - 1
  const rank = 1 + (h % 12)
  return { views, engagement, clicks, trend, rank }
}

export function sparklinePoints(row, n = 8) {
  const h = hash(String(row?.id || row?.title || ''))
  return Array.from({ length: n }, (_, i) => 20 + ((h >> (i % 8)) & 0xff) % 70)
}

export function deploymentState(row) {
  if (row?.is_disabled) return { key: 'dev', label: 'In development', tone: 'amber' }
  if (row?.live_url && String(row.live_url).startsWith('http')) return { key: 'live', label: 'Live', tone: 'emerald' }
  if (row?.code_url) return { key: 'staging', label: 'Staging', tone: 'violet' }
  return { key: 'offline', label: 'Offline', tone: 'slate' }
}

export function topTechStacks(rows = [], limit = 5) {
  const counts = new Map()
  for (const r of rows) {
    for (const t of r.tech_stack || []) {
      if (!t) continue
      counts.set(t, (counts.get(t) || 0) + 1)
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit)
}

export function topCategories(rows = []) {
  const counts = new Map()
  for (const r of rows) {
    for (const c of r.categories || []) {
      if (!c) continue
      const k = String(c).toLowerCase()
      counts.set(k, (counts.get(k) || 0) + 1)
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])
}

export function generateInsights(rows = []) {
  const lines = []
  const tech = topTechStacks(rows, 3)
  const cats = topCategories(rows)
  const featured = rows.filter((r) => r.is_featured)
  const live = rows.filter((r) => !r.is_disabled && r.live_url)

  if (tech.length) {
    const [top, n] = tech[0]
    lines.push({
      tone: 'sky',
      title: `${top} anchors your portfolio`,
      body: `${n} project${n === 1 ? '' : 's'} highlight ${top}. Pair new builds with this stack for consistent narrative across the showcase.`,
    })
  }

  if (cats.length) {
    lines.push({
      tone: 'violet',
      title: `Strong ${cats[0][0]} cluster`,
      body: `Category density suggests visitors will discover you through ${cats[0][0]} work — keep thumbnails and live links polished.`,
    })
  }

  const a11y = rows.filter((r) => (r.categories || []).some((c) => /access|a11y/i.test(String(c))))
  if (a11y.length) {
    lines.push({
      tone: 'cyan',
      title: 'Accessibility-focused builds stand out',
      body: `${a11y.length} project${a11y.length === 1 ? '' : 's'} tag accessibility — these often convert better when screenshots show inclusive UX.`,
    })
  }

  if (featured.length) {
    lines.push({
      tone: 'amber',
      title: 'Feature your flagship on the homepage',
      body: `"${featured[0].title}" is marked featured — ensure hero imagery and deployment status are current.`,
    })
  } else if (rows.length) {
    lines.push({
      tone: 'amber',
      title: 'No featured project selected',
      body: 'Mark one build as featured to power the cinematic spotlight and homepage priority.',
    })
  }

  if (live.length < rows.length && rows.length) {
    lines.push({
      tone: 'emerald',
      title: 'Deployment opportunities',
      body: `${rows.length - live.length} project${rows.length - live.length === 1 ? '' : 's'} lack live URLs — add demos to lift engagement signals.`,
    })
  }

  if (!lines.length) {
    lines.push({
      tone: 'sky',
      title: 'Portfolio OS ready',
      body: 'Add your first project to unlock stack analysis, deployment intelligence, and AI recommendations.',
    })
  }

  return lines.slice(0, 4)
}

export function filterProjects(rows, { query, category, tech, status, sort }) {
  let list = [...rows]
  const q = query?.trim().toLowerCase()

  if (q) {
    list = list.filter(
      (r) =>
        r.title?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        (r.tech_stack || []).some((t) => t.toLowerCase().includes(q)) ||
        (r.categories || []).some((c) => String(c).toLowerCase().includes(q)),
    )
  }

  if (category && category !== 'all') {
    list = list.filter((r) => (r.categories || []).map((c) => String(c).toLowerCase()).includes(category.toLowerCase()))
  }

  if (tech && tech !== 'all') {
    list = list.filter((r) => (r.tech_stack || []).includes(tech))
  }

  if (status === 'live') list = list.filter((r) => !r.is_disabled)
  if (status === 'disabled') list = list.filter((r) => r.is_disabled)
  if (status === 'featured') list = list.filter((r) => r.is_featured)

  if (sort === 'title') list.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
  else if (sort === 'tech') list.sort((a, b) => (b.tech_stack?.length || 0) - (a.tech_stack?.length || 0))
  else list.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))

  return list
}
