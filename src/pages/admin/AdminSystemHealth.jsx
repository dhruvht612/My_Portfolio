import { Activity, Database, Globe, HardDrive, KeyRound, RefreshCw, ScrollText, Server } from 'lucide-react'
import { useMemo } from 'react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import NotConfiguredBanner from '../../components/admin/NotConfiguredBanner'
import StatusBadge from '../../components/admin/StatusBadge'
import ActivityFeed from '../../components/admin/system-health/ActivityFeed'
import HealthLatencyChart from '../../components/admin/system-health/HealthLatencyChart'
import ServiceHealthCard from '../../components/admin/system-health/ServiceHealthCard'
import { InteractiveLogsTable } from '@/components/ui/interactive-logs-table-shadcnui'
import { mapHealthEventsToLogs } from '@/lib/mapHealthEventsToLogs'
import { computeUptimePct, useSystemHealth } from '../../hooks/useSystemHealth'
const appVersion = import.meta.env.VITE_APP_VERSION?.trim() || null

export default function AdminSystemHealth() {
  const { results, histories, events, running, initialComplete, overall, secondsSinceUpdate, refresh, apiConfigured } =
    useSystemHealth()

  const cardLoading = !initialComplete

  const healthLogs = useMemo(() => mapHealthEventsToLogs(events), [events])

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <NotConfiguredBanner />

      <div className="admin-card-premium p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <AdminPageHeader
            eyebrow="Observability"
            title="System health"
            description="Live status of your infrastructure — probes run on a fixed interval with real latency measurements."
          >
            <button
              type="button"
              onClick={() => refresh()}
              disabled={running}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-slate-100 shadow-sm transition hover:border-sky-500/30 hover:bg-white/[0.09] disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${running ? 'animate-spin' : ''}`} aria-hidden />
              Refresh
            </button>
          </AdminPageHeader>

          <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/[0.06] px-4 py-3 lg:items-end">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={overall.tone}>{overall.headline}</StatusBadge>
              {running && initialComplete ? (
                <span className="text-[11px] font-medium uppercase tracking-wide text-sky-400/80">Updating…</span>
              ) : null}
            </div>
            <p className="text-xs text-slate-500">
              Auto-refresh every 12s
              {secondsSinceUpdate != null ? (
                <>
                  {' '}
                  · Last run <span className="tabular-nums text-slate-400">{secondsSinceUpdate}s ago</span>
                </>
              ) : null}
            </p>
            {appVersion ? (
              <p className="text-[10px] text-slate-600">
                Build <span className="font-mono text-slate-500">{appVersion}</span>
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <ServiceHealthCard
            title="Supabase Database"
            description="Lightweight read on profile row"
            icon={Database}
            result={results.database}
            uptimePct={computeUptimePct(histories.database)}
            loading={cardLoading}
          />
          <ServiceHealthCard
            title="Supabase Auth"
            description="Session round-trip (GoTrue)"
            icon={KeyRound}
            result={results.auth}
            uptimePct={computeUptimePct(histories.auth)}
            loading={cardLoading}
          />
          <ServiceHealthCard
            title="Supabase Storage"
            description="List objects in logos (fallback: project-images)"
            icon={HardDrive}
            result={results.storage}
            uptimePct={computeUptimePct(histories.storage)}
            loading={cardLoading}
          />
          <ServiceHealthCard
            title="Frontend"
            description="GET / on your public origin (defaults to this host; override with VITE_HEALTH_CHECK_ORIGIN)"
            icon={Globe}
            result={results.frontend}
            uptimePct={computeUptimePct(histories.frontend)}
            loading={cardLoading}
          />
          <ServiceHealthCard
            title="Backend API"
            description={apiConfigured ? 'GET /health or /' : 'Optional — set VITE_API_URL'}
            icon={Server}
            result={results.api}
            uptimePct={apiConfigured ? computeUptimePct(histories.api) : null}
            loading={cardLoading}
          />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 xl:grid-cols-[1fr_minmax(280px,360px)]">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-sky-400/80" aria-hidden />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Latency trend</h3>
            </div>
            <HealthLatencyChart histories={histories} includeApi={apiConfigured} height={300} />
            <p className="text-[11px] text-slate-600">
              Degraded if latency &gt; 600ms. Failed requests count as down. History keeps the last 20 checks per service.
            </p>
          </div>
          <ActivityFeed events={events} />
        </div>

        <div className="mt-10 space-y-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <ScrollText className="h-4 w-4 text-sky-400/80" aria-hidden />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Infrastructure logs</h3>
            </div>
            {events.length === 0 ? (
              <p className="text-[11px] text-slate-500">Waiting for next health check…</p>
            ) : null}
          </div>
          <InteractiveLogsTable logs={healthLogs} embedded title="Infrastructure logs" />
        </div>
      </div>
    </div>
  )
}
