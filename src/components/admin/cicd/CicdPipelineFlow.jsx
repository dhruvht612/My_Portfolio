import { AnimatePresence, motion as Motion } from 'framer-motion'
import { ChevronRight, GitCommitHorizontal, ScrollText, Workflow } from 'lucide-react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { useStageProgress } from '../../../hooks/useCicdPipeline'
import { CICD_COPY } from '../../../constants/cicdStrings'
import { CicdPanel, CopyChip, Skeleton, StatusPill } from './CicdPrimitives'
import { formatDuration, statusToken } from './statusTokens'

/**
 * Section 2 — the active pipeline as a directed graph.
 *
 * Horizontal on desktop and vertical below `md`, which is the layout that keeps
 * seven stages legible on a phone without shrinking the type. Stage nodes are
 * real buttons in a single tab stop with arrow-key traversal, so the graph is
 * navigable without a mouse.
 */
export default function CicdPipelineFlow({ stages, currentRun, loading, onViewLogs }) {
  // `undefined` means "no explicit choice yet", which is distinct from `null`
  // (the reader closed the panel). Keeping them separate lets the default be
  // derived during render instead of synced from an effect.
  const [override, setOverride] = useState(undefined)
  const nodeRefs = useRef([])

  // Open whichever stage needs a human: running, else the first problem.
  const defaultId = useMemo(() => {
    if (!stages?.length) return null
    const attention = stages.find((s) => s.status === 'running') || stages.find((s) => s.status === 'failed' || s.status === 'warning')
    return attention?.id || null
  }, [stages])

  // A refresh can retire the stage the reader had open; fall back to the default.
  const selectedId = override !== undefined && stages?.some((s) => s.id === override) ? override : override === null ? null : defaultId

  const toggle = (id) => setOverride((prev) => (prev === id ? null : id))

  const onKeyDown = useCallback(
    (event, index) => {
      const last = (stages?.length || 1) - 1
      let next = null
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = Math.min(last, index + 1)
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = Math.max(0, index - 1)
      else if (event.key === 'Home') next = 0
      else if (event.key === 'End') next = last
      if (next == null) return
      event.preventDefault()
      nodeRefs.current[next]?.focus()
    },
    [stages],
  )

  const selected = stages?.find((s) => s.id === selectedId) || null

  return (
    <CicdPanel
      title={CICD_COPY.pipeline.title}
      subtitle={
        currentRun ? `Build #${currentRun.number} · ${currentRun.branch} · ${currentRun.commit}` : CICD_COPY.pipeline.selectHint
      }
      icon={Workflow}
      actions={
        currentRun ? (
          <span className="hidden items-center gap-2 text-[11px] text-slate-500 sm:inline-flex">
            <GitCommitHorizontal className="h-3.5 w-3.5 text-slate-600" aria-hidden />
            <span className="max-w-[22rem] truncate">{currentRun.commitMessage}</span>
          </span>
        ) : null
      }
    >
      {loading ? <FlowSkeleton /> : null}

      {!loading && stages?.length ? (
        <>
          <div
            role="list"
            aria-label="Pipeline stages"
            className="flex flex-col gap-0 md:flex-row md:items-stretch md:gap-0 md:overflow-x-auto md:pb-1"
          >
            {stages.map((stage, index) => (
              <div key={stage.id} role="listitem" className="flex min-w-0 flex-1 flex-col md:flex-row md:items-center">
                <StageNode
                  ref={(el) => {
                    nodeRefs.current[index] = el
                  }}
                  stage={stage}
                  index={index}
                  selected={stage.id === selectedId}
                  onSelect={() => toggle(stage.id)}
                  onKeyDown={(event) => onKeyDown(event, index)}
                />
                {index < stages.length - 1 ? <Connector nextStatus={stages[index + 1].status} /> : null}
              </div>
            ))}
          </div>

          <AnimatePresence initial={false} mode="wait">
            {selected ? (
              <StageDetail key={selected.id} stage={selected} onViewLogs={onViewLogs} />
            ) : (
              <Motion.p
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-4 border-t border-white/[0.06] pt-4 text-xs text-slate-600"
              >
                {CICD_COPY.pipeline.selectHint}
              </Motion.p>
            )}
          </AnimatePresence>
        </>
      ) : null}
    </CicdPanel>
  )
}

/* -------------------------------------------------------------- stage node */

