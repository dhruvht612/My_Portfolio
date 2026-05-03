import { PROJECT_FILTERS as STATIC_PROJECT_FILTERS } from '../data/projects'

/**
 * Maps DB `badge` (string or JSON) to the UI shape `{ label, icon, gradient }`.
 * @param {unknown} raw
 * @returns {{ label: string, icon: string, gradient: string }}
 */
function normalizeBadge(raw) {
  if (raw == null || raw === '') {
    return { label: 'Project', icon: 'fas fa-code', gradient: 'from-slate-400 to-slate-600' }
  }
  if (typeof raw === 'object' && raw !== null && 'label' in raw) {
    const o = raw
    return {
      label: String(o.label ?? 'Project'),
      icon: typeof o.icon === 'string' ? o.icon : 'fas fa-star',
      gradient: typeof o.gradient === 'string' ? o.gradient : 'from-slate-400 to-slate-600',
    }
  }
  const s = String(raw)
  return { label: s, icon: 'fas fa-star', gradient: 'from-sky-400 to-blue-500' }
}

/**
 * DB may store Font Awesome classes or future Lucide names; FA classes render as `<i className>`.
 * @param {string | null | undefined} iconClass
 */
function normalizeIconClass(iconClass) {
  if (!iconClass || typeof iconClass !== 'string') return 'fas fa-code'
  const t = iconClass.trim()
  if (t.includes('fa-')) return t
  return 'fas fa-code'
}

/**
 * Build filter pills from project categories; reuse labels/icons from static config when possible.
 * @param {Array<{ categories?: string[] }>} projects
 */
export function deriveProjectFilters(projects) {
  const categories = new Set()
  for (const p of projects || []) {
    for (const c of p.categories || []) {
      if (c && typeof c === 'string') categories.add(c.toLowerCase())
    }
  }
  const ordered = [...categories].sort()
  const filters = [{ id: 'all', label: 'All', icon: 'fas fa-layer-group' }]
  for (const id of ordered) {
    const meta = STATIC_PROJECT_FILTERS.find((f) => f.id === id)
    if (meta) {
      filters.push(meta)
    } else {
      filters.push({
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
        icon: 'fas fa-tag',
      })
    }
  }
  return filters
}

/**
 * Group flat experience rows into `experienceByOrg` shape.
 * @param {Array<Record<string, unknown>>} rows
 */
function groupExperiencesByOrg(rows) {
  if (!rows?.length) return []
  const sorted = [...rows].sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0))
  /** @type {Map<string, { org: string, orgSub?: string, employmentType?: string, roles: object[] }>} */
  const map = new Map()
  for (const row of sorted) {
    const org = String(row.organization ?? '')
    if (!org) continue
    if (!map.has(org)) {
      map.set(org, {
        org,
        ...(row.organization_sub ? { orgSub: String(row.organization_sub) } : {}),
        ...(row.employment_type ? { employmentType: String(row.employment_type) } : {}),
        roles: [],
      })
    }
    const block = map.get(org)
    const role = {
      title: String(row.role_title ?? ''),
      dateRange: String(row.date_range ?? ''),
      ...(row.location ? { location: String(row.location) } : {}),
      ...(row.work_mode ? { workMode: String(row.work_mode) } : {}),
      ...(row.description ? { description: String(row.description) } : {}),
      ...(Array.isArray(row.bullets) && row.bullets.length ? { bullets: row.bullets.map(String) } : {}),
      ...(Array.isArray(row.skills_used) && row.skills_used.length ? { skills: row.skills_used.map(String) } : {}),
      ...(row.employment_type ? { employmentType: String(row.employment_type) } : {}),
    }
    block.roles.push(role)
  }
  return [...map.values()]
}

/**
 * Join skill_groups + skills into `skillGroups` UI shape.
 * @param {Array<Record<string, unknown>>} groups
 * @param {Array<Record<string, unknown>>} skills
 */
function buildSkillGroups(groups, skills) {
  const sortedGroups = [...(groups || [])].sort(
    (a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0),
  )
  const sortedSkills = [...(skills || [])].sort(
    (a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0),
  )
  return sortedGroups.map((g) => {
    const gid = g.id
    const items = sortedSkills
      .filter((s) => s.skill_group_id === gid)
      .map((s) => {
        const detailsRaw = s.details
        let details = ''
        if (Array.isArray(detailsRaw)) details = detailsRaw.map(String).join(' • ')
        else if (typeof detailsRaw === 'string') details = detailsRaw
        return {
          name: String(s.name ?? ''),
          percent: Math.min(100, Math.max(0, Number(s.proficiency) || 0)),
          icon: normalizeIconClass(s.icon_class),
          level: String(s.level ?? ''),
          details,
        }
      })
    return {
      title: String(g.group_name ?? ''),
      icon: normalizeIconClass(g.icon_class),
      items,
    }
  })
}

