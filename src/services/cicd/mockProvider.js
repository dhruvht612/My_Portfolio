/**
 * Mock CI/CD provider.
 *
 * Implements the same async surface a real provider must implement (see
 * `PROVIDER_CONTRACT` in `./index.js`), so the UI never learns where its data
 * came from. Everything here is synthetic but internally consistent: the
 * deployment that owns build #1842 is the one the environment card reports as
 * live, the failing integration suite is the one the incident panel surfaces,
 * and the log stream is the transcript of the run the pipeline graph shows.
 *
 * Replacing this with GitHub Actions means writing a module exporting the same
 * functions that maps `GET /repos/{owner}/{repo}/actions/runs` onto the typedefs
 * in `types/cicd.js`. No component changes.
 */

/** @typedef {import('../../types/cicd.js').PipelineStage} PipelineStage */

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** Deterministic PRNG so a given seed always renders the same dataset. */
function rng(seed) {
  let s = seed >>> 0 || 1
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return ((s >>> 0) % 100000) / 100000
  }
}

const ago = (ms) => new Date(Date.now() - ms).toISOString()

/** A series that wanders around a baseline instead of looking like noise. */
function series(seed, length, base, spread) {
  const rand = rng(seed)
  let v = base
  return Array.from({ length }, () => {
    v += (rand() - 0.5) * spread
    v = Math.max(base - spread * 1.6, Math.min(base + spread * 1.6, v))
    return Math.round(v * 100) / 100
  })
}

const AUTHOR = 'Dhruv'

/* ---------------------------------------------------------------- projects */

const PROJECTS = [
  {
    id: 'proj-portfolio',
    name: 'Portfolio',
    repository: 'dhruvht612/My_Portfolio',
    defaultBranch: 'main',
    branches: ['main', 'develop', 'feat/cicd-pipeline', 'feat/nav-enhancements'],
    provider: 'github',
  },
  {
    id: 'proj-api',
    name: 'Portfolio API',
    repository: 'dhruvht612/portfolio-api',
    defaultBranch: 'main',
    branches: ['main', 'develop', 'fix/rate-limit'],
    provider: 'github',
  },
  {
    id: 'proj-edge',
    name: 'Edge Functions',
    repository: 'dhruvht612/portfolio-edge',
    defaultBranch: 'main',
    branches: ['main', 'develop'],
    provider: 'github',
  },
]

/* ------------------------------------------------------------------ stages */

/**
 * Stage graph for the run currently on screen. `seed` shifts durations so a
 * refresh reads as a new run rather than a frozen snapshot.
 * @returns {PipelineStage[]}
 */
