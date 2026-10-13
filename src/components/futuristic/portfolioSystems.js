/**
 * Presentation-only mapping from the portfolio data layer to the city's
 * "systems". No content lives here — every name, date, description and stack
 * is read from PortfolioContext (Supabase, falling back to src/data/*). This
 * module only decides which project gets which district of the city.
 */

/* The prompt's featured order. A project is matched by id or title, so the
   mapping survives the Supabase rows having UUIDs where src/data has slugs. */
const SUBSYSTEMS = [
  { match: /disputr/i, system: 'Decentralized network', view: 'network' },
  { match: /medguard/i, system: 'AI health intelligence system', view: 'health' },
  { match: /wisely/i, system: 'Financial intelligence system', view: 'finance' },
  { match: /\btrails?\b/i, system: 'Autonomous navigation / accessibility system', view: 'route' },
  { match: /launch\s*pad/i, system: 'Builder network', view: 'builders' },
]
const SPARE_VIEWS = ['health', 'builders', 'grid', 'network']

export const pad2 = (n) => String(n).padStart(2, '0')

/* '#' and the seed data's `yourusername` placeholder are not real links. */
export const isRealLink = (u) =>
  typeof u === 'string' && /^(https?:\/\/|mailto:|\/)/.test(u) && !/yourusername/i.test(u)

/** "Trail – Indoor Accessibility…" → { name: 'Trail', tagline: 'Indoor Accessibility…' } */
export function splitTitle(title) {
  const [name, ...rest] = String(title ?? '').split(/\s+[–—-]\s+/)
  return { name: name.trim(), tagline: rest.join(' – ').trim() }
}

/** The featured subsystems: the named projects first, topped up from the rest. */
export function featuredSystems(projects = [], min = 4) {
  const live = projects.filter((p) => !p.disabled)
  const picked = []
  SUBSYSTEMS.forEach((s) => {
    const p = live.find((q) => s.match.test(q.title ?? '') || s.match.test(String(q.id ?? '')))
    if (p && !picked.some((o) => o.project === p)) picked.push({ project: p, system: s.system, view: s.view })
  })
  let spare = 0
  for (const p of live) {
    if (picked.length >= min) break
    if (picked.some((o) => o.project === p)) continue
    picked.push({ project: p, system: p.badge?.label || 'Subsystem', view: SPARE_VIEWS[spare++ % SPARE_VIEWS.length] })
  }
  return picked.map((o) => ({
    ...o,
    ...splitTitle(o.project.title),
    code: isRealLink(o.project.links?.code) ? o.project.links.code : null,
    live: isRealLink(o.project.links?.live) ? o.project.links.live : null,
  }))
}

const MONTHS = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' }
function stamp(s) {
  const m = /([A-Za-z]{3})[a-z]*\.?\s+(\d{4})/.exec(s ?? '')
  return m ? `${m[2]}.${MONTHS[m[1].toLowerCase()] ?? '--'}` : null
}

/** experienceByOrg → one log line per role, newest start first. */
export function experienceLog(orgs = []) {
  const rows = orgs.flatMap((o) =>
    (o.roles ?? []).map((r) => {
      const range = String(r.dateRange ?? '').split('·')[0]
      const [from, to] = range.split(/\s+[-–—]\s+/)
      const live = /present/i.test(to ?? '')
      return {
        org: o.org,
        orgSub: o.orgSub,
        title: r.title,
        location: r.location,
        workMode: r.workMode,
        description: r.description,
        bullets: r.bullets,
        start: stamp(from),
        end: live ? 'NOW' : stamp(to),
        live,
      }
    }),
  )
  /* a stable sort: equal starts keep the data's own order */
  return rows
    .map((r, i) => [r, i])
    .sort((a, b) => (b[0].start ?? '').localeCompare(a[0].start ?? '') || a[1] - b[1])
    .map(([r]) => r)
}

/** skillGroups as modules, plus one module of what the projects shipped with. */
export function skillModules(groups = [], projects = []) {
  const mods = groups.map((g) => ({
    title: g.title,
    items: (g.items ?? []).map((i) => ({ name: i.name, level: i.level })),
  }))
  const known = new Set(groups.flatMap((g) => (g.items ?? []).map((i) => String(i.name).toLowerCase())))
  const freq = new Map()
  projects
    .filter((p) => !p.disabled)
    .forEach((p) =>
      (p.tech ?? []).forEach((t) => {
        if (known.has(String(t).toLowerCase())) return
        freq.set(t, (freq.get(t) ?? 0) + 1)
      }),
    )
  const field = [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 9)
    .map(([name, n]) => ({ name, level: n > 1 ? `${n} builds` : '1 build' }))
  if (field.length) mods.push({ title: 'Field-deployed', items: field })
  return mods
}
