/* eslint-env node */
/**
 * Phase 5 verification helper: buckets, certifications.image_url column, row counts.
 *
 * Usage: npm run verify:phase5
 */
import { createClient } from '@supabase/supabase-js'
import { applyDevTlsBypassFromEnv } from './lib/devTlsBypass.js'
import { loadDotEnv } from './lib/loadDotEnv.js'
import {
  formatFetchChain,
  isTlsCertificateVerificationFailure,
  normalizeSupabaseProjectUrl,
  printTlsCertificateVerificationHints,
  probeSupabaseReachable,
} from './lib/supabaseProjectUrl.js'

async function countTable(client, table) {
  const { count, error } = await client.from(table).select('*', { count: 'exact', head: true })
  if (error) return { table, error: error.message, count: null }
  return { table, error: null, count: count ?? 0 }
}

async function main() {
  loadDotEnv()
  applyDevTlsBypassFromEnv()
  const rawUrl = process.env.VITE_SUPABASE_URL?.trim()
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!rawUrl || !serviceKey) {
    console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const url = normalizeSupabaseProjectUrl(rawUrl)
  if (url !== rawUrl) {
    console.warn('Note: normalized VITE_SUPABASE_URL (removed trailing / or /rest/v1 path).')
    console.warn(`  was: ${rawUrl}`)
    console.warn(`  now: ${url}`)
  }

  let host = url
  try {
    host = new URL(url).hostname
  } catch {
    console.error('VITE_SUPABASE_URL is not a valid URL:', url)
    process.exit(1)
  }
  console.log(`Using host: ${host}`)

  console.log('\n--- Network probe (HTTPS) ---')
  const probe = await probeSupabaseReachable(url)
  if (!probe.ok) {
    console.error('Cannot reach Supabase from this machine (fetch failed before any API call).')
    console.error(`Tried: ${probe.healthUrl}`)
    console.error('Detail:', formatFetchChain(probe.error))
    if (isTlsCertificateVerificationFailure(probe.error)) {
      printTlsCertificateVerificationHints()
    } else {
      console.error('\nTry:')
      console.error('  • Confirm PC is online; disable VPN/proxy temporarily.')
      console.error('  • Windows: set NODE_OPTIONS=--dns-result-order=ipv4first then run again.')
      console.error('  • VITE_SUPABASE_URL must be like https://YOUR-REF.supabase.co (no /rest/v1 on the end).')
    }
    console.error('\nPowerShell test: Invoke-WebRequest -Uri "' + probe.healthUrl + '" -UseBasicParsing')
    process.exit(1)
  }
  console.log(`OK: ${probe.healthUrl} returned HTTP ${probe.status}`)

  const client = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  console.log('--- Storage buckets ---')
  const { data: buckets, error: bErr } = await client.storage.listBuckets()
  if (bErr) {
    console.error('listBuckets failed:', bErr.message)
    if (bErr.cause) console.error('Detail:', formatFetchChain(bErr))
  } else {
    const names = (buckets || []).map((b) => b.name).sort()
    console.log(names.length ? names.join(', ') : '(none)')
    const required = ['logos', 'cert-images', 'project-images', 'blog-images', 'resumes']
    for (const r of required) {
      if (!names.includes(r)) console.warn(`MISSING bucket: ${r}`)
    }
  }

  console.log('\n--- certifications.image_url column ---')
  const { error: colErr } = await client.from('certifications').select('id, image_url').limit(1)
  if (colErr) {
    const missingCol =
      /image_url/i.test(colErr.message || '') && /does not exist|schema cache/i.test(colErr.message || '')
    if (missingCol) {
      console.warn('MISSING: certifications.image_url — run docs/migrations/add_certifications_image_url.sql')
    } else {
      console.error('certifications select failed:', colErr.message)
      if (colErr.cause || colErr.message?.includes('fetch')) {
        console.error('Detail:', formatFetchChain(colErr.cause || colErr))
      }
      process.exitCode = 1
    }
  } else {
    console.log('OK: can select image_url on certifications')
  }

  console.log('\n--- Row counts (portfolio tables) ---')
  const tables = [
    'profile',
    'education',
    'beyond_stats',
    'goals',
    'skill_groups',
    'skills',
    'projects',
    'experiences',
    'certifications',
  ]
  for (const t of tables) {
    const r = await countTable(client, t)
    if (r.error) console.log(`${t}: ERROR ${r.error}`)
    else console.log(`${t}: ${r.count}`)
  }

  console.log('\n--- Manual checks (11.3) ---')
  console.log('1. Open site: Home, About, Projects, Experience, Skills, Education, Certifications, Beyond, Contact')
  console.log('2. Open /dev/supabase — confirm portfolio probe succeeds')
  console.log('3. Open /admin — Profile, Education, Experiences, Projects, Skills, Certifications populated')
  console.log('4. Edit a project title in admin, refresh /projects')
  console.log('5. Delete a cert in admin, refresh /certifications')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
