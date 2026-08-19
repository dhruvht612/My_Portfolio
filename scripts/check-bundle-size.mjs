#!/usr/bin/env node
/**
 * Bundle size ratchet + build-output secret scan.
 *
 * Budgets in bundle-budget.json are gzipped byte ceilings per chunk, matched by the
 * filename prefix Rollup emits before the content hash. They were seeded from a real
 * build, not chosen aspirationally — the job is to stop regression, not to hit a target.
 *
 * The baseline describes a build made WITH the Supabase env set, because that is what
 * ships. Without it `isSupabaseConfigured` folds to a compile-time false, createClient
 * becomes unreachable, and @supabase/supabase-js is tree-shaken out — ~70 kB gzipped,
 * 12% of the bundle — which reshuffles the whole chunk graph rather than just removing
 * one entry from it. Sizes from such a build are not comparable to this baseline and
 * must be checked with --report-only; see docs/ci-cd.md.
 *
 *   node scripts/check-bundle-size.mjs               fail if any budget is exceeded
 *   node scripts/check-bundle-size.mjs --report-only report, never fail on a budget
 *   node scripts/check-bundle-size.mjs --print-seed  print a paste-able budget block
 *   node scripts/check-bundle-size.mjs --update      rewrite budgets from the current build
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

/* Set for a build whose sizes cannot be held against the baseline — see the note above
   about a Supabase-less build. It suppresses only the budget verdict: the service-role
   key scan still exits 1, since a leaked key is a leaked key whatever produced it. */
const REPORT_ONLY = process.argv.includes('--report-only')

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

  /* Several emitted files collapse to one logical name: the entry chunk and a lazy
     `index` module both become index.js, as do lucide's chevron-down/-left/-right.
     Sum them. Last-write-wins recorded whichever file readdirSync happened to return
     last, so the number tracked directory order rather than the build — and because
     the small index chunk usually won, it kept the large one (~93 kB gzipped, the
     biggest thing in the bundle) out of the ratchet entirely. */
  const all = {}
  let total = 0
  for (const file of entries) {
    if (!/\.(js|css)$/.test(file)) continue
    const size = gzipSync(readFileSync(join(ASSETS, file))).length
    const name = chunkName(file)
    all[name] = (all[name] ?? 0) + size
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

/** The exact contents bundle-budget.json needs to accept this build as the baseline. */
function seedBlock(sizes) {
  return JSON.stringify(sizes, null, 2)
}

const sizes = collect()

if (process.argv.includes('--update')) {
  writeFileSync(BUDGET_FILE, seedBlock(sizes) + '\n')
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

/* Printed on demand and on every failure, so accepting a build as the new baseline
   never requires reproducing that build's environment: read the block out of the log
   and commit it. */
const printSeed = process.argv.includes('--print-seed')
if (printSeed || failures.length) {
  console.log(`\nBaseline for this build — paste into ${BUDGET_FILE} to accept it:`)
  console.log(seedBlock(sizes))
}

if (failures.length) {
  console.error(`\n${failures.length} chunk(s) over budget:`)
  for (const [name, size, budget] of failures) {
    const pct = (((size - budget) / budget) * 100).toFixed(1)
    console.error(`  ${name}: ${kb(size)} vs ${kb(budget)} (+${pct}%)`)
  }
  if (!REPORT_ONLY) {
    console.error('\nIf the growth is intended, re-seed with: npm run size -- --update')
    process.exit(1)
  }
  console.error(
    '\n--report-only: this build is not comparable to the baseline, so the miss above is' +
      '\nnot treated as a failure. A Supabase-less build drops ~70 kB and re-chunks the rest.'
  )
  process.exit(0)
}

if (printSeed) process.exit(0)
console.log(`\nAll ${Object.keys(sizes).length} chunks within budget (${TOLERANCE * 100}% tolerance).`)
