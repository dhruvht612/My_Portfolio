/* eslint-env node */
/**
 * Upload logo images from src/assets to Supabase Storage `logos` bucket
 * and set public URLs on education, experiences, and certifications rows.
 *
 * Usage: npm run migrate-assets
 *
 * Requires: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env
 */
import { createClient } from '@supabase/supabase-js'
import { existsSync, readFileSync, readdirSync } from 'fs'
import { extname, join } from 'path'
import { applyDevTlsBypassFromEnv } from './lib/devTlsBypass.js'
import { loadDotEnv } from './lib/loadDotEnv.js'
import {
  formatFetchChain,
  isTlsCertificateVerificationFailure,
  normalizeSupabaseProjectUrl,
  printTlsCertificateVerificationHints,
  probeSupabaseReachable,
} from './lib/supabaseProjectUrl.js'

const ASSETS_DIR = join(process.cwd(), 'src', 'assets')
const BUCKET = 'logos'

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp'])

function contentTypeFor(file) {
  const ext = extname(file).toLowerCase()
  if (ext === '.png') return 'image/png'
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  if (ext === '.webp') return 'image/webp'
  return 'application/octet-stream'
}

function listImageFiles() {
  if (!existsSync(ASSETS_DIR)) return []
  return readdirSync(ASSETS_DIR).filter((name) => IMAGE_EXT.has(extname(name).toLowerCase()))
}

function issuerToFilename(issuer) {
  const i = issuer.trim()
  if (/Amazon Web Services|\bAWS\b/i.test(i)) return 'Amazon_Web_Services_Logo-kl.png'
  if (/HackerRank/i.test(i)) return 'HackerRank_logo.png'
  if (/\bGoogle\b/i.test(i)) return 'Google_Logo.jpg'
  if (/Datacom/i.test(i)) return 'DataCom_logo.png'
  if (/Accenture/i.test(i)) return 'Accenture_logo.png'
  if (/Deloitte/i.test(i)) return 'Deloitte_logo.jpg'
  if (/Walmart/i.test(i)) return 'Walmart_Globle_Tech.jpg'
  if (/Electronic Arts|\bEA\b/i.test(i)) return 'Ea-Logo-PNG-HD.png'
  if (/Skyscanner/i.test(i)) return 'SkyScanner_logo.png'
  if (/OneRoadmap/i.test(i)) return 'oneroadmap_logo.jpeg'
  if (/freeCodeCamp|Free Code Camp/i.test(i)) return 'Free_Code_Camp_logo.jpg'
  if (/Fletcher/i.test(i)) return 'fletchers_meadow_logo.png'
  if (/OTU|Ontario Tech/i.test(i)) return 'ontariotechu_logo.png'
  return null
}

function organizationToFilename(org) {
  const o = org.trim()
  if (/Ontario Tech|\bOTU\b|GDSC|CITech|Media Pass|Gujarati Student|Student Union/i.test(o)) {
    return 'ontariotechu_logo.png'
  }
  if (/Fletcher/i.test(o)) return 'fletchers_meadow_logo.png'
  return null
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
  const probe = await probeSupabaseReachable(url)
  if (!probe.ok) {
    console.error('Network probe failed — cannot reach Supabase.')
    console.error('Tried:', probe.healthUrl)
    console.error('Detail:', formatFetchChain(probe.error))
    if (isTlsCertificateVerificationFailure(probe.error)) printTlsCertificateVerificationHints()
    process.exit(1)
  }

  const client = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  let certificationsHaveImageUrl = true
  {
    const { error: colProbe } = await client.from('certifications').select('image_url').limit(1)
    if (
      colProbe &&
      /image_url/i.test(colProbe.message || '') &&
      /does not exist|schema cache/i.test(colProbe.message || '')
    ) {
      certificationsHaveImageUrl = false
      console.warn(
        '[migrate-assets] certifications.image_url missing — run docs/migrations/add_certifications_image_url.sql. Skipping certification image_url updates.',
      )
    } else if (colProbe) {
      throw new Error(`certifications schema probe: ${colProbe.message}`)
    }
  }

  const files = listImageFiles()
  if (!files.length) {
    console.warn(`No image files found in ${ASSETS_DIR}. Nothing to upload.`)
    console.warn('Add PNG/JPEG/WebP assets under src/assets/ (see src/constants/media.js), then re-run.')
    return
  }

  /** @type {Map<string, string>} filename -> public URL */
  const publicUrlByFile = new Map()

  for (const name of files) {
    const localPath = join(ASSETS_DIR, name)
    const body = readFileSync(localPath)
    const objectPath = name
    const { error: upErr } = await client.storage.from(BUCKET).upload(objectPath, body, {
      upsert: true,
      contentType: contentTypeFor(name),
    })
    if (upErr) {
      console.error(`Upload failed (${name}):`, upErr.message)
      throw upErr
    }
    const { data: pub } = client.storage.from(BUCKET).getPublicUrl(objectPath)
    const publicUrl = pub?.publicUrl
    if (!publicUrl) throw new Error(`No public URL for ${name}`)
    publicUrlByFile.set(name, publicUrl)
    console.log(`Uploaded logos/${objectPath} -> ${publicUrl}`)
  }

  const otLogo = publicUrlByFile.get('ontariotechu_logo.png')
  if (otLogo) {
    const { data: eduRows, error: e1 } = await client.from('education').select('id').limit(5)
    if (e1) throw e1
    for (const row of eduRows || []) {
      const { error } = await client.from('education').update({ logo_url: otLogo }).eq('id', row.id)
      if (error) throw error
      console.log(`Updated education ${row.id} logo_url`)
    }
  } else {
    console.warn('Skipping education.logo_url (ontariotechu_logo.png not uploaded)')
  }

  const { data: expRows, error: exErr } = await client.from('experiences').select('id, organization')
  if (exErr) throw exErr
  for (const row of expRows || []) {
    const fn = organizationToFilename(String(row.organization ?? ''))
    if (!fn) continue
    const logoUrl = publicUrlByFile.get(fn)
    if (!logoUrl) continue
    const { error } = await client.from('experiences').update({ logo_url: logoUrl }).eq('id', row.id)
    if (error) throw error
    console.log(`Updated experience ${row.organization} -> ${fn}`)
  }

  if (certificationsHaveImageUrl) {
    const { data: certRows, error: cErr } = await client.from('certifications').select('id, issuer')
    if (cErr) throw cErr
    for (const row of certRows || []) {
      const fn = issuerToFilename(String(row.issuer ?? ''))
      if (!fn) continue
      const imageUrl = publicUrlByFile.get(fn)
      if (!imageUrl) continue
      const { error } = await client.from('certifications').update({ image_url: imageUrl }).eq('id', row.id)
      if (error) throw error
      console.log(`Updated certification issuer=${row.issuer} -> ${fn}`)
    }
  }

  console.log('migrate-assets done.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
