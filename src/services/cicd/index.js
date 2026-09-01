/**
 * CI/CD service layer.
 *
 * The page talks to the five named services below and never to a provider
 * directly. A provider is any object implementing `PROVIDER_CONTRACT`; the one
 * in use is resolved once, here, so connecting GitHub Actions, GitLab CI,
 * Vercel or a self-hosted runner is a one-line change plus a new module.
 *
 *   import { githubProvider } from './githubProvider'
 *   registerProvider(githubProvider)
 *
 * Provider selection reads `VITE_CICD_PROVIDER` so an environment can opt into
 * a live backend without a code change. Unknown or unset values fall back to
 * the mock provider, which is also what keeps this page useful in a portfolio
 * deployment that has no CI backend attached.
 */

import { mockProvider } from './mockProvider'

/**
 * The surface every provider must implement. Documented as data so a new
 * provider can be checked against it in a test rather than by reading prose.
 * @type {ReadonlyArray<string>}
 */
export const PROVIDER_CONTRACT = Object.freeze([
  'getSnapshot',
  'getActivity',
  'nextLogLine',
  'rollback',
  'retry',
  'createDeployment',
])

const registry = new Map([[mockProvider.id, mockProvider]])

/** Register a provider implementation so it can be selected by id. */
export function registerProvider(provider) {
  const missing = PROVIDER_CONTRACT.filter((fn) => typeof provider?.[fn] !== 'function')
  if (missing.length) {
    throw new Error(`CI/CD provider "${provider?.id}" is missing: ${missing.join(', ')}`)
  }
  registry.set(provider.id, provider)
  return provider
}

const requestedId = import.meta.env?.VITE_CICD_PROVIDER?.trim() || mockProvider.id

/** The active provider. Falls back to mock when the requested id is unknown. */
export function getProvider() {
  return registry.get(requestedId) || mockProvider
}

/** True when the page is showing synthetic data rather than a live backend. */
export const isMockProvider = () => getProvider().id === mockProvider.id

/* -------------------------------------------------------------------------
   Named services. Each is a thin, intention-revealing façade over the
   provider so components read as domain language, not transport calls.
   ------------------------------------------------------------------------- */

export const pipelineService = {
  /** Full dashboard snapshot in one round trip. */
  getSnapshot: (options) => getProvider().getSnapshot(options),
  /** Pipeline run volume bucketed for a time range: `24h` | `7d` | `30d`. */
  getActivity: (range) => getProvider().getActivity(range),
  /** Re-run a pipeline that failed. */
  retry: (payload) => getProvider().retry(payload),
}

export const deploymentService = {
  create: (payload) => getProvider().createDeployment(payload),
  rollback: (payload) => getProvider().rollback(payload),
}

export const environmentService = {
  /** Environments arrive with the snapshot; this narrows it for callers that only need them. */
  async list(options) {
    const snapshot = await getProvider().getSnapshot(options)
    return snapshot.environments
  },
}

export const healthService = {
  async list(options) {
    const snapshot = await getProvider().getSnapshot(options)
    return snapshot.metrics
  },
}

export const logsService = {
  async list(options) {
    const snapshot = await getProvider().getSnapshot(options)
    return snapshot.logs
  },
  /** One synthetic line for the live tail. Real providers stream instead. */
  tail: (index) => getProvider().nextLogLine(index),
}
