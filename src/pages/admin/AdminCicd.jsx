import { AlertOctagon, Info } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import CicdActivityFeed from '../../components/admin/cicd/CicdActivityFeed'
import CicdCommandHeader from '../../components/admin/cicd/CicdCommandHeader'
import CicdDeploymentDrawer from '../../components/admin/cicd/CicdDeploymentDrawer'
import CicdDeploymentHistory from '../../components/admin/cicd/CicdDeploymentHistory'
import CicdEnvironments from '../../components/admin/cicd/CicdEnvironments'
import CicdIncidentPanel from '../../components/admin/cicd/CicdIncidentPanel'
import CicdLogViewer from '../../components/admin/cicd/CicdLogViewer'
import CicdNewDeployment from '../../components/admin/cicd/CicdNewDeployment'
import CicdPipelineFlow from '../../components/admin/cicd/CicdPipelineFlow'
import CicdRollbackDialog from '../../components/admin/cicd/CicdRollbackDialog'
import CicdSecurityQuality from '../../components/admin/cicd/CicdSecurityQuality'
import CicdSecurityReport from '../../components/admin/cicd/CicdSecurityReport'
import CicdStatusPanel from '../../components/admin/cicd/CicdStatusPanel'
import CicdSystemHealth from '../../components/admin/cicd/CicdSystemHealth'
import CicdTestHealth from '../../components/admin/cicd/CicdTestHealth'
import CicdTopMetricsStrip from '../../components/admin/cicd/CicdTopMetrics'
import { CICD_COPY } from '../../constants/cicdStrings'
import { useCicdPipeline, useLiveLogs } from '../../hooks/useCicdPipeline'
import { isMockProvider, pipelineService } from '../../services/cicd'
import { useToast } from '../../hooks/useToast'

/**
 * CI/CD command centre.
 *
 * Section order follows the questions an operator asks, in order: is anything
 * broken, is the system healthy overall, what is running now, what is deployed
 * where, what shipped recently, and finally the evidence — tests, security,
 * infrastructure and logs. Nothing that answers one of the first four questions
 * sits below the fold on a 1440px display.
 *
 * All state that more than one section needs — the search term, the environment
 * scope, which deployment is open — lives here; the sections stay presentational
 * so they can be reused or reordered without rewiring.
 */