function buildStages(seed = 1, { degraded = false } = {}) {
  const rand = rng(seed)
  const jitter = (n, pct = 0.18) => Math.max(1, Math.round(n * (1 + (rand() - 0.5) * pct * 2)))

  return [
    {
      id: 'source',
      name: 'Source',
      status: 'passed',
      durationSec: jitter(4),
      summary: '3 commits',
      detail: {
        fields: [
          { label: 'Commit', value: '8fa21c', copyable: true },
          { label: 'Branch', value: 'main' },
          { label: 'Author', value: AUTHOR },
          { label: 'Trigger', value: 'push' },
          { label: 'Changed files', value: '24' },
        ],
        notes: ['Checkout completed with submodules and LFS objects resolved.'],
      },
    },
    {
      id: 'build',
      name: 'Build',
      status: 'passed',
      durationSec: jitter(42),
      summary: '4 artifacts',
      detail: {
        fields: [
          { label: 'Build', value: '#1842' },
          { label: 'Commit', value: '8fa21c', copyable: true },
          { label: 'Branch', value: 'main' },
          { label: 'Runner', value: 'ubuntu-latest' },
          { label: 'Node', value: '22.x' },
          { label: 'Artifacts', value: '4' },
          { label: 'Bundle', value: '284 kB gzip' },
        ],
        notes: ['Vite production build. Cache hit on the pnpm store.'],
      },
    },
    {
      id: 'unit',
      name: 'Unit tests',
      status: 'passed',
      durationSec: jitter(23),
      summary: '1,248 tests',
      detail: {
        fields: [
          { label: 'Passed', value: '1,248' },
          { label: 'Failed', value: '0' },
          { label: 'Skipped', value: '8' },
          { label: 'Runner', value: 'vitest 4.1' },
          { label: 'Shards', value: '4' },
          { label: 'Coverage', value: '87.4%' },
        ],
      },
    },
    {
      id: 'integration',
      name: 'Integration',
      status: degraded ? 'warning' : 'passed',
      durationSec: jitter(degraded ? 96 : 61),
      summary: degraded ? 'Checkout API slow' : '312 tests',
      detail: {
        fields: [
          { label: 'Passed', value: degraded ? '309' : '312' },
          { label: 'Failed', value: degraded ? '3' : '0' },
          { label: 'Slowest', value: 'Checkout API · 4.2s' },
          { label: 'Services', value: 'postgres, redis' },
        ],
        notes: degraded
          ? ['Checkout API returned 503 on 3 of 312 assertions. Upstream sandbox rate limit suspected.']
          : undefined,
      },
    },
    {
      id: 'security',
      name: 'Security',
      status: 'passed',
      durationSec: jitter(18),
      summary: '0 critical',
      detail: {
        fields: [
          { label: 'Critical', value: '0' },
          { label: 'High', value: '1' },
          { label: 'Moderate', value: '4' },
          { label: 'Scanner', value: 'npm audit + CodeQL' },
          { label: 'Licenses', value: 'OK' },
        ],
        notes: ['1 high advisory in a transitive dev dependency; it does not ship in the client bundle.'],
      },
    },
    {
      id: 'staging',
      name: 'Staging',
      status: 'passed',
      durationSec: jitter(37),
      summary: 'v2.8.5-rc1',
      detail: {
        fields: [
          { label: 'Version', value: 'v2.8.5-rc1' },
          { label: 'Region', value: 'iad1' },
          { label: 'Smoke tests', value: '18 passed' },
          { label: 'URL', value: 'staging.portfolio.app' },
        ],
      },
    },
    {
      id: 'production',
      name: 'Production',
      status: 'running',
      durationSec: jitter(21),
      progress: 0.62,
      summary: 'Promoting v2.8.4',
      detail: {
        fields: [
          { label: 'Version', value: 'v2.8.4' },
          { label: 'Strategy', value: 'Rolling · 25% steps' },
          { label: 'Regions', value: 'iad1, sfo1' },
          { label: 'Health gate', value: 'Passing' },
        ],
        notes: ['Traffic shifted to 50%. Error budget consumption nominal.'],
      },
    },
  ]
}

/** Stage list for a finished historical deployment. */
function completedStages(outcome = 'passed') {
  const names = ['Build', 'Unit Tests', 'Integration', 'Security', 'Staging', 'Production']
  const durations = [42, 23, 61, 18, 37, 21]
  return names.map((name, i) => {
    let status = 'passed'
    if (outcome === 'failed' && i >= 4) status = i === 4 ? 'failed' : 'skipped'
    if (outcome === 'warning' && i === 2) status = 'warning'
    return {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      status,
      durationSec: durations[i],
      summary: '',
      detail: { fields: [] },
    }
  })
}

/* ------------------------------------------------------------- deployments */

