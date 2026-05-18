const MILESTONES = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Graduation']

export function yearFromProgress(pct) {
  const p = Math.max(0, Math.min(100, Number(pct) || 0))
  return Math.min(4, Math.max(1, Math.ceil(p / 25) || 1))
}

export function semestersCompleted(pct) {
  return Math.round((Math.max(0, Math.min(100, Number(pct) || 0)) / 100) * 8)
}

export function creditsEarned(pct) {
  return Math.round((Math.max(0, Math.min(100, Number(pct) || 0)) / 100) * 120)
}

export function learningMomentum(pct, isActive) {
  if (!isActive) return 42
  const base = Math.max(0, Math.min(100, Number(pct) || 0))
  return Math.min(98, Math.round(58 + base * 0.38))
}

export function portfolioAlignment(focusAreas = [], highlights = []) {
  const f = focusAreas.filter(Boolean).length
  const h = highlights.filter((x) => x?.title?.trim()).length
  return Math.min(96, 52 + f * 8 + h * 6)
}

export function specializationStrength(focusAreas = []) {
  const n = focusAreas.filter(Boolean).length
  if (!n) return 28
  return Math.min(94, 40 + n * 12)
}

export function buildTimeline(pct, highlights = []) {
  const p = Math.max(0, Math.min(100, Number(pct) || 0))
  const nodes = MILESTONES.map((label, i) => {
    const threshold = i === 4 ? 100 : (i + 1) * 25
    const done = p >= threshold - 12
    const active = p >= threshold - 25 && p < threshold + 8
    return { id: label, label, done, active, threshold }
  })
  const extras = highlights
    .filter((h) => h?.title?.trim())
    .slice(0, 3)
    .map((h, i) => ({
      id: `hl-${i}`,
      label: h.title,
      done: true,
      active: false,
      type: 'achievement',
    }))
  return [...nodes.slice(0, 4), ...extras, nodes[4]]
}

export function generateInsights(values) {
  const {
    institution = '',
    degree = '',
    progress_percent: pct = 0,
    focus_areas: focus = [],
    highlights = [],
    is_active: active = true,
  } = values || {}

  const year = yearFromProgress(pct)
  const areas = focus.filter(Boolean)
  const lines = []

  if (degree || institution) {
    lines.push({
      tone: 'sky',
      title: active ? `Currently progressing through Year ${year}` : 'Program on record',
      body: degree
        ? `${degree}${institution ? ` at ${institution}` : ''}. Degree completion is at ${pct}%.`
        : 'Add your degree title to unlock richer academic narrative on the public page.',
    })
  }

  if (pct >= 45 && active) {
    lines.push({
      tone: 'emerald',
      title: 'Academic momentum is strong this semester',
      body: `You are tracking ahead of the midpoint curve with ${semestersCompleted(pct)} semesters equivalent completed and ${creditsEarned(pct)} credits modeled.`,
    })
  } else if (pct < 30 && active) {
    lines.push({
      tone: 'violet',
      title: 'Foundation phase — momentum building',
      body: 'Early program years are ideal for breadth. Layer projects that mirror your focus areas to compound portfolio alignment.',
    })
  }

  if (areas.length) {
    const top = areas.slice(0, 2).join(' and ')
    lines.push({
      tone: 'cyan',
      title: 'Focus areas trending toward depth',
      body: `Strongest signals: ${top}. ${areas.length >= 3 ? 'Your spread suggests a T-shaped engineer profile.' : 'Add complementary tags to sharpen your public radar chart.'}`,
    })
  }

  const hl = highlights.filter((h) => h?.title?.trim()).length
  if (hl >= 2) {
    lines.push({
      tone: 'amber',
      title: 'Highlight cards reinforce your narrative',
      body: `${hl} milestone cards will surface on the Education page — keep titles outcome-oriented (internships, leadership, certifications).`,
    })
  }

  if (!lines.length) {
    lines.push({
      tone: 'sky',
      title: 'Student OS ready for your academic identity',
      body: 'Fill institution, degree, and progress to activate timeline checkpoints, metrics, and AI-style insights.',
    })
  }

  return lines.slice(0, 4)
}

export function focusRadarData(focusAreas = []) {
  const defaults = ['AI', 'Full Stack', 'Systems', 'Design', 'Data']
  const tags = focusAreas.filter(Boolean)
  const labels = tags.length >= 3 ? tags.slice(0, 5) : [...tags, ...defaults.filter((d) => !tags.includes(d))].slice(0, 5)
  return labels.map((name, i) => ({
    subject: name.length > 12 ? `${name.slice(0, 11)}…` : name,
    score: tags.includes(name) ? 72 + (i % 3) * 8 : 24 + (i % 4) * 6,
    fullMark: 100,
  }))
}

export const SUGGESTED_FOCUS = [
  'AI',
  'Full Stack',
  'Data Science',
  'Embedded Systems',
  'Accessibility',
  'Cloud',
  'Security',
  'DevOps',
]
