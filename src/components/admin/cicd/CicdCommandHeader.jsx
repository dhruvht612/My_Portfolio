import { motion as Motion } from 'framer-motion'
import { GitBranch, Plus, RefreshCw, Search, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { CICD_COPY, ENVIRONMENT_FILTERS } from '../../../constants/cicdStrings'
import { formatClock, healthToken } from './statusTokens'

/**
 * Page chrome: identity on the left, operational controls on the right, and a
 * single-line verdict underneath. The verdict answers "is everything healthy?"
 * before the reader has to parse anything else on the page.
 */
export default function CicdCommandHeader({
  level = 'healthy',
  checkedAt,
  refreshing,
  onRefresh,
  search,
  onSearchChange,
  environment,
  onEnvironmentChange,
  onNewDeployment,
}) {
  const searchRef = useRef(null)
  const token = healthToken(level)

  // `/` focuses search the way it does in most developer tooling, but never
  // while the user is already typing somewhere else.
  useEffect(() => {
    const onKey = (event) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || document.activeElement?.isContentEditable) return
      event.preventDefault()
      searchRef.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const verdict =
    level === 'critical' ? CICD_COPY.status.critical : level === 'degraded' ? CICD_COPY.status.degraded : CICD_COPY.status.allOperational

  return (
    <header className="relative overflow-hidden rounded-2xl border border-white/[0.09] bg-[rgba(6,10,18,0.66)] p-4 shadow-[0_16px_50px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-6">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_58%_60%_at_78%_-15%,rgba(56,189,248,0.13),transparent_58%)]"
        aria-hidden
      />

      <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-400/60">{CICD_COPY.page.eyebrow}</p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-50 md:text-3xl">{CICD_COPY.page.title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">{CICD_COPY.page.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          <div className="relative min-w-0 flex-1 sm:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden />
            <input
              ref={searchRef}
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={CICD_COPY.controls.searchPlaceholder}
              aria-label={CICD_COPY.controls.searchPlaceholder}
              className="admin-field-input w-full rounded-xl border border-white/[0.09] py-2 pl-9 pr-8 text-sm sm:w-[17rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
            />
            {search ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            ) : (
              <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-white/[0.10] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-slate-500 sm:block">
                /
              </kbd>
            )}
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.04] px-3 py-2 text-sm font-semibold text-slate-200 transition-colors duration-200 hover:border-sky-400/35 hover:bg-sky-500/[0.08] hover:text-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 disabled:cursor-not-allowed disabled:opacity-55"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden />
            <span className="hidden sm:inline">{refreshing ? CICD_COPY.controls.refreshing : CICD_COPY.controls.refresh}</span>
          </button>

          <label className="inline-flex items-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.04] pl-3 pr-1 text-sm text-slate-400 transition-colors duration-200 focus-within:border-sky-400/35 hover:border-white/[0.16]">
            <GitBranch className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
            <span className="sr-only">{CICD_COPY.controls.environment}</span>
            <select
              value={environment}
              onChange={(event) => onEnvironmentChange(event.target.value)}
              className="admin-field-input admin-field-input--ghost cursor-pointer border-none py-2 pr-1 text-sm font-semibold focus-visible:outline-none"
            >
              {ENVIRONMENT_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {CICD_COPY.controls.environment}: {option.label}
                </option>
              ))}
            </select>
          </label>

          <button type="button" onClick={onNewDeployment} className="theme-btn theme-btn-primary px-3.5 py-2 text-sm">
            <Plus className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">{CICD_COPY.controls.newDeployment}</span>
            <span className="sm:hidden">Deploy</span>
          </button>
        </div>
      </div>

      <div className="relative mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/[0.06] pt-4">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Motion.span
            className={`h-2 w-2 rounded-full ${token.dot}`}
            animate={{ opacity: [1, 0.45, 1] }}
            transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
            aria-hidden
          />
          {verdict}
        </span>
        <span className="text-xs text-slate-500">
          {CICD_COPY.controls.lastChecked}: <span className="font-mono text-slate-400">{formatClock(checkedAt)}</span>
        </span>
      </div>
    </header>
  )
}
