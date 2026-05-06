import { AnimatePresence, motion as Motion } from 'framer-motion'
import { AlertTriangle, Database, Globe, HardDrive, KeyRound, ScrollText, Server } from 'lucide-react'
import { useMemo } from 'react'
import NotConfiguredBanner from '../../components/admin/NotConfiguredBanner'
import AIInsightsPanel from '../../components/admin/system-health/AIInsightsPanel'
import HealthObservabilityCharts from '../../components/admin/system-health/HealthObservabilityCharts'
import InfrastructureTopology from '../../components/admin/system-health/InfrastructureTopology'
import ObservabilityAmbient from '../../components/admin/system-health/ObservabilityAmbient'
import ObservabilityTerminalDock from '../../components/admin/system-health/ObservabilityTerminalDock'
import ObservabilityWidgets from '../../components/admin/system-health/ObservabilityWidgets'
import ServiceHealthCard from '../../components/admin/system-health/ServiceHealthCard'
import SystemHealthCommandHeader from '../../components/admin/system-health/SystemHealthCommandHeader'
import TerminalActivityFeed from '../../components/admin/system-health/TerminalActivityFeed'
import { InteractiveLogsTable } from '@/components/ui/interactive-logs-table-shadcnui'
import { mapHealthEventsToLogs } from '@/lib/mapHealthEventsToLogs'
import { isSupabaseConfigured } from '@/lib/supabase'
import { computeUptimePct, useSystemHealth } from '../../hooks/useSystemHealth'

const appVersion = import.meta.env.VITE_APP_VERSION?.trim() || null

const EVENT_NEEDLE = {
  database: 'Supabase Database',
  auth: 'Supabase Auth',
  storage: 'Supabase Storage',
  frontend: 'Frontend',
  api: 'Backend API',
}

function blendUptime(pcts) {
  const vals = pcts.filter((x) => typeof x === 'number')
  if (!vals.length) return null
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
}