const DEPLOYMENTS = [
  {
    id: 'dep-1842',
    number: 1842,
    status: 'passed',
    version: 'v2.8.4',
    environment: 'production',
    commit: '8fa21c',
    commitMessage: 'feat(nav): rebuild navbar logic, a11y, and visual layers',
    branch: 'main',
    author: AUTHOR,
    durationSec: 102,
    startedAt: ago(18 * MINUTE),
    filesChanged: 24,
    testsPassed: 1248,
    criticalVulns: 0,
    stages: completedStages('passed'),
    rollbackAvailable: true,
  },
  {
    id: 'dep-1841',
    number: 1841,
    status: 'passed',
    version: 'v2.8.3',
    environment: 'production',
    commit: '7bd821',
    commitMessage: 'fix(nav): animate the drawer height with grid-template-rows',
    branch: 'main',
    author: AUTHOR,
    durationSec: 91,
    startedAt: ago(4 * HOUR),
    filesChanged: 6,
    testsPassed: 1244,
    criticalVulns: 0,
    stages: completedStages('passed'),
    rollbackAvailable: true,
  },
  {
    id: 'dep-1840',
    number: 1840,
    status: 'warning',
    version: 'v2.8.2',
    environment: 'staging',
    commit: '6aa912',
    commitMessage: 'feat: add Vercel Web Analytics',
    branch: 'develop',
    author: AUTHOR,
    durationSec: 134,
    startedAt: ago(7 * HOUR),
    filesChanged: 11,
    testsPassed: 1231,
    criticalVulns: 0,
    stages: completedStages('warning'),
    rollbackAvailable: true,
  },
  {
    id: 'dep-1839',
    number: 1839,
    status: 'failed',
    version: 'v2.8.1',
    environment: 'development',
    commit: '5bc821',
    commitMessage: 'chore(deps): bump supabase-js to 2.105.1',
    branch: 'develop',
    author: AUTHOR,
    durationSec: 48,
    startedAt: ago(26 * HOUR),
    filesChanged: 3,
    testsPassed: 1102,
    criticalVulns: 0,
    stages: completedStages('failed'),
    rollbackAvailable: false,
  },
  {
    id: 'dep-1838',
    number: 1838,
    status: 'passed',
    version: 'v2.8.0',
    environment: 'production',
    commit: '4de7a0',
    commitMessage: 'feat(admin): observability terminal dock',
    branch: 'main',
    author: AUTHOR,
    durationSec: 118,
    startedAt: ago(2 * DAY),
    filesChanged: 38,
    testsPassed: 1226,
    criticalVulns: 0,
    stages: completedStages('passed'),
    rollbackAvailable: true,
  },
  {
    id: 'dep-1837',
    number: 1837,
    status: 'passed',
    version: 'v2.7.9',
    environment: 'staging',
    commit: '3ab551',
    commitMessage: 'refactor(health): extract the probe scheduler',
    branch: 'develop',
    author: AUTHOR,
    durationSec: 87,
    startedAt: ago(3 * DAY),
    filesChanged: 14,
    testsPassed: 1218,
    criticalVulns: 0,
    stages: completedStages('passed'),
    rollbackAvailable: true,
  },
  {
    id: 'dep-1836',
    number: 1836,
    status: 'passed',
    version: 'v2.7.8',
    environment: 'development',
    commit: '2fc190',
    commitMessage: 'test: cover the portfolio fetchers',
    branch: 'develop',
    author: AUTHOR,
    durationSec: 63,
    startedAt: ago(4 * DAY),
    filesChanged: 9,
    testsPassed: 1210,
    criticalVulns: 0,
    stages: completedStages('passed'),
    rollbackAvailable: true,
  },
  {
    id: 'dep-1835',
    number: 1835,
    status: 'failed',
    version: 'v2.7.7',
    environment: 'staging',
    commit: '1bd004',
    commitMessage: 'feat(logs): structured log export',
    branch: 'develop',
    author: AUTHOR,
    durationSec: 55,
    startedAt: ago(5 * DAY),
    filesChanged: 21,
    testsPassed: 1180,
    criticalVulns: 1,
    stages: completedStages('failed'),
    rollbackAvailable: false,
  },
]

/* ------------------------------------------------------------ environments */

function environments(seed = 7) {
  return [
    {
      id: 'production',
      name: 'Production',
      health: 'healthy',
      version: 'v2.8.4',
      deployedAt: ago(18 * MINUTE),
      commit: '8fa21c',
      branch: 'main',
      uptimePct: 99.98,
      responseTimeMs: 128,
      requestsPerMin: 1840,
      errorRatePct: 0.02,
      region: 'iad1 · sfo1',
      url: 'portfolio.app',
      latencyHistory: series(seed, 32, 128, 22),
    },
    {
      id: 'staging',
      name: 'Staging',
      health: 'degraded',
      version: 'v2.8.5-rc1',
      deployedAt: ago(42 * MINUTE),
      commit: '9cd340',
      branch: 'develop',
      uptimePct: 99.62,
      responseTimeMs: 214,
      requestsPerMin: 96,
      errorRatePct: 0.94,
      region: 'iad1',
      url: 'staging.portfolio.app',
      latencyHistory: series(seed + 3, 32, 214, 58),
    },
    {
      id: 'development',
      name: 'Development',
      health: 'active',
      version: 'v2.8.5-dev',
      deployedAt: ago(6 * MINUTE),
      commit: 'a1e77b',
      branch: 'feat/cicd-pipeline',
      uptimePct: 98.4,
      responseTimeMs: 302,
      requestsPerMin: 12,
      errorRatePct: 1.8,
      region: 'local · iad1',
      url: 'dev.portfolio.app',
      latencyHistory: series(seed + 6, 32, 302, 90),
    },
  ]
}

/* -------------------------------------------------------------------- tests */

