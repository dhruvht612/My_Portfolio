/**
 * One-way seed: clears portfolio content tables and inserts data from `src/data/*`
 * plus shared defaults (profile, education, beyond_stats, goals).
 *
 * Usage (from repo root):
 *   npm run seed
 *
 * Requires in `.env` or environment:
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from '@supabase/supabase-js'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

import { aboutTabs } from '../data/about.js'
import { certifications as certificationsData } from '../data/certifications.js'
import { experienceByOrg } from '../data/experience.js'
import {
  beyondStats,
  educationHighlights,
  focusAreas,
  goals as goalsUi,
} from '../data/portfolioExtras.js'
import { projects as projectsData } from '../data/projects.js'
import { skillGroups as skillGroupsData } from '../data/skills.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

function loadDotEnv() {
  const envPath = join(process.cwd(), '.env')
  if (!existsSync(envPath)) return
  const raw = readFileSync(envPath, 'utf8')
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = val
  }
}

function badgeForDb(badge) {
  if (badge == null) return null
  if (typeof badge === 'object') return JSON.stringify(badge)
  return String(badge)
}

function normalizeSkillsUsed(role) {
  if (Array.isArray(role.skills)) return role.skills.map(String)
  if (typeof role.skills === 'string' && role.skills.trim()) {
    return role.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return []
}

function flattenExperiences() {
  let order = 0
  const rows = []
  for (const block of experienceByOrg) {
    const org = block.org
    for (const role of block.roles) {
      rows.push({
        organization: org,
        organization_sub: block.orgSub ?? null,
        employment_type: role.employmentType ?? block.employmentType ?? null,
        role_title: role.title,
        date_range: role.dateRange,
        location: role.location ?? null,
        work_mode: role.workMode ?? null,
        description: role.description ?? null,
        bullets: Array.isArray(role.bullets) ? role.bullets.map(String) : null,
        skills_used: normalizeSkillsUsed(role),
        logo_url: null,
        is_featured: false,
        display_order: order++,
      })
    }
  }
  return rows
}

async function clearPortfolioTables(client) {
  const tables = [
    'skills',
    'skill_groups',
    'projects',
    'experiences',
    'certifications',
    'beyond_stats',
    'goals',
    'education',
    'profile',
  ]
  const sentinel = '00000000-0000-0000-0000-000000000000'
  for (const table of tables) {
    const { error } = await client.from(table).delete().neq('id', sentinel)
    if (error) throw new Error(`Failed to clear ${table}: ${error.message}`)
  }
}

async function main() {
  loadDotEnv()
  const url = process.env.VITE_SUPABASE_URL?.trim()
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !serviceKey) {
    console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment / .env')
    process.exit(1)
  }

  const client = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  console.log('Clearing portfolio tables…')
  await clearPortfolioTables(client)

  const profileRow = {
    full_name: 'Dhruv Thakar',
    typed_roles: [
      'Computer Science Student',
      'Full-Stack Developer',
      'Embedded Systems Enthusiast',
      'Community Builder',
    ],
    bio_story: aboutTabs.story,
    interests: aboutTabs.interests,
    fun_facts: aboutTabs.facts,
    social_links: {
      github: 'https://github.com/dhruvht612',
      linkedin: 'https://linkedin.com/in/dhruv-thakar-ba46aa296',
      instagram: 'https://www.instagram.com/dhruv_200612/?hl=en',
      email: 'thakardhruvh@gmail.com',
    },
    resume_url: '',
    footer_badges: [
      'https://img.shields.io/badge/HTML5-%23E34F26.svg?&style=flat&logo=html5&logoColor=white',
      'https://img.shields.io/badge/Tailwind-%2306B6D4.svg?&style=flat&logo=tailwind-css&logoColor=white',
      'https://img.shields.io/badge/JavaScript-%23F7DF1E.svg?&style=flat&logo=javascript&logoColor=black',
    ],
  }

  console.log('Inserting profile…')
  {
    const { error } = await client.from('profile').insert(profileRow)
    if (error) throw new Error(`profile: ${error.message}`)
  }

  const educationRow = {
    institution: 'Ontario Tech University',
    degree: 'Bachelor of Science in Computer Science',
    logo_url: '',
    progress_percent: 50,
    focus_areas: focusAreas,
    highlights: educationHighlights.map((c) => ({
      icon: c.icon,
      title: c.title,
      description: c.bullets.join('\n'),
    })),
    is_active: true,
  }
  console.log('Inserting education…')
  {
    const { error } = await client.from('education').insert(educationRow)
    if (error) throw new Error(`education: ${error.message}`)
  }

  const beyondRows = beyondStats.map((s, i) => ({
    label: s.label,
    value: s.value,
    icon: s.icon,
    display_order: i,
  }))
  console.log('Inserting beyond_stats…')
  {
    const { error } = await client.from('beyond_stats').insert(beyondRows)
    if (error) throw new Error(`beyond_stats: ${error.message}`)
  }

  const goalRows = [
    {
      type: 'short',
      title: goalsUi[0].title,
      description: JSON.stringify({
        badge: goalsUi[0].badge,
        titleIcon: goalsUi[0].titleIcon,
        accent: goalsUi[0].accent,
        bullets: goalsUi[0].bullets,
        progressLabel: goalsUi[0].progressLabel,
        progress: goalsUi[0].progress,
      }),
      progress_percent: goalsUi[0].progress ?? 0,
      milestones: [],
    },
    {
      type: 'long',
      title: goalsUi[1].title,
      description: JSON.stringify({
        badge: goalsUi[1].badge,
        titleIcon: goalsUi[1].titleIcon,
        accent: goalsUi[1].accent,
        bullets: goalsUi[1].bullets,
        vision: goalsUi[1].vision,
      }),
      progress_percent: 0,
      milestones: [],
    },
  ]
  console.log('Inserting goals…')
  {
    const { error } = await client.from('goals').insert(goalRows)
    if (error) throw new Error(`goals: ${error.message}`)
  }

  const groupInserts = skillGroupsData.map((g, i) => ({
    group_name: g.title,
    icon_class: g.icon ?? 'fas fa-code',
    display_order: i,
  }))
  console.log('Inserting skill_groups…')
  const { data: insertedGroups, error: sgErr } = await client
    .from('skill_groups')
    .insert(groupInserts)
    .select('id, group_name')
  if (sgErr) throw new Error(`skill_groups: ${sgErr.message}`)
  const groupIdByName = new Map((insertedGroups || []).map((r) => [r.group_name, r.id]))

  const projectInserts = projectsData.map((p, i) => ({
    title: p.title,
    description: p.description,
    icon_class: p.iconClass ?? 'fas fa-code',
    badge: badgeForDb(p.badge),
    features: p.features ?? [],
    tech_stack: p.tech ?? [],
    categories: p.categories ?? [],
    live_url: p.links?.live ?? '#',
    code_url: p.links?.code ?? '#',
    is_disabled: Boolean(p.disabled),
    is_featured: Boolean(p.featured),
    display_order: i,
    image_url: null,
  }))
  console.log('Inserting projects…')
  {
    const { error } = await client.from('projects').insert(projectInserts)
    if (error) throw new Error(`projects: ${error.message}`)
  }

  const skillRows = []
  for (const g of skillGroupsData) {
    const gid = groupIdByName.get(g.title)
    if (!gid) throw new Error(`Missing skill group id for ${g.title}`)
    g.items.forEach((item, j) => {
      const detailsArr =
        typeof item.details === 'string'
          ? item.details
              .split('•')
              .map((s) => s.trim())
              .filter(Boolean)
          : []
      skillRows.push({
        skill_group_id: gid,
        name: item.name,
        proficiency: item.percent ?? 0,
        icon_class: item.icon ?? 'fas fa-code',
        level: item.level ?? '',
        details: detailsArr,
        related_project_id: null,
        display_order: j,
      })
    })
  }
  console.log('Inserting skills…')
  {
    const { error } = await client.from('skills').insert(skillRows)
    if (error) throw new Error(`skills: ${error.message}`)
  }

  const expRows = flattenExperiences()
  console.log(`Inserting ${expRows.length} experiences…`)
  {
    const { error } = await client.from('experiences').insert(expRows)
    if (error) throw new Error(`experiences: ${error.message}`)
  }

  const certRows = certificationsData.map((c) => ({
    title: c.title,
    issuer: c.issuer,
    issued_date: c.issued ?? '',
    credential_id: c.credentialId ?? null,
    credential_url: c.credentialUrl ?? '#',
    tags: c.tags ?? [],
    category: c.category ?? '',
    is_featured: Boolean(c.featured),
    learned: c.learned ?? '',
    applied: c.applied ?? '',
    applied_project: c.appliedProject ?? '',
  }))
  console.log(`Inserting ${certRows.length} certifications…`)
  {
    const { error } = await client.from('certifications').insert(certRows)
    if (error) throw new Error(`certifications: ${error.message}`)
  }

  console.log('Done. Verify rows in Supabase Table Editor and reload the site.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