/**
 * Map certifications table rows to UI objects.
 * @param {Array<Record<string, unknown>>} rows
 */
function mapCertifications(rows) {
  return (rows || []).map((row) => ({
    title: String(row.title ?? ''),
    issuer: String(row.issuer ?? ''),
    issued: row.issued_date != null ? String(row.issued_date) : '',
    credentialId: row.credential_id ?? null,
    credentialUrl: row.credential_url != null ? String(row.credential_url) : '#',
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    category: row.category != null ? String(row.category) : '',
    featured: Boolean(row.is_featured),
    learned: row.learned != null ? String(row.learned) : '',
    applied: row.applied != null ? String(row.applied) : '',
    appliedProject: row.applied_project != null ? String(row.applied_project) : '',
  }))
}

/**
 * Map projects table rows to UI project cards.
 * @param {Array<Record<string, unknown>>} rows
 */
function mapProjects(rows) {
  const sorted = [...(rows || [])].sort(
    (a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0),
  )
  return sorted.map((row) => {
    const id = row.id != null ? String(row.id) : ''
    return {
      id,
      title: String(row.title ?? ''),
      description: String(row.description ?? ''),
      iconClass: normalizeIconClass(row.icon_class),
      badge: normalizeBadge(row.badge),
      features: Array.isArray(row.features) ? row.features.map(String) : [],
      tech: Array.isArray(row.tech_stack) ? row.tech_stack.map(String) : [],
      categories: Array.isArray(row.categories) ? row.categories.map((c) => String(c).toLowerCase()) : [],
      links: {
        live: row.live_url != null && row.live_url !== '' ? String(row.live_url) : '#',
        code: row.code_url != null && row.code_url !== '' ? String(row.code_url) : '#',
      },
      ...(row.is_disabled ? { disabled: true } : {}),
      ...(row.is_featured ? { featured: true } : {}),
    }
  })
}

/**
 * Build `aboutTabs` from a single `profile` row (bio_story, interests, fun_facts).
 * @param {Record<string, unknown> | null} profile
 */
function profileToAboutTabs(profile) {
  if (!profile || typeof profile !== 'object') {
    throw new Error('profile row missing')
  }
  const story = Array.isArray(profile.bio_story) ? profile.bio_story.map(String) : []
  const interests = Array.isArray(profile.interests) ? profile.interests : []
  const facts = Array.isArray(profile.fun_facts) ? profile.fun_facts : []
  return { story, interests, facts }
}

/**
 * Fetch portfolio slice from Supabase (parallel reads + transforms).
 * Throws on any Supabase error or missing profile row so the caller can fall back to static data.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 */
export async function fetchPortfolioFromSupabase(client) {
  const [
    profileRes,
    experiencesRes,
    projectsRes,
    skillGroupsRes,
    skillsRes,
    certificationsRes,
  ] = await Promise.all([
    client.from('profile').select('*').single(),
    client.from('experiences').select('*').order('display_order', { ascending: true }),
    client.from('projects').select('*').order('display_order', { ascending: true }),
    client.from('skill_groups').select('*').order('display_order', { ascending: true }),
    client.from('skills').select('*').order('display_order', { ascending: true }),
    client.from('certifications').select('*').order('created_at', { ascending: false }),
  ])

  const checks = [profileRes, experiencesRes, projectsRes, skillGroupsRes, skillsRes, certificationsRes]
  for (const res of checks) {
    if (res.error) throw res.error
  }

  const aboutTabs = profileToAboutTabs(profileRes.data)
  const projects = mapProjects(projectsRes.data)
  const PROJECT_FILTERS = deriveProjectFilters(projects)
  const certifications = mapCertifications(certificationsRes.data)
  const experienceByOrg = groupExperiencesByOrg(experiencesRes.data)
  const skillGroups = buildSkillGroups(skillGroupsRes.data, skillsRes.data)

  return {
    aboutTabs,
    projects,
    PROJECT_FILTERS,
    certifications,
    experienceByOrg,
    skillGroups,
  }
}