const TEST_SUITES = [
  {
    id: 'unit',
    name: 'Unit tests',
    passed: 1248,
    total: 1256,
    durationSec: 23,
    trendPct: 0.3,
    failures: [
      { name: 'formatRelativeTime > rolls over at 24h', error: 'expected "1d ago" to be "yesterday"' },
      { name: 'useSystemHealth > retries on 429', error: 'timeout after 5000ms' },
    ],
  },
  {
    id: 'integration',
    name: 'Integration',
    passed: 309,
    total: 312,
    durationSec: 61,
    trendPct: -0.6,
    failures: [
      { name: 'Checkout API > creates session', error: 'HTTP 503 from the upstream sandbox' },
      { name: 'Checkout API > applies discount', error: 'HTTP 503 from the upstream sandbox' },
      { name: 'Checkout API > replays webhook', error: 'HTTP 503 from the upstream sandbox' },
    ],
  },
  {
    id: 'e2e',
    name: 'End-to-end',
    passed: 139,
    total: 143,
    durationSec: 184,
    trendPct: -1.1,
    failures: [
      { name: 'admin > rollback confirmation', error: 'element not visible within 10s' },
      { name: 'public > contact form submit', error: 'flaky: network idle never reached' },
    ],
  },
  {
    id: 'security',
    name: 'Security',
    passed: 64,
    total: 64,
    durationSec: 18,
    trendPct: 0,
    failures: [],
  },
]

/* ----------------------------------------------------------------- security */

const SECURITY_SCAN = {
  scannedAt: ago(24 * MINUTE),
  vulnerabilities: { critical: 0, high: 1, moderate: 4, low: 9 },
  dependencies: { total: 1284, outdated: 37, critical: 0, moderate: 2 },
  codeQualityGrade: 'A',
  technicalDebt: 'Low',
  coveragePct: 87.4,
  licenseIssues: 0,
  scanners: ['npm audit', 'CodeQL', 'license-checker'],
  /**
   * Individual advisories behind the counts above. Identifiers are synthetic
   * placeholders in a real advisory's shape, not references to actual CVEs.
   */
  advisories: [
    {
      id: 'ADV-2026-0412',
      severity: 'high',
      package: 'nested-tar-stream',
      version: '1.4.2',
      title: 'Path traversal when extracting crafted archives',
      path: 'devDependency > build-toolchain > nested-tar-stream',
      fixedIn: '1.4.5',
      shipsToClient: false,
    },
    {
      id: 'ADV-2026-0388',
      severity: 'moderate',
      package: 'query-parse',
      version: '3.0.1',
      title: 'Prototype pollution via deeply nested query strings',
      path: 'dependency > router-utils > query-parse',
      fixedIn: '3.0.4',
      shipsToClient: true,
    },
    {
      id: 'ADV-2026-0361',
      severity: 'moderate',
      package: 'color-convert-fast',
      version: '2.1.0',
      title: 'Inefficient regular expression complexity',
      path: 'devDependency > style-pipeline > color-convert-fast',
      fixedIn: '2.1.3',
      shipsToClient: false,
    },
    {
      id: 'ADV-2026-0340',
      severity: 'moderate',
      package: 'iso-date-lite',
      version: '0.9.7',
      title: 'Incorrect timezone handling on leap seconds',
      path: 'dependency > iso-date-lite',
      fixedIn: '0.9.9',
      shipsToClient: true,
    },
    {
      id: 'ADV-2026-0325',
      severity: 'moderate',
      package: 'stream-chunker',
      version: '4.2.2',
      title: 'Unbounded buffer growth on malformed input',
      path: 'devDependency > test-harness > stream-chunker',
      fixedIn: '4.2.6',
      shipsToClient: false,
    },
  ],
}

/* ------------------------------------------------------------ system health */

function systemMetrics(seed = 11) {
  const at = ago(40 * 1000)
  return [
    { id: 'cpu', name: 'CPU', health: 'healthy', value: '32%', numeric: 32, checkedAt: at, history: series(seed, 24, 32, 9) },
    { id: 'memory', name: 'Memory', health: 'healthy', value: '61%', numeric: 61, checkedAt: at, history: series(seed + 1, 24, 61, 7) },
    { id: 'database', name: 'Database', health: 'healthy', value: '14 ms', checkedAt: at, history: series(seed + 2, 24, 14, 4) },
    { id: 'api', name: 'API', health: 'healthy', value: '128 ms', checkedAt: at, history: series(seed + 3, 24, 128, 20) },
    { id: 'cdn', name: 'CDN', health: 'healthy', value: '99.99%', checkedAt: at, history: series(seed + 4, 24, 99.9, 0.2) },
    { id: 'queue', name: 'Queue', health: 'degraded', value: '184 jobs', checkedAt: at, history: series(seed + 5, 24, 184, 60) },
    { id: 'storage', name: 'Storage', health: 'healthy', value: '42%', numeric: 42, checkedAt: at, history: series(seed + 6, 24, 42, 3) },
    { id: 'network', name: 'Network', health: 'healthy', value: '38 ms', checkedAt: at, history: series(seed + 7, 24, 38, 8) },
  ]
}

