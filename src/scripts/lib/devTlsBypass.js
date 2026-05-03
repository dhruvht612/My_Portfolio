/* eslint-env node */
/**
 * When `SUPABASE_DEV_INSECURE_TLS=1` is set (e.g. in `.env`), disables TLS certificate
 * verification for this Node process only. Fixes `UNABLE_TO_VERIFY_LEAF_SIGNATURE` when
 * antivirus or a proxy re-signs HTTPS with a cert Node does not trust.
 *
 * Never enable in production servers or CI. Browser / Vite bundle is unaffected.
 */
export function applyDevTlsBypassFromEnv() {
  const v = String(process.env.SUPABASE_DEV_INSECURE_TLS ?? '').toLowerCase()
  if (v !== '1' && v !== 'true' && v !== 'yes') return
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
  console.warn(
    '\n[dev] SUPABASE_DEV_INSECURE_TLS: Node will not verify TLS certificates for this process.\n' +
      '    Use only on your PC for local scripts. Do not use in production or shared CI.\n',
  )
}