export default function AdminSystemHealth() {
  const { results, histories, events, running, initialComplete, overall, secondsSinceUpdate, refresh, apiConfigured, lastRunAt } =
    useSystemHealth()

  const cardLoading = !initialComplete

  const healthLogs = useMemo(() => mapHealthEventsToLogs(events), [events])

  const monitoredKeys = useMemo(
    () => ['database', 'auth', 'storage', 'frontend', ...(apiConfigured ? ['api'] : [])],
    [apiConfigured]
  )

  const monitoredCount = monitoredKeys.length

  const uptimeBlend = useMemo(() => {
    const pcts = monitoredKeys.map((k) => computeUptimePct(histories[k])).filter((x) => x != null)
    return blendUptime(pcts)
  }, [histories, monitoredKeys])

  const { probeSuccessRate, avgLatencyMs, errorPct } = useMemo(() => {
    let operationalPts = 0
    let totalPts = 0
    let msSum = 0
    let msN = 0
    let errW = 0
    let errN = 0

    for (const k of monitoredKeys) {
      const h = histories[k] || []
      for (const pt of h) {
        totalPts++
        errN++
        if (pt.status === 'operational') {
          operationalPts++
        } else {
          errW += pt.status === 'down' ? 1 : 0.35
        }
        if (pt.ms != null) {
          msSum += pt.ms
          msN++
        }
      }
    }

    return {
      probeSuccessRate: totalPts ? Math.round((100 * operationalPts) / totalPts) : null,
      avgLatencyMs: msN ? msSum / msN : null,
      errorPct: errN ? Math.min(100, Math.round((100 * errW) / errN)) : null,
    }
  }, [histories, monitoredKeys])

  const ambient = overall.level === 'down' ? 'critical' : overall.level === 'degraded' ? 'degraded' : 'operational'

  /** @param {string} needle */
  const eventsFor = (needle) =>
    events.filter((e) =>
      needle === EVENT_NEEDLE.frontend ? e.message.includes('Frontend') && !e.message.includes('Backend API') : e.message.includes(needle)
    )

  return (
    <ObservabilityAmbient intensity={overall.level === 'down' ? 'critical' : overall.level === 'degraded' ? 'degraded' : 'operational'}>
      <div
        className={`mx-auto max-w-[1500px] space-y-6 rounded-[28px] p-4 sm:p-6 ${
          overall.level === 'down'
            ? 'shadow-[0_0_0_1px_rgba(248,113,113,0.35),0_46px_120px_rgba(248,113,113,0.12)]'
            : overall.level === 'degraded'
              ? 'shadow-[0_0_0_1px_rgba(251,191,36,0.22),0_46px_120px_rgba(251,191,36,0.08)]'
              : 'shadow-[0_0_0_1px_rgba(56,189,248,0.10),0_46px_120px_rgba(56,189,248,0.06)]'
        }`}
      >
        <NotConfiguredBanner />

        <AnimatePresence initial={false}>
          {overall.level !== 'operational' ? (
            <Motion.div
              key="incident"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`rounded-2xl border px-5 py-4 backdrop-blur-xl ${
                overall.level === 'down'
                  ? 'border-red-400/35 bg-[rgba(50,10,16,0.55)] shadow-[0_0_54px_rgba(248,113,113,0.12)]'
                  : 'border-amber-400/30 bg-[rgba(40,32,12,0.45)] shadow-[0_0_44px_rgba(251,191,36,0.10)]'
              }`}
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.04] px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-200">
                  <AlertTriangle className={`h-4 w-4 ${overall.level === 'down' ? 'text-red-300' : 'text-amber-300'}`} aria-hidden />
                  Incident posture
                </span>
                <p className="text-sm leading-relaxed text-slate-200">
                  Posture drift detected — escalate from charts first, validate credentials/RPS, validate edge origin routing, then database health.
                </p>
              </div>
            </Motion.div>
          ) : null}
        </AnimatePresence>

        <SystemHealthCommandHeader
          overall={overall}
          running={running}
          initialComplete={initialComplete}
          secondsSinceUpdate={secondsSinceUpdate}
          monitoredCount={monitoredCount}
          uptimeBlend={uptimeBlend}
          onRefresh={refresh}
          appVersion={appVersion}
        />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
          <InfrastructureTopology results={results} apiConfigured={apiConfigured} pulseKey={lastRunAt ?? 0} />
          <AIInsightsPanel histories={histories} results={results} apiConfigured={apiConfigured} />
        </div>

        <ObservabilityWidgets
          results={results}
          events={events}
          probeSuccessRate={probeSuccessRate}
          avgLatencyMs={avgLatencyMs}
          errorPct={errorPct}
          checksPerCycle={5}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <ServiceHealthCard
            serviceKey="database"
            title="Supabase Database"
            description="Lightweight read on profile row"
            icon={Database}
            result={results.database}
            uptimePct={computeUptimePct(histories.database)}
            history={histories.database}
            loading={cardLoading}
            relatedEvents={eventsFor(EVENT_NEEDLE.database)}
          />
          <ServiceHealthCard
            serviceKey="auth"
            title="Supabase Auth"
            description="Session round-trip (GoTrue)"
            icon={KeyRound}
            result={results.auth}
            uptimePct={computeUptimePct(histories.auth)}
            history={histories.auth}
            loading={cardLoading}
            relatedEvents={eventsFor(EVENT_NEEDLE.auth)}
          />
          <ServiceHealthCard
            serviceKey="storage"
            title="Supabase Storage"
            description="List objects in logos (fallback: project-images)"
            icon={HardDrive}
            result={results.storage}
            uptimePct={computeUptimePct(histories.storage)}
            history={histories.storage}
            loading={cardLoading}
            relatedEvents={eventsFor(EVENT_NEEDLE.storage)}
          />
          <ServiceHealthCard
            serviceKey="frontend"
            title="Frontend"
            description="GET / on your public origin (defaults to this host; override with VITE_HEALTH_CHECK_ORIGIN)"
            icon={Globe}
            result={results.frontend}
            uptimePct={computeUptimePct(histories.frontend)}
            history={histories.frontend}
            loading={cardLoading}
            relatedEvents={eventsFor(EVENT_NEEDLE.frontend)}
          />
          <ServiceHealthCard
            serviceKey="api"
            title="Backend API"
            description={apiConfigured ? 'GET /health or /' : 'Optional — set VITE_API_URL'}
            icon={Server}
            result={results.api}
            uptimePct={apiConfigured ? computeUptimePct(histories.api) : null}
            history={histories.api}
            loading={cardLoading}
            relatedEvents={eventsFor(EVENT_NEEDLE.api)}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <HealthObservabilityCharts histories={histories} includeApi={apiConfigured} height={340} />
          <TerminalActivityFeed events={events} running={running} />
        </div>

        <ObservabilityTerminalDock configured={isSupabaseConfigured} />

        <div className="space-y-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <ScrollText className="h-4 w-4 text-sky-400/80" aria-hidden />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Structured log export</h3>
            </div>
            {events.length === 0 ? <p className="text-[11px] text-slate-500">Waiting for next health check…</p> : null}
          </div>
          <InteractiveLogsTable logs={healthLogs} embedded title="Infrastructure logs" />
        </div>

        <p className="text-center font-mono text-[10px] text-slate-600">
          observe_plane={ambient.toUpperCase()} · synthetic_probes=ON · jitter_control=MED · render_tier=S · motion_policy= restrained-luxe
        </p>
      </div>
    </ObservabilityAmbient>
  )
}
