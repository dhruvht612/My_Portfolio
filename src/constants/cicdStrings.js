/**
 * Every user-visible string on the CI/CD page.
 *
 * Centralised so copy can be reviewed in one place and later swapped for an
 * i18n catalogue without touching component logic. Components import from here
 * rather than inlining prose.
 */

export const CICD_COPY = {
  page: {
    eyebrow: 'Delivery control',
    title: 'CI/CD Pipeline',
    subtitle: 'Monitor builds, deployments, tests, infrastructure and production health.',
  },

  controls: {
    search: 'Search',
    searchPlaceholder: 'Search deployments, commits, branches…',
    refresh: 'Refresh',
    refreshing: 'Refreshing',
    environment: 'Environment',
    newDeployment: 'New Deployment',
    lastChecked: 'Last checked',
  },

  status: {
    allOperational: 'All systems operational',
    degraded: 'Degraded performance',
    critical: 'Service disruption',
    panelTitle: 'Pipeline status',
    healthyBody: 'All production pipelines are operational.',
    degradedBody: 'A non-blocking check needs attention. Production traffic is unaffected.',
    criticalBody: 'A production pipeline has failed. Investigate before promoting further builds.',
  },

  metrics: {
    pipelines: 'Pipelines',
    running: 'Running',
    failed: 'Failed',
    successRate: 'Success rate',
    uptime: 'Uptime',
    buildSuccess: 'Build success rate',
    deploySuccess: 'Deployment success',
    testPass: 'Test pass rate',
    productionUptime: 'Production uptime',
    activityTitle: 'Pipeline activity',
  },

  pipeline: {
    title: 'Active pipeline',
    subtitle: 'Build #1842 · main · 8fa21c',
    selectHint: 'Select a stage for detail',
    viewLogs: 'View Logs',
    stageDetail: 'Stage detail',
  },

  environments: {
    title: 'Environment health',
    subtitle: 'Live targets and what is currently running on each.',
    version: 'Version',
    deployed: 'Deployed',
    uptime: 'Uptime',
    responseTime: 'Response',
    errorRate: 'Error rate',
    throughput: 'Throughput',
    commit: 'Commit',
    region: 'Region',
    branch: 'Branch',
    latency: 'Response time trend',
  },

  deployments: {
    title: 'Deployment history',
    subtitle: 'Every release across all environments.',
    columns: {
      status: 'Status',
      version: 'Version',
      environment: 'Environment',
      commit: 'Commit',
      author: 'Author',
      duration: 'Duration',
      time: 'Time',
      actions: 'Actions',
    },
    view: 'View',
    logs: 'Logs',
    rollback: 'Rollback',
    retry: 'Retry',
    empty: 'No deployments match these filters.',
    emptyHint: 'Clear the search or choose a different filter.',
  },

  tests: {
    title: 'Test health',
    subtitle: 'Latest results per suite.',
    passed: 'passed',
    failed: 'failed',
    pass: 'pass',
    noFailures: 'No failing tests in this suite.',
    failureHeading: 'Failing tests',
  },

  security: {
    title: 'Security & quality',
    subtitle: 'Dependency posture, vulnerabilities and code quality gates.',
    dependencies: 'Dependencies',
    vulnerabilities: 'Vulnerabilities',
    codeQuality: 'Code quality',
    technicalDebt: 'Technical debt',
    coverage: 'Coverage',
    viewReport: 'View Security Report',
    critical: 'Critical',
    high: 'High',
    moderate: 'Moderate',
    low: 'Low',
    outdated: 'outdated',
    tracked: 'tracked',
    scanned: 'Scanned',
  },

  system: {
    title: 'System health',
    subtitle: 'Infrastructure signals feeding the delivery pipeline.',
    openFull: 'Open System health',
    checked: 'Checked',
  },

  activity: {
    title: 'Pipeline activity',
    subtitle: 'Everything that happened, newest first.',
    empty: 'No activity recorded yet.',
  },

  incidents: {
    attentionTitle: 'Attention required',
    clearTitle: 'No active incidents',
    clearBody: 'All monitored pipelines are operating normally.',
    detected: 'Detected',
    affected: 'Affected',
    component: 'Component',
    investigate: 'Investigate',
  },

  logs: {
    title: 'Pipeline logs',
    live: 'Live',
    errorsOnly: 'Errors only',
    search: 'Search logs',
    searchPlaceholder: 'Filter log lines…',
    copy: 'Copy',
    copied: 'Copied',
    expand: 'Expand',
    collapse: 'Collapse',
    empty: 'No log lines match this filter.',
    streaming: 'Streaming',
    paused: 'Paused',
  },

  drawer: {
    title: 'Deployment',
    version: 'Version',
    commit: 'Commit',
    branch: 'Branch',
    author: 'Author',
    started: 'Started',
    duration: 'Duration',
    pipeline: 'Pipeline',
    filesChanged: 'Files changed',
    tests: 'Tests',
    security: 'Security',
    testsPassed: 'passed',
    criticalVulns: 'critical',
    viewLogs: 'View Logs',
    retry: 'Retry',
    rollback: 'Rollback',
  },

  rollback: {
    title: 'Roll back deployment?',
    lead: 'will be reverted from',
    to: 'to',
    reason: 'Reason',
    reasonPlaceholder: 'Why is this rollback necessary?',
    reasonRequired: 'A reason is required before rolling back.',
    cancel: 'Cancel',
    confirm: 'Confirm Rollback',
    running: 'Rolling back…',
    done: 'Rollback complete',
    steps: ['Draining traffic', 'Restoring previous artifact', 'Running smoke tests', 'Shifting traffic back'],
  },

  newDeployment: {
    title: 'New deployment',
    steps: ['Project', 'Branch', 'Environment', 'Review', 'Deploy'],
    selectProject: 'Select a project',
    selectBranch: 'Select a branch',
    selectEnvironment: 'Select an environment',
    review: 'Review',
    project: 'Project',
    branch: 'Branch',
    environment: 'Environment',
    commit: 'Commit',
    back: 'Back',
    next: 'Next',
    start: 'Start Deployment',
    deploying: 'Deploying',
    complete: 'Deployment complete',
    close: 'Close',
    productionWarning: 'This deploys straight to production and will serve live traffic.',
  },

  ranges: {
    '24h': '24H',
    '7d': '7D',
    '30d': '30D',
  },

  errors: {
    loadTitle: 'Could not load pipeline data',
    loadBody: 'The CI/CD provider did not respond. Retry, or check the provider configuration.',
    retry: 'Retry',
  },

  toasts: {
    refreshed: 'Pipeline data refreshed',
    copiedCommit: 'Commit hash copied',
    copiedLogs: 'Logs copied to clipboard',
    copyFailed: 'Could not copy to clipboard',
    rollbackStarted: 'Rollback started',
    rollbackDone: 'Rollback complete',
    retryQueued: 'Pipeline re-queued',
    deploymentQueued: 'Deployment started',
  },

  mockNotice: 'Showing simulated pipeline data — connect a provider to stream live builds.',
}

/** Deployment history filter options, in display order. */
export const DEPLOYMENT_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'production', label: 'Production' },
  { value: 'staging', label: 'Staging' },
  { value: 'development', label: 'Development' },
  { value: 'successful', label: 'Successful' },
  { value: 'failed', label: 'Failed' },
]

/** Time ranges for the activity visualisation. */
export const TIME_RANGES = [
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
]

/** Environment scope options for the header filter. */
export const ENVIRONMENT_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'production', label: 'Production' },
  { value: 'staging', label: 'Staging' },
  { value: 'development', label: 'Development' },
]
