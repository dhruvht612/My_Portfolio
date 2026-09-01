/**
 * CI/CD domain model.
 *
 * These typedefs are the contract between the UI and whatever backs it. Today
 * every field is filled by the mock provider in `services/cicd/mockProvider.js`;
 * swapping in GitHub Actions, GitLab, Vercel or a self-hosted runner means
 * mapping that API onto these shapes and nothing in the components changes.
 *
 * Keep this file free of UI concerns — no colours, no labels, no JSX. Presentation
 * tokens live in `components/admin/cicd/statusTokens.js`, copy lives in
 * `constants/cicdStrings.js`.
 */

/**
 * Lifecycle of a single pipeline stage or run.
 * @typedef {'passed' | 'running' | 'warning' | 'failed' | 'queued' | 'skipped'} RunStatus
 */

/**
 * Coarse health roll-up used by environments, services and the global banner.
 * @typedef {'healthy' | 'degraded' | 'critical' | 'active' | 'unknown'} HealthLevel
 */

/**
 * @typedef {'production' | 'staging' | 'development'} EnvironmentId
 */

/**
 * A deployable unit. One project owns many pipelines.
 * @typedef {object} Project
 * @property {string} id
 * @property {string} name
 * @property {string} repository       Owner/name form, e.g. `dhruvht612/My_Portfolio`.
 * @property {string} defaultBranch
 * @property {string[]} branches       Branches a deployment may be started from.
 * @property {string} provider         Source provider key: `github` | `gitlab` | ...
 */

/**
 * A pipeline definition (not a single execution).
 * @typedef {object} Pipeline
 * @property {string} id
 * @property {string} projectId
 * @property {string} name
 * @property {EnvironmentId} targetEnvironment
 * @property {RunStatus} status        Status of the most recent run.
 * @property {string} lastRunId
 */

/**
 * One execution of a pipeline.
 * @typedef {object} PipelineRun
 * @property {string} id
 * @property {string} pipelineId
 * @property {number} number           Monotonic build number, e.g. 1842.
 * @property {RunStatus} status
 * @property {string} branch
 * @property {string} commit           Short SHA.
 * @property {string} commitMessage
 * @property {string} author
 * @property {string} startedAt        ISO 8601.
 * @property {number} durationSec
 * @property {PipelineStage[]} stages
 */

/**
 * A single node in the pipeline graph. `progress` only applies while running.
 * @typedef {object} PipelineStage
 * @property {string} id
 * @property {string} name
 * @property {RunStatus} status
 * @property {number} durationSec
 * @property {number} [progress]       0..1, present when status is `running`.
 * @property {string} summary          One-line result, e.g. `1,248 tests`.
 * @property {StageDetail} detail
 */

/**
 * Expanded facts for a stage, shown when its node is opened.
 * @typedef {object} StageDetail
 * @property {Array<{ label: string, value: string, copyable?: boolean }>} fields
 * @property {string[]} [notes]
 */

/**
 * A release of a build into an environment.
 * @typedef {object} Deployment
 * @property {string} id
 * @property {number} number
 * @property {RunStatus} status
 * @property {string} version
 * @property {EnvironmentId} environment
 * @property {string} commit
 * @property {string} commitMessage
 * @property {string} branch
 * @property {string} author
 * @property {number} durationSec
 * @property {string} startedAt        ISO 8601.
 * @property {number} filesChanged
 * @property {number} testsPassed
 * @property {number} criticalVulns
 * @property {PipelineStage[]} stages
 * @property {boolean} rollbackAvailable
 */

/**
 * A running target: production, staging or a dev sandbox.
 * @typedef {object} Environment
 * @property {EnvironmentId} id
 * @property {string} name
 * @property {HealthLevel} health
 * @property {string} version
 * @property {string} deployedAt       ISO 8601.
 * @property {string} commit
 * @property {string} branch
 * @property {number} uptimePct
 * @property {number} responseTimeMs
 * @property {number} requestsPerMin
 * @property {number} errorRatePct
 * @property {string} region
 * @property {string} url
 * @property {number[]} latencyHistory  Newest last — drives the sparkline.
 */

/**
 * An aggregated suite result.
 * @typedef {object} TestSuite
 * @property {string} id
 * @property {string} name
 * @property {number} passed
 * @property {number} total
 * @property {number} durationSec
 * @property {number} trendPct        Change vs the previous run, signed.
 * @property {Array<{ name: string, error: string }>} failures
 */

/**
 * Dependency + vulnerability posture for the latest scan.
 * @typedef {object} SecurityScan
 * @property {string} scannedAt        ISO 8601.
 * @property {{ critical: number, high: number, moderate: number, low: number }} vulnerabilities
 * @property {{ total: number, outdated: number, critical: number, moderate: number }} dependencies
 * @property {string} codeQualityGrade
 * @property {'Low' | 'Moderate' | 'High'} technicalDebt
 * @property {number} coveragePct
 * @property {number} licenseIssues
 */

/**
 * One infrastructure signal on the system-health grid.
 * @typedef {object} SystemMetric
 * @property {string} id
 * @property {string} name
 * @property {HealthLevel} health
 * @property {string} value            Preformatted for display, e.g. `32%`.
 * @property {number} [numeric]        Present when the metric is a percentage.
 * @property {string} checkedAt        ISO 8601.
 * @property {number[]} history        Newest last — drives the sparkline.
 */

/**
 * An entry in the pipeline activity feed.
 * @typedef {object} ActivityEvent
 * @property {string} id
 * @property {'deployment' | 'build' | 'security' | 'test' | 'dependency' | 'rollback' | 'incident'} kind
 * @property {'success' | 'warning' | 'error' | 'info'} tone
 * @property {string} title
 * @property {string} detail
 * @property {string} at               ISO 8601.
 */

/**
 * An open problem that needs a human.
 * @typedef {object} Incident
 * @property {string} id
 * @property {'warning' | 'critical'} severity
 * @property {string} title
 * @property {string} description
 * @property {string} detectedAt       ISO 8601.
 * @property {EnvironmentId} environment
 * @property {string} component
 */

/**
 * A single line in the log stream.
 * @typedef {object} LogEntry
 * @property {string} id
 * @property {string} at               ISO 8601.
 * @property {'INFO' | 'PASS' | 'WARN' | 'FAIL' | 'DEBUG'} level
 * @property {string} message
 * @property {string} [stage]
 */

/**
 * Roll-up shown in the global status panel.
 * @typedef {object} PipelineSummary
 * @property {HealthLevel} level
 * @property {number} buildSuccessPct
 * @property {number} deploySuccessPct
 * @property {number} testPassPct
 * @property {number} uptimePct
 * @property {number} pipelines
 * @property {number} running
 * @property {number} failed
 * @property {Array<{ t: string, runs: number, failures: number }>} activity
 */

export {}
