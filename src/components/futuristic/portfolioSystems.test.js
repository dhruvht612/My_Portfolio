import { experienceLog, featuredSystems, isRealLink, skillModules, splitTitle } from './portfolioSystems'
import { projects } from '../../data/projects'
import { experienceByOrg } from '../../data/experience'
import { skillGroups } from '../../data/skills'

describe('portfolioSystems', () => {
  it('splits a project title on its dash', () => {
    expect(splitTitle('Wisely – Goal-Based Spending Tracker')).toEqual({ name: 'Wisely', tagline: 'Goal-Based Spending Tracker' })
    expect(splitTitle('Farm Flight')).toEqual({ name: 'Farm Flight', tagline: '' })
  })

  it('treats placeholders as missing links', () => {
    expect(isRealLink('#')).toBe(false)
    expect(isRealLink('https://github.com/yourusername/qr-code-generator')).toBe(false)
    expect(isRealLink('https://github.com/dhruvht612')).toBe(true)
  })

  it('puts the named projects first, in order, and tops up from the rest', () => {
    const f = featuredSystems(projects)
    expect(f.length).toBeGreaterThanOrEqual(4)
    const names = f.map((s) => s.name)
    expect(names.indexOf('Wisely')).toBeLessThan(names.indexOf('Trail'))
    expect(f.find((s) => s.name === 'Trail').view).toBe('route')
    expect(f.every((s) => !s.project.disabled)).toBe(true)
    expect(new Set(f.map((s) => s.project)).size).toBe(f.length)
  })

  it('logs every role, newest first, without inventing dates', () => {
    const log = experienceLog(experienceByOrg)
    expect(log.length).toBe(experienceByOrg.reduce((n, o) => n + o.roles.length, 0))
    expect(log[0].start >= log[log.length - 1].start).toBe(true)
    const vp = log.find((r) => r.title === 'Vice President of Technology')
    expect(vp).toMatchObject({ start: '2025.11', end: '2026.01', live: false })
    expect(log.find((r) => r.title === 'Director of Outreach')).toMatchObject({ start: '2026.02', end: 'NOW', live: true })
  })

  it('builds one module per skill group plus the shipped stack', () => {
    const mods = skillModules(skillGroups, projects)
    expect(mods.slice(0, skillGroups.length).map((m) => m.title)).toEqual(skillGroups.map((g) => g.title))
    const field = mods[mods.length - 1]
    expect(field.title).toBe('Field-deployed')
    const known = new Set(skillGroups.flatMap((g) => g.items.map((i) => i.name.toLowerCase())))
    expect(field.items.every((i) => !known.has(i.name.toLowerCase()))).toBe(true)
  })
})