/* ----------------------------------------------------------------- activity */

const ACTIVITY = [
  { id: 'act-1', kind: 'deployment', tone: 'success', title: 'Deployment completed', detail: 'Production · v2.8.4', at: ago(18 * MINUTE) },
  { id: 'act-2', kind: 'build', tone: 'success', title: 'Build completed', detail: 'main · #1842 · 42s', at: ago(22 * MINUTE) },
  { id: 'act-3', kind: 'security', tone: 'success', title: 'Security scan completed', detail: '0 critical vulnerabilities', at: ago(24 * MINUTE) },
  { id: 'act-4', kind: 'test', tone: 'warning', title: 'Integration test slowed', detail: 'Checkout API · 4.2s p95', at: ago(31 * MINUTE) },
  { id: 'act-5', kind: 'deployment', tone: 'success', title: 'Staging promoted', detail: 'Staging · v2.8.5-rc1', at: ago(42 * MINUTE) },
  { id: 'act-6', kind: 'build', tone: 'success', title: 'Build completed', detail: 'develop · #1841 · 51s', at: ago(58 * MINUTE) },
  { id: 'act-7', kind: 'dependency', tone: 'info', title: 'Dependency update', detail: 'react 19.1.0 to 19.2.0', at: ago(2 * HOUR) },
  { id: 'act-8', kind: 'test', tone: 'success', title: 'E2E suite passed', detail: '139 / 143 · 4 skipped', at: ago(3 * HOUR) },
  { id: 'act-9', kind: 'deployment', tone: 'success', title: 'Deployment completed', detail: 'Production · v2.8.3', at: ago(4 * HOUR) },
  { id: 'act-10', kind: 'incident', tone: 'error', title: 'Pipeline failed', detail: 'Development · v2.8.1 · security gate', at: ago(26 * HOUR) },
  { id: 'act-11', kind: 'rollback', tone: 'warning', title: 'Rollback executed', detail: 'Staging · v2.7.7 to v2.7.6', at: ago(5 * DAY) },
  { id: 'act-12', kind: 'dependency', tone: 'info', title: 'Lockfile refreshed', detail: '37 packages updated', at: ago(6 * DAY) },
]

/* ---------------------------------------------------------------- incidents */

const INCIDENTS = [
  {
    id: 'inc-401',
    severity: 'warning',
    title: 'Integration test failure',
    description:
      'Checkout API returned 503 during the end-to-end suite. Three assertions failed against the upstream sandbox; production traffic is unaffected.',
    detectedAt: ago(9 * MINUTE),
    environment: 'staging',
    component: 'Checkout API',
  },
]

/* --------------------------------------------------------------------- logs */

const LOG_SCRIPT = [
  ['INFO', 'Starting build #1842', 'build'],
  ['INFO', 'Restoring dependency cache (pnpm store)', 'build'],
  ['INFO', 'Installing dependencies - 1,284 packages', 'build'],
  ['PASS', 'Dependencies installed in 11.4s', 'build'],
  ['INFO', 'Running vitest across 4 shards', 'unit'],
  ['PASS', '1248 tests passed, 8 skipped', 'unit'],
  ['INFO', 'Booting integration services (postgres, redis)', 'integration'],
  ['WARN', 'Checkout API p95 4.2s exceeds the 2.0s budget', 'integration'],
  ['FAIL', 'Checkout API > creates session - HTTP 503', 'integration'],
  ['INFO', 'Running security scan (npm audit + CodeQL)', 'security'],
  ['PASS', 'No critical vulnerabilities detected', 'security'],
  ['INFO', 'Creating production artifact', 'build'],
  ['PASS', 'Artifact portfolio-2.8.4.tar.gz - 284 kB gzip', 'build'],
  ['INFO', 'Promoting to staging (iad1)', 'staging'],
  ['PASS', 'Smoke tests 18/18 passed', 'staging'],
  ['INFO', 'Shifting production traffic - 25%', 'production'],
  ['INFO', 'Health gate passing - error budget nominal', 'production'],
  ['INFO', 'Shifting production traffic - 50%', 'production'],
]

