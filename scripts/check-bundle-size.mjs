#!/usr/bin/env node
/**
 * Bundle size ratchet + build-output secret scan.
 *
 * Budgets in bundle-budget.json are gzipped byte ceilings per chunk, matched by the
 * filename prefix Rollup emits before the content hash. They were seeded from a real
 * build, not chosen aspirationally — the job is to stop regression, not to hit a target.
 *
 *   node scripts/check-bundle-size.mjs           fail if any budget is exceeded
 *   node scripts/check-bundle-size.mjs --update  rewrite budgets from the current build
 *
 * Exit 1 on an exceeded budget, a missing build, or a service-role key in dist/.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

const DIST = 'dist'
const ASSETS = join(DIST, 'assets')
const BUDGET_FILE = 'bundle-budget.json'
/* Only chunks at or above this gzipped size get their own budget. Below it the build
   emits ~100 per-icon chunks of a few hundred bytes each, which would turn every
   added icon into budget churn without telling anyone anything. The __total__ entry
   below covers everything, so small chunks are still accounted for in aggregate. */
const MIN_TRACKED = 10 * 1024
const TOTAL_KEY = '__total__'
/* Headroom before a budget fails, so an unrelated dependency bump does not block a PR
   for a few hundred bytes. Anything past this is a real regression worth looking at. */
const TOLERANCE = 0.05

/** Rollup emits `name-HASH.ext`; group by the name so budgets survive a rebuild. */
function chunkName(file) {
  return file.replace(/-[A-Za-z0-9_-]{8,}\.(js|css)$/, '.$1')
}

function collect() {
  let entries
  try {
    entries = readdirSync(ASSETS)
  } catch {
    console.error(`No ${ASSETS}/ directory. Run \`npm run build\` first.`)
    process.exit(1)
  }

  const all = {}
  let total = 0
  for (const file of entries) {
    if (!/\.(js|css)$/.test(file)) continue
    const size = gzipSync(readFileSync(join(ASSETS, file))).length
    all[chunkName(file)] = size
    total += size
  }

  const sizes = { [TOTAL_KEY]: total }
  for (const [name, size] of Object.entries(all)) {
    if (size >= MIN_TRACKED) sizes[name] = size
  }
  return sizes
}

/** The anon key is meant to ship. The service-role key bypasses RLS entirely. */
function scanForSecrets() {
  const leaked = []
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry)
      if (statSync(full).isDirectory()) {
        walk(full)
        continue
      }
      if (!/\.(js|css|html|json|map)$/.test(entry)) continue
      const text = readFileSync(full, 'utf8')
      /* Supabase service-role JWTs carry this role claim; the base64 of
         `"role":"service_role"` is what survives into a bundled string. */
      if (text.includes('service_role') || text.includes('InNlcnZpY2Vfcm9sZSI')) {
        leaked.push(full)
      }
    }
  }
  walk(DIST)
  return leaked
}

const sizes = collect()

if (process.argv.includes('--update')) {
  writeFileSync(BUDGET_FILE, JSON.stringify(sizes, null, 2) + '\n')
  console.log(`Wrote ${Object.keys(sizes).length} budgets to ${BUDGET_FILE}`)
  process.exit(0)
}

const leaked = scanForSecrets()
if (leaked.length) {
  console.error('SERVICE ROLE KEY FOUND IN BUILD OUTPUT:')
  for (const f of leaked) console.error('  ' + f)
  console.error('\nThis key bypasses row-level security. It must never reach the client bundle.')
  process.exit(1)
}

let budgets
try {
  budgets = JSON.parse(readFileSync(BUDGET_FILE, 'utf8'))
} catch {
  console.error(`No ${BUDGET_FILE}. Seed it with: node scripts/check-bundle-size.mjs --update`)
  process.exit(1)
}

const kb = (n) => (n / 1024).toFixed(1) + ' kB'
const failures = []
const added = []

for (const [name, size] of Object.entries(sizes)) {
  const budget = budgets[name]
  if (budget === undefined) {
    added.push([name, size])
    continue
  }
  const ceiling = Math.round(budget * (1 + TOLERANCE))
  const status = size > ceiling ? 'OVER' : 'ok'
  if (size > ceiling) failures.push([name, size, budget])
  console.log(`  ${status.padEnd(4)} ${name.padEnd(38)} ${kb(size).padStart(10)}  budget ${kb(budget)}`)
}

for (const [name, size] of added) {
  console.log(`  new  ${name.padEnd(38)} ${kb(size).padStart(10)}  (no budget yet)`)
}

const missing = Object.keys(budgets).filter((n) => sizes[n] === undefined)
for (const name of missing) console.log(`  gone ${name} (was ${kb(budgets[name])})`)

if (failures.length) {
  console.error(`\n${failures.length} chunk(s) over budget:`)
  for (const [name, size, budget] of failures) {
    const pct = (((size - budget) / budget) * 100).toFixed(1)
    console.error(`  ${name}: ${kb(size)} vs ${kb(budget)} (+${pct}%)`)
  }
  console.error('\nIf the growth is intended, re-seed with: npm run size -- --update')
  process.exit(1)
}

console.log(`\nAll ${Object.keys(sizes).length} chunks within budget (${TOLERANCE * 100}% tolerance).`)