export default function AdminCicd() {
  const toast = useToast()
  const { data, status, error, refreshing, checkedAt, refresh } = useCicdPipeline()

  const [search, setSearch] = useState('')
  const [environmentScope, setEnvironmentScope] = useState('all')
  const [range, setRange] = useState('24h')
  // Buckets are stored with the range they belong to, so "is this stale?" is a
  // comparison rather than a second piece of state to keep in sync.
  const [activity, setActivity] = useState(null)

  const [selectedDeployment, setSelectedDeployment] = useState(null)
  const [rollbackTarget, setRollbackTarget] = useState(null)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)

  const [logsLive, setLogsLive] = useState(true)
  const [focusStage, setFocusStage] = useState(null)
  const logsRef = useRef(null)

  const loading = status === 'loading'
  const logs = useLiveLogs(data?.logs, logsLive && status === 'ready')

  /* ------------------------------------------------------------- activity */

  // The histogram range is fetched separately so switching 24H/7D/30D does not
  // re-pull the entire dashboard.
  useEffect(() => {
    if (status !== 'ready') return undefined
    let cancelled = false
    pipelineService
      .getActivity(range)
      .then((buckets) => {
        if (!cancelled) setActivity({ range, buckets })
      })
      .catch(() => {
        // Leave the previous range on screen; the histogram is context, not a
        // primary signal, so a failed bucket fetch must not blank the panel.
        if (!cancelled) setActivity(null)
      })
    return () => {
      cancelled = true
    }
  }, [range, status])

  const activityLoading = activity?.range !== range

  /* -------------------------------------------------------------- derived */

  // The environment filter scopes every section that is environment-specific.
  const scopedDeployments = useMemo(() => {
    if (!data?.deployments) return []
    if (environmentScope === 'all') return data.deployments
    return data.deployments.filter((d) => d.environment === environmentScope)
  }, [data, environmentScope])

  const scopedIncidents = useMemo(() => {
    if (!data?.incidents) return []
    if (environmentScope === 'all') return data.incidents
    return data.incidents.filter((i) => i.environment === environmentScope)
  }, [data, environmentScope])

  /** The release a rollback would restore: the last success in the same environment. */
  const findPreviousVersion = useCallback(
    (deployment) => {
      if (!deployment || !data?.deployments) return null
      const earlier = data.deployments
        .filter(
          (d) =>
            d.environment === deployment.environment &&
            d.status === 'passed' &&
            d.id !== deployment.id &&
            new Date(d.startedAt) < new Date(deployment.startedAt),
        )
        .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
      return earlier[0]?.version || null
    },
    [data],
  )

  const previousVersion = useMemo(() => findPreviousVersion(rollbackTarget), [findPreviousVersion, rollbackTarget])

  /**
   * Opening the rollback dialog with nothing to roll back to would present a
   * confirm button that cannot do anything, so the check happens here.
   */
  const requestRollback = useCallback(
    (deployment) => {
      const target = findPreviousVersion(deployment)
      if (!target) {
        toast.error(`No earlier successful release in ${deployment.environment} to roll back to`)
        return
      }
      setSelectedDeployment(null)
      setRollbackTarget(deployment)
    },
    [findPreviousVersion, toast],
  )

  /* -------------------------------------------------------------- actions */

  const scrollToLogs = useCallback(() => {
    logsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  const onRefresh = useCallback(async () => {
    await refresh()
    toast.success(CICD_COPY.toasts.refreshed)
  }, [refresh, toast])

  const onViewStageLogs = useCallback(
    (stage) => {
      setFocusStage(stage)
      setLogsLive(false)
      scrollToLogs()
    },
    [scrollToLogs],
  )

  const onViewDeploymentLogs = useCallback(
    (deployment) => {
      setSelectedDeployment(null)
      setFocusStage(null)
      setLogsLive(false)
      toast.success(`Showing logs for ${deployment.version}`)
      scrollToLogs()
    },
    [scrollToLogs, toast],
  )

  const onRetry = useCallback(
    async (deployment) => {
      setSelectedDeployment(null)
      await pipelineService.retry({ deploymentId: deployment.id })
      toast.success(`${CICD_COPY.toasts.retryQueued} — ${deployment.version}`)
    },
    [toast],
  )

  const onRollbackConfirmed = useCallback(() => {
    toast.success(CICD_COPY.toasts.rollbackDone)
    refresh()
  }, [toast, refresh])

  const onDeployed = useCallback(() => {
    toast.success(CICD_COPY.toasts.deploymentQueued)
    refresh()
  }, [toast, refresh])

  const onInvestigate = useCallback(
    (incident) => {
      // Point the log pane at the stage that produced the incident so
      // "Investigate" lands on evidence rather than the top of the stream.
      const stage = data?.stages?.find((s) => s.status === 'warning' || s.status === 'failed')
      setFocusStage(stage || null)
      setLogsLive(false)
      toast.success(`Investigating ${incident.component}`)
      scrollToLogs()
    },
    [data, scrollToLogs, toast],
  )

  /* ---------------------------------------------------------------- error */

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-[1500px] space-y-5">
        <CicdCommandHeader
          level="critical"
          checkedAt={checkedAt}
          refreshing={refreshing}
          onRefresh={onRefresh}
          search={search}
          onSearchChange={setSearch}
          environment={environmentScope}
          onEnvironmentChange={setEnvironmentScope}
          onNewDeployment={() => setWizardOpen(true)}
        />
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-rose-400/25 bg-[rgba(40,10,18,0.4)] px-6 py-12 text-center backdrop-blur-xl">
          <AlertOctagon className="h-8 w-8 text-rose-300" aria-hidden />
          <h2 className="text-lg font-bold text-slate-100">{CICD_COPY.errors.loadTitle}</h2>
          <p className="max-w-md text-sm leading-relaxed text-slate-400">{CICD_COPY.errors.loadBody}</p>
          {error?.message ? <p className="font-mono text-[11px] text-slate-600">{error.message}</p> : null}
          <button type="button" onClick={refresh} className="theme-btn theme-btn-primary mt-1 px-4 py-2 text-sm">
            {CICD_COPY.errors.retry}
          </button>
        </div>
      </div>
    )
  }

  /* ----------------------------------------------------------------- page */

  return (
    <div className="mx-auto max-w-[1500px] space-y-5">
      <CicdCommandHeader
        level={data?.summary?.level || 'healthy'}
        checkedAt={checkedAt}
        refreshing={refreshing}
        onRefresh={onRefresh}
        search={search}
        onSearchChange={setSearch}
        environment={environmentScope}
        onEnvironmentChange={setEnvironmentScope}
        onNewDeployment={() => setWizardOpen(true)}
      />

      {isMockProvider() ? (
        <p className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-2 text-[11px] text-slate-500">
          <Info className="h-3.5 w-3.5 shrink-0 text-sky-400/70" aria-hidden />
          {CICD_COPY.mockNotice}
        </p>
      ) : null}

      {/* 1 — is anything failing? */}
      <CicdIncidentPanel incidents={scopedIncidents} loading={loading} onInvestigate={onInvestigate} />

      {/* 2 — is everything healthy? */}
      <CicdTopMetricsStrip summary={data?.summary} loading={loading} />

      <CicdStatusPanel
        summary={data?.summary}
        activity={activity?.buckets ?? data?.summary?.activity}
        range={range}
        onRangeChange={setRange}
        activityLoading={activityLoading}
        loading={loading}
      />

      {/* 3 — what is running now? */}
      <CicdPipelineFlow stages={data?.stages} currentRun={data?.currentRun} loading={loading} onViewLogs={onViewStageLogs} />

      {/* 4 — what is deployed where? */}
      <CicdEnvironments environments={data?.environments} loading={loading} scope={environmentScope} />

      {/* 5 — what shipped recently? */}
      <CicdDeploymentHistory
        deployments={scopedDeployments}
        loading={loading}
        search={search}
        onSelect={setSelectedDeployment}
        onViewLogs={onViewDeploymentLogs}
        onRollback={requestRollback}
      />

      {/* 6 — the evidence */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <CicdTestHealth suites={data?.testSuites} loading={loading} />
        <CicdActivityFeed events={data?.activity} loading={loading} />
      </div>

      <CicdSecurityQuality scan={data?.security} loading={loading} onViewReport={() => setReportOpen(true)} />

      <CicdSystemHealth metrics={data?.metrics} loading={loading} />

      <CicdLogViewer
        ref={logsRef}
        logs={logs}
        live={logsLive}
        onToggleLive={() => setLogsLive((v) => !v)}
        focusStage={focusStage}
        onClearFocus={() => setFocusStage(null)}
      />

      {/* Overlays */}
      <CicdDeploymentDrawer
        deployment={selectedDeployment}
        open={Boolean(selectedDeployment)}
        onClose={() => setSelectedDeployment(null)}
        onViewLogs={onViewDeploymentLogs}
        onRetry={onRetry}
        onRollback={requestRollback}
      />

      <CicdRollbackDialog
        key={rollbackTarget?.id || 'rollback-idle'}
        open={Boolean(rollbackTarget)}
        deployment={rollbackTarget}
        previousVersion={previousVersion}
        onClose={() => setRollbackTarget(null)}
        onConfirm={onRollbackConfirmed}
      />

      <CicdNewDeployment key={wizardOpen ? 'wizard-open' : 'wizard-idle'} open={wizardOpen} projects={data?.projects} onClose={() => setWizardOpen(false)} onDeploy={onDeployed} />

      <CicdSecurityReport scan={data?.security} open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  )
}
