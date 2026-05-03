export function slugify(title) {
  return String(title || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'post'
}

export function ensureUniqueSlug(base, existing) {
  const set = new Set(existing.map((s) => String(s).toLowerCase()))
  let slug = base
  let n = 2
  while (set.has(slug)) {
    slug = `${base}-${n}`
    n += 1
  }
  return slug
}