function buildLogs() {
  const start = Date.now() - 20 * MINUTE
  return LOG_SCRIPT.map(([level, message, stage], i) => ({
    id: `log-${i}`,
    at: new Date(start + i * 14000).toISOString(),
    level,
    message,
    stage,
  }))
}

/** Lines appended by the live tail, cycled so the stream keeps moving. */
const LIVE_LINES = [
  ['INFO', 'Shifting production traffic - 75%', 'production'],
  ['PASS', 'Region iad1 healthy - 0 5xx in the last 60s', 'production'],
  ['INFO', 'Warming edge cache (142 routes)', 'production'],
  ['PASS', 'Region sfo1 healthy - p95 121ms', 'production'],
  ['INFO', 'Revalidating the static manifest', 'production'],
  ['PASS', 'Deployment successful - v2.8.4 live', 'production'],
  ['INFO', 'Collecting post-deploy metrics', 'production'],
  ['WARN', 'Queue depth 184 - above the soft limit of 150', 'production'],
]

/* ------------------------------------------------------------------ summary */

function summary(seed = 3) {
  const rand = rng(seed)
  const activity = Array.from({ length: 24 }, (_, i) => {
    const runs = Math.round(2 + rand() * 9)
    return {
      t: new Date(Date.now() - (23 - i) * HOUR).toISOString(),
      runs,
      failures: rand() > 0.82 ? 1 : 0,
    }
  })
  return {
    level: 'healthy',
    buildSuccessPct: 98.7,
    deploySuccessPct: 97.9,
    testPassPct: 99.1,
    uptimePct: 99.98,
    pipelines: 12,
    running: 2,
    failed: 1,
    activity,
  }
}

/** Activity buckets for the 7D / 30D ranges. */
function activityForRange(range, seed = 3) {
  if (range === '24h') return summary(seed).activity
  const buckets = range === '7d' ? 7 : 30
  const rand = rng(seed + buckets)
  return Array.from({ length: buckets }, (_, i) => ({
    t: new Date(Date.now() - (buckets - 1 - i) * DAY).toISOString(),
    runs: Math.round(18 + rand() * 46),
    failures: rand() > 0.7 ? Math.round(rand() * 3) : 0,
  }))
}

/* ------------------------------------------------------------------- export */

/** Simulated network latency so loading and skeleton states are real code paths. */
const latency = (ms = 420) => new Promise((resolve) => setTimeout(resolve, ms))

let seedCounter = 1

export const mockProvider = {
  id: 'mock',
  label: 'Mock data',

  async getSnapshot({ signal } = {}) {
    await latency(460)
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    const seed = seedCounter++
    return {
      projects: PROJECTS,
      summary: summary(seed),
      stages: buildStages(seed, { degraded: true }),
      currentRun: {
        id: 'run-1842',
        pipelineId: 'pipe-portfolio-prod',
        number: 1842,
        status: 'running',
        branch: 'main',
        commit: '8fa21c',
        commitMessage: 'feat(nav): rebuild navbar logic, a11y, and visual layers',
        author: AUTHOR,
        startedAt: ago(3 * MINUTE),
        durationSec: 186,
      },
      deployments: DEPLOYMENTS,
      environments: environments(seed),
      testSuites: TEST_SUITES,
      security: SECURITY_SCAN,
      metrics: systemMetrics(seed),
      activity: ACTIVITY,
      incidents: INCIDENTS,
      logs: buildLogs(),
      checkedAt: new Date().toISOString(),
    }
  },

  async getActivity(range) {
    await latency(280)
    return activityForRange(range)
  },

  /** Next line for the live log tail. */
  nextLogLine(index) {
    const [level, message, stage] = LIVE_LINES[index % LIVE_LINES.length]
    return { id: `live-${index}-${Date.now()}`, at: new Date().toISOString(), level, message, stage }
  },

  async rollback({ deploymentId, toVersion, reason }) {
    await latency(300)
    return { ok: true, deploymentId, toVersion, reason, startedAt: new Date().toISOString() }
  },

  async retry({ deploymentId }) {
    await latency(300)
    return { ok: true, deploymentId, runId: `run-${Date.now()}` }
  },

  async createDeployment({ projectId, branch, environment }) {
    await latency(300)
    return {
      ok: true,
      id: `dep-${Date.now()}`,
      projectId,
      branch,
      environment,
      commit: '8fa21c',
      startedAt: new Date().toISOString(),
    }
  },
}

export default mockProvider
