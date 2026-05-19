export function profileCompletion(values = {}) {
  let score = 0
  const name = String(values.full_name || '').trim()
  const roles = (values.typed_roles || []).filter(Boolean)
  const story = (values.bio_story || []).filter(Boolean)
  const interests = (values.interests || []).filter((x) => x?.title?.trim())
  const facts = (values.fun_facts || []).filter((x) => x?.title?.trim())
  const links = values.social_links || {}
  const linkCount = ['github', 'linkedin', 'instagram', 'email'].filter((k) => String(links[k] || '').trim()).length
  const badges = (values.footer_badges || []).filter(Boolean)

  if (name) score += 14
  if (roles.length) score += Math.min(22, 12 + roles.length * 4)
  if (story.length) score += Math.min(28, 10 + story.length * 6)
  if (interests.length) score += Math.min(16, 6 + interests.length * 3)
  if (facts.length) score += Math.min(10, 4 + facts.length * 2)
  if (linkCount) score += Math.min(12, linkCount * 3)
  if (values.resume_url) score += 6
  if (badges.length) score += Math.min(12, badges.length * 3)

  return Math.min(100, score)
}

export function narrativeScore(values = {}) {
  const story = (values.bio_story || []).filter(Boolean)
  const roles = (values.typed_roles || []).filter(Boolean)
  const words = story.join(' ').split(/\s+/).filter(Boolean).length
  let score = 32
  if (roles.length >= 2) score += 18
  if (story.length >= 2) score += 22
  if (words >= 80) score += 20
  else if (words >= 40) score += 12
  return Math.min(98, score)
}

export function seoReadiness(values = {}) {
  const name = String(values.full_name || '').trim()
  const roles = (values.typed_roles || []).filter(Boolean)
  const story = (values.bio_story || []).filter(Boolean)
  let s = 24
  if (name.length >= 3) s += 20
  if (roles.length >= 2) s += 22
  if (story.length) s += 18
  if ((values.interests || []).length >= 2) s += 16
  return Math.min(96, s)
}

export function visibilityState(values = {}) {
  const pct = profileCompletion(values)
  if (pct >= 85) return { label: 'Public identity synced', tone: 'emerald', live: true }
  if (pct >= 55) return { label: 'Partially published', tone: 'sky', live: true }
  return { label: 'Draft — not fully visible', tone: 'amber', live: false }
}

export function generateProfileInsights(values = {}) {
  const insights = []
  const roles = (values.typed_roles || []).filter(Boolean)
  const story = (values.bio_story || []).filter(Boolean)
  const interests = (values.interests || []).filter((x) => x?.title?.trim())
  const pct = profileCompletion(values)
  const narrative = narrativeScore(values)

  if (pct >= 80) {
    insights.push({
      title: 'Your profile narrative is strong',
      body: 'Public identity signals are well distributed across hero, story, and metadata.',
      tone: 'emerald',
    })
  } else if (pct >= 50) {
    insights.push({
      title: 'Identity orchestration in progress',
      body: 'Complete remaining modules to unlock full workspace sync and SEO readiness.',
      tone: 'sky',
    })
  } else {
    insights.push({
      title: 'Foundation needs attention',
      body: 'Start with your display name and at least one hero role to anchor the public persona.',
      tone: 'amber',
    })
  }

  if (roles.length < 2) {
    insights.push({
      title: 'Add one more technical role',
      body: 'Multiple typed roles improve discoverability and power the landing hero animation.',
      tone: 'violet',
    })
  } else {
    insights.push({
      title: 'Hero identity optimized',
      body: `Configured for engineering audiences with ${roles.length} rotating hero descriptors.`,
      tone: 'cyan',
    })
  }

  if (story.length < 2) {
    insights.push({
      title: 'Expand your narrative',
      body: 'Add a second bio paragraph to strengthen the About story tab and narrative score.',
      tone: 'violet',
    })
  } else if (narrative >= 70) {
    insights.push({
      title: 'Narrative depth detected',
      body: 'Bio story length supports strong engagement on the public About journey.',
      tone: 'emerald',
    })
  }

  if (interests.length < 3) {
    insights.push({
      title: 'Metadata opportunity',
      body: 'Three or more interest cards create a richer signature grid on the About page.',
      tone: 'amber',
    })
  }

  return insights.slice(0, 4)
}
