const LEVEL_WEIGHT = { Expert: 1.15, Advanced: 1, Intermediate: 0.85 }

export function groupsWithSkills(groups = [], skills = []) {
  return [...groups]
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((g) => ({
      ...g,
      skills: skills
        .filter((s) => s.skill_group_id === g.id)
        .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)),
    }))
}

export function computeAdminMetrics(groups, skills) {
  const totalGroups = groups.length
  const totalSkills = skills.length
  const avgProf =
    skills.length > 0
      ? Math.round(skills.reduce((s, sk) => s + (sk.proficiency ?? 0), 0) / skills.length)
      : 0
  const expert = skills.filter((s) => /expert/i.test(s.level || '')).length
  const linked = skills.filter((s) => s.related_project_id).length
  const capabilityScore =
    skills.length > 0
      ? Math.round(
          skills.reduce((s, sk) => {
            const w = LEVEL_WEIGHT[sk.level] || 1
            return s + (sk.proficiency ?? 0) * w
          }, 0) / skills.length,
        )
      : 0

  const levelCounts = { Expert: 0, Advanced: 0, Intermediate: 0, Other: 0 }
  for (const s of skills) {
    const l = s.level || ''
    if (/expert/i.test(l)) levelCounts.Expert++
    else if (/advanced/i.test(l)) levelCounts.Advanced++
    else if (/intermediate/i.test(l)) levelCounts.Intermediate++
    else levelCounts.Other++
  }

  return {
    totalGroups,
    totalSkills,
    avgProf,
    expert,
    linked,
    capabilityScore,
    distribution: [
      { name: 'Expert', value: levelCounts.Expert, fill: '#e879f9' },
      { name: 'Advanced', value: levelCounts.Advanced, fill: '#38bdf8' },
      { name: 'Intermediate', value: levelCounts.Intermediate, fill: '#a78bfa' },
      { name: 'Other', value: levelCounts.Other, fill: '#64748b' },
    ].filter((d) => d.value > 0),
    groupAverages: groupsWithSkills(groups, skills).map((g) => ({
      name: g.group_name,
      avg:
        g.skills.length > 0
          ? Math.round(g.skills.reduce((s, sk) => s + (sk.proficiency ?? 0), 0) / g.skills.length)
          : 0,
    })),
  }
}

export function groupStats(group) {
  const items = group.skills || []
  const avg =
    items.length > 0 ? Math.round(items.reduce((s, i) => s + (i.proficiency ?? 0), 0) / items.length) : 0
  const expert = items.filter((s) => /expert/i.test(s.level || '')).length
  const coverage = Math.min(100, Math.round(avg * 0.65 + expert * 12))
  return { density: items.length, avg, expert, coverage }
}

export function generateAdminInsights(groups, skills, projects = []) {
  const lines = []
  const bundled = groupsWithSkills(groups, skills)
  const sorted = [...bundled].sort((a, b) => {
    const av =
      (a.skills.reduce((s, x) => s + (x.proficiency ?? 0), 0) || 0) / Math.max(a.skills.length, 1)
    const bv =
      (b.skills.reduce((s, x) => s + (x.proficiency ?? 0), 0) || 0) / Math.max(b.skills.length, 1)
    return bv - av
  })

  if (sorted[0]?.skills?.length) {
    lines.push({
      tone: 'sky',
      title: `Strongest domain: ${sorted[0].group_name}`,
      body: `${sorted[0].skills.length} skills indexed with ~${groupStats(sorted[0]).avg}% average proficiency. Consider featuring this cluster on the public Skills page.`,
    })
  }

  const empty = bundled.filter((g) => !g.skills.length)
  if (empty.length) {
    lines.push({
      tone: 'amber',
      title: `${empty.length} group${empty.length === 1 ? '' : 's'} need skills`,
      body: `${empty.map((g) => g.group_name).join(', ')} — add capabilities so the public orchestration view stays balanced.`,
    })
  }

  const unlinked = skills.filter((s) => !s.related_project_id)
  if (unlinked.length && skills.length) {
    lines.push({
      tone: 'violet',
      title: 'Project linkage opportunities',
      body: `${unlinked.length} skill${unlinked.length === 1 ? '' : 's'} lack a related project — linking validates proficiency in production builds.`,
    })
  }

  const lowProf = skills.filter((s) => (s.proficiency ?? 0) < 60)
  if (lowProf.length) {
    lines.push({
      tone: 'cyan',
      title: 'Proficiency calibration',
      body: `${lowProf.length} skill${lowProf.length === 1 ? '' : 's'} below 60% — review levels and detail lines before publishing.`,
    })
  }

  if (!lines.length) {
    lines.push({
      tone: 'emerald',
      title: 'Capability OS ready',
      body: 'Create skill groups and index technologies to power the public engineering intelligence workspace.',
    })
  }

  return lines.slice(0, 4)
}

export function filterBundledGroups(bundled, { query, groupId, sort }) {
  const q = query?.trim().toLowerCase()
  let list = bundled

  if (groupId && groupId !== 'all') {
    list = list.filter((g) => g.id === groupId)
  }

  if (q) {
    list = list
      .map((g) => ({
        ...g,
        skills: g.skills.filter(
          (s) =>
            s.name?.toLowerCase().includes(q) ||
            s.level?.toLowerCase().includes(q) ||
            (s.details || []).some((d) => String(d).toLowerCase().includes(q)) ||
            g.group_name?.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.skills.length > 0 || g.group_name?.toLowerCase().includes(q))
  }

  if (sort === 'name') {
    list = [...list].sort((a, b) => (a.group_name || '').localeCompare(b.group_name || ''))
  } else if (sort === 'density') {
    list = [...list].sort((a, b) => (b.skills?.length || 0) - (a.skills?.length || 0))
  }

  return list
}

export function filterFlatSkills(skills, groups, { query, groupId, sort }) {
  let list = [...skills]
  const q = query?.trim().toLowerCase()

  if (groupId && groupId !== 'all') list = list.filter((s) => s.skill_group_id === groupId)

  if (q) {
    list = list.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.level?.toLowerCase().includes(q) ||
        (s.details || []).some((d) => String(d).toLowerCase().includes(q)),
    )
  }

  if (sort === 'proficiency') list.sort((a, b) => (b.proficiency ?? 0) - (a.proficiency ?? 0))
  else if (sort === 'name') list.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  else list.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))

  return list
}
