import { describe, expect, it } from 'vitest'
import { deriveProjectFilters, normalizeBadge } from './portfolioFetchers'

/* These two are the exported surface of the Supabase -> UI mapping layer. They are
   pure, they branch heavily on shapes the database actually produces, and a schema
   change shows up here first. */

describe('normalizeBadge', () => {
  it('falls back to a generic badge for null and empty input', () => {
    for (const input of [null, undefined, '']) {
      expect(normalizeBadge(input)).toEqual({
        label: 'Project',
        icon: 'fas fa-code',
        gradient: 'from-slate-400 to-slate-600',
      })
    }
  })

  it('passes through an object badge', () => {
    expect(normalizeBadge({ label: 'Featured', icon: 'fas fa-star', gradient: 'from-a to-b' })).toEqual({
      label: 'Featured',
      icon: 'fas fa-star',
      gradient: 'from-a to-b',
    })
  })

  it('supplies defaults for an object missing icon and gradient', () => {
    expect(normalizeBadge({ label: 'New' })).toEqual({
      label: 'New',
      icon: 'fas fa-star',
      gradient: 'from-slate-400 to-slate-600',
    })
  })

  it('parses a plain JSON string', () => {
    expect(normalizeBadge('{"label":"Live","icon":"fas fa-bolt"}')).toMatchObject({
      label: 'Live',
      icon: 'fas fa-bolt',
    })
  })

  /* Supabase has been observed returning JSON that is itself quoted. The parser has a
     dedicated unwrap path for it; this is the case that regresses silently. */
  it('parses a quote-wrapped JSON string', () => {
    expect(normalizeBadge('"{\\"label\\":\\"Wrapped\\"}"')).toMatchObject({ label: 'Wrapped' })
  })

  it('treats an unparseable string as a label rather than throwing', () => {
    expect(() => normalizeBadge('not json at all')).not.toThrow()
    expect(normalizeBadge('not json at all').label).toBeTruthy()
  })
})

describe('deriveProjectFilters', () => {
  it('always leads with an All filter', () => {
    expect(deriveProjectFilters([])[0]).toMatchObject({ id: 'all', label: 'All' })
  })

  it('handles null and undefined without throwing', () => {
    expect(deriveProjectFilters(null)).toHaveLength(1)
    expect(deriveProjectFilters(undefined)).toHaveLength(1)
  })

  it('collects categories case-insensitively and de-duplicates them', () => {
    const filters = deriveProjectFilters([
      { categories: ['Web', 'AI'] },
      { categories: ['web', 'ai'] },
      { categories: ['Web'] },
    ])
    const ids = filters.map((f) => f.id)
    expect(ids).toContain('web')
    expect(ids).toContain('ai')
    expect(ids.filter((id) => id === 'web')).toHaveLength(1)
  })

  it('sorts categories so filter order is stable across fetches', () => {
    const ids = deriveProjectFilters([{ categories: ['zeta'] }, { categories: ['alpha'] }])
      .map((f) => f.id)
      .slice(1)
    expect(ids).toEqual([...ids].sort())
  })

  it('title-cases an unknown category and gives it a fallback icon', () => {
    const filters = deriveProjectFilters([{ categories: ['robotics'] }])
    expect(filters.find((f) => f.id === 'robotics')).toEqual({
      id: 'robotics',
      label: 'Robotics',
      icon: 'fas fa-tag',
    })
  })

  it('ignores projects with no categories and non-string entries', () => {
    expect(deriveProjectFilters([{}, { categories: [] }, { categories: [null, 42, ''] }])).toHaveLength(1)
  })
})
