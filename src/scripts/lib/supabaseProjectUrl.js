/* eslint-env node */
/**
 * Normalize VITE_SUPABASE_URL for @supabase/supabase-js (project root only).
 * Strips trailing slashes and accidental `/rest/v1` suffixes from the dashboard.
 */
export function normalizeSupabaseProjectUrl(raw) {
  if (!raw || typeof raw !== 'string') return ''
  let s = raw.trim().replace(/\/+$/, '')
  const lower = s.toLowerCase()
  const restIdx = lower.indexOf('/rest/v1')
  if (restIdx !== -1) {
    s = s.slice(0, restIdx).replace(/\/+$/, '')
  }
  return s
}

/** @param {unknown} err */
export function formatFetchChain(err) {
  const parts = []
  let c = err
  let depth = 0
  while (c && depth++ < 8) {
    if (typeof c === 'string') {
      parts.push(c)
      break
    }
    if (c.code) parts.push(`code=${c.code}`)
    if (c.errno != null) parts.push(`errno=${c.errno}`)
    if (c.syscall) parts.push(`syscall=${c.syscall}`)
    if (c.address) parts.push(`address=${c.address}`)
    if (c.message) parts.push(c.message)
    c = c.cause
    if (c) parts.push('→')
  }
  return parts.join(' ')
}

/**
 * Quick TLS/DNS check before createClient (same stack Node uses for Supabase).
 * @param {string} projectUrl normalized https://…supabase.co
 */
export async function probeSupabaseReachable(projectUrl) {
  const base = projectUrl.replace(/\/$/, '')
  const healthUrl = `${base}/auth/v1/health`
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), 15000)
  try {
    const res = await fetch(healthUrl, {
      method: 'GET',
      signal: ac.signal,
      headers: { Accept: 'application/json' },
    })
    clearTimeout(timer)
    return { ok: true, status: res.status, healthUrl }
  } catch (e) {
    clearTimeout(timer)
    return { ok: false, error: e, healthUrl }
  }
}

/** @param {unknown} err */
export function isTlsCertificateVerificationFailure(err) {
  const flat = formatFetchChain(err).toLowerCase()
  if (flat.includes('unable_to_verify_leaf_signature')) return true
  if (flat.includes('unable to verify the first certificate')) return true
  if (flat.includes('certificate verify failed')) return true
  if (flat.includes('self signed certificate') || flat.includes('self-signed certificate')) return true
  if (flat.includes('sec_error_unknown_issuer')) return true
  if (flat.includes('sec_e_untrusted_root')) return true
  return false
}

export function printTlsCertificateVerificationHints() {
  console.error('\nTLS: Node could not verify the server certificate (often antivirus HTTPS scanning or a corporate proxy).')
  console.error('Browsers may still work because they use the Windows certificate store; Node uses a different CA bundle.')
  console.error('')
  console.error('Fixes (try in order):')
  console.error('  1) Export your org / antivirus root CA as a PEM file, then in the same shell:')
  console.error('       set NODE_EXTRA_CA_CERTS=C:\\path\\to\\root.pem')
  console.error('     Then run npm again.')
  console.error('  2) Temporarily disable HTTPS inspection in antivirus (only if your policy allows).')
  console.error('  3) Update Node.js to the current LTS release.')
  console.error('')
  console.error('Avoid NODE_TLS_REJECT_UNAUTHORIZED=0 except as a temporary local experiment; it turns off all TLS verification.')
}