const StageNode = function StageNodeInner({ stage, index, selected, onSelect, onKeyDown, ref }) {
  const reduced = useReducedMotion()
  const token = statusToken(stage.status)
  const Icon = token.icon
  const running = stage.status === 'running'
  const progress = useStageProgress(stage.progress ?? 0, { active: running, reduced })

  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      onKeyDown={onKeyDown}
      aria-expanded={selected}
      aria-label={`${stage.name} — ${token.label}${stage.summary ? `, ${stage.summary}` : ''}`}
      /* Nodes share the row rather than taking a fixed width: seven fixed
         cards overflow a 1280px laptop once the sidebar is accounted for.
         `min-w` keeps them readable, and the row still scrolls if it must. */
      className={`group relative w-full min-w-0 flex-1 overflow-hidden rounded-xl border px-3 py-2.5 text-left transition-[border-color,background-color,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 md:min-w-[7.25rem] ${
        selected
          ? `${token.border} ${token.bg} ${token.glow}`
          : 'border-white/[0.08] bg-white/[0.02] hover:-translate-y-px hover:border-white/[0.18] hover:bg-white/[0.04]'
      }`}
    >
      {running && !reduced ? (
        <Motion.span
          className="pointer-events-none absolute inset-0 rounded-xl bg-sky-400/[0.06]"
          animate={{ opacity: [0.35, 0.9, 0.35] }}
          transition={{ repeat: Infinity, duration: 2.1, ease: 'easeInOut' }}
          aria-hidden
        />
      ) : null}

      <span className="relative flex items-center gap-2">
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${token.border} ${token.bg} ${token.text}`}
        >
          <Icon className={`h-3 w-3 ${running ? 'animate-spin' : ''}`} aria-hidden />
        </span>
        <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-slate-100">{stage.name}</span>
        <span className="shrink-0 font-mono text-[10px] text-slate-500">{String(index + 1).padStart(2, '0')}</span>
      </span>

      <span className="relative mt-1.5 flex items-baseline justify-between gap-2">
        <span className="truncate text-[11px] text-slate-500">{stage.summary || token.label}</span>
        <span className="shrink-0 font-mono text-[11px] tabular-nums text-slate-400">{formatDuration(stage.durationSec)}</span>
      </span>

      {running ? (
        <span className="relative mt-2 block h-0.5 w-full overflow-hidden rounded-full bg-white/[0.08]" aria-hidden>
          <Motion.span
            className="block h-full rounded-full bg-sky-400"
            initial={false}
            animate={{ width: `${Math.round(progress * 100)}%` }}
            transition={reduced ? { duration: 0 } : { duration: 0.8, ease: 'easeOut' }}
          />
        </span>
      ) : null}
    </button>
  )
}

/* --------------------------------------------------------------- connector */

/** The arrow between two stages. Tinted by the stage it feeds into. */
function Connector({ nextStatus }) {
  const token = statusToken(nextStatus)
  return (
    <span className="flex shrink-0 items-center justify-center py-1 md:px-1 md:py-0" aria-hidden>
      {/* Vertical on mobile, horizontal from md up. */}
      <span className={`h-4 w-px md:hidden ${token.dot} opacity-25`} />
      <ChevronRight className={`hidden h-3.5 w-3.5 md:block ${token.text} opacity-40`} />
    </span>
  )
}

/* ------------------------------------------------------------ stage detail */

function StageDetail({ stage, onViewLogs }) {
  const reduced = useReducedMotion()
  const token = statusToken(stage.status)

  return (
    <Motion.div
      initial={reduced ? false : { opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
      transition={reduced ? { duration: 0 } : { duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden"
    >
      <div className="mt-4 rounded-xl border border-white/[0.07] bg-[rgba(2,6,16,0.55)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-semibold text-slate-100">{stage.name}</h3>
            <StatusPill status={stage.status} size="sm" />
            <span className="font-mono text-[11px] text-slate-500">{formatDuration(stage.durationSec)}</span>
          </div>
          <button
            type="button"
            onClick={() => onViewLogs?.(stage)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.10] bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 transition-colors duration-200 hover:border-sky-400/35 hover:bg-sky-500/[0.08] hover:text-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
          >
            <ScrollText className="h-3.5 w-3.5" aria-hidden />
            {CICD_COPY.pipeline.viewLogs}
          </button>
        </div>

        {stage.detail?.fields?.length ? (
          <dl className="mt-3.5 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
            {stage.detail.fields.map((field) => (
              <div key={field.label} className="min-w-0">
                <dt className="truncate text-[10px] uppercase tracking-[0.12em] text-slate-500">{field.label}</dt>
                <dd className="mt-0.5 truncate font-mono text-[12px] text-slate-200">
                  {field.copyable ? <CopyChip value={field.value} /> : field.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        {stage.detail?.notes?.length ? (
          <ul className="mt-3.5 space-y-1.5 border-t border-white/[0.06] pt-3">
            {stage.detail.notes.map((note) => (
              <li key={note} className="flex gap-2 text-[12px] leading-relaxed text-slate-400">
                <span className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${token.dot}`} aria-hidden />
                {note}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Motion.div>
  )
}

/* -------------------------------------------------------------- skeletons */

function FlowSkeleton() {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex flex-1 items-center gap-2">
          <Skeleton className="h-[4.4rem] w-full md:w-[9.5rem]" />
          {i < 6 ? <Skeleton className="hidden h-3.5 w-3.5 shrink-0 rounded-full md:block" /> : null}
        </div>
      ))}
    </div>
  )
}
