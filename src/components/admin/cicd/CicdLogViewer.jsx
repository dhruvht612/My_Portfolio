import { Check, ChevronDown, Copy, Maximize2, Minimize2, Radio, Search, Terminal, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useToast } from '../../../hooks/useToast'
import { CICD_COPY } from '../../../constants/cicdStrings'
import { EmptyNote } from './CicdPrimitives'
import { copyText, ERROR_LOG_LEVELS, formatLogTime, LOG_LEVEL } from './statusTokens'

/**
 * Section 10 — the raw transcript.
 *
 * Auto-follows the tail while streaming, but stops the moment the reader
 * scrolls up: yanking someone back to the bottom while they are reading an
 * error is the single most annoying thing a log pane can do. Scrolling back to
 * the bottom re-arms the follow.
 */
export default function CicdLogViewer({ logs, live, onToggleLive, focusStage, onClearFocus, ref }) {
  const toast = useToast()
  const [errorsOnly, setErrorsOnly] = useState(false)
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [following, setFollowing] = useState(true)

  const scrollRef = useRef(null)
  const copyTimer = useRef(0)

  useEffect(() => () => window.clearTimeout(copyTimer.current), [])

  // The stage filter and the text query compose rather than override each
  // other, so selecting a stage elsewhere on the page narrows whatever the
  // reader had typed instead of silently discarding it.
  const visible = useMemo(() => {
    let list = logs || []
    if (errorsOnly) list = list.filter((line) => ERROR_LOG_LEVELS.includes(line.level))
    if (focusStage?.id) list = list.filter((line) => line.stage === focusStage.id)
    const q = query.trim().toLowerCase()
    if (q) list = list.filter((line) => line.message.toLowerCase().includes(q) || line.level.toLowerCase().includes(q))
    return list
  }, [logs, errorsOnly, query, focusStage])

  // Follow the tail only while the reader is already at the bottom.
  useEffect(() => {
    if (!following) return
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [visible, following])

  const onScroll = (event) => {
    const el = event.currentTarget
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 32
    setFollowing(atBottom)
  }

  const onCopy = async () => {
    const text = visible.map((line) => `${formatLogTime(line.at)}  ${line.level.padEnd(4)}  ${line.message}`).join('\n')
    const ok = await copyText(text)
    if (!ok) {
      toast.error(CICD_COPY.toasts.copyFailed)
      return
    }
    setCopied(true)
    toast.success(CICD_COPY.toasts.copiedLogs)
    window.clearTimeout(copyTimer.current)
    copyTimer.current = window.setTimeout(() => setCopied(false), 1600)
  }

  const toggleBase =
    'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50'

  return (
    <section
      ref={ref}
      aria-label={CICD_COPY.logs.title}
      className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[rgba(4,7,14,0.78)] shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl"
    >
      <header className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <Terminal className="h-3.5 w-3.5 shrink-0 text-sky-300/80" aria-hidden />
          <h2 className="truncate text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-300">{CICD_COPY.logs.title}</h2>
          {focusStage ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-sky-400/25 bg-sky-500/[0.10] py-0.5 pl-1.5 pr-1 text-[10px] font-semibold text-sky-200">
              {focusStage.name}
              <button
                type="button"
                onClick={onClearFocus}
                aria-label={`Stop filtering logs to ${focusStage.name}`}
                className="rounded p-0.5 text-sky-300/70 transition-colors hover:bg-sky-400/20 hover:text-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
              >
                <X className="h-2.5 w-2.5" aria-hidden />
              </button>
            </span>
          ) : null}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleLive}
            aria-pressed={live}
            className={`${toggleBase} ${
              live
                ? 'border-emerald-400/30 bg-emerald-500/[0.10] text-emerald-200'
                : 'border-white/[0.10] bg-white/[0.02] text-slate-400 hover:border-white/[0.18] hover:text-slate-200'
            }`}
          >
            <Radio className={`h-3 w-3 ${live ? 'animate-pulse' : ''}`} aria-hidden />
            {CICD_COPY.logs.live}
          </button>

          <button
            type="button"
            onClick={() => setErrorsOnly((v) => !v)}
            aria-pressed={errorsOnly}
            className={`${toggleBase} ${
              errorsOnly
                ? 'border-amber-400/30 bg-amber-500/[0.10] text-amber-200'
                : 'border-white/[0.10] bg-white/[0.02] text-slate-400 hover:border-white/[0.18] hover:text-slate-200'
            }`}
          >
            {CICD_COPY.logs.errorsOnly}
          </button>

          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-500" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={CICD_COPY.logs.searchPlaceholder}
              aria-label={CICD_COPY.logs.search}
              className="admin-field-input w-[9rem] rounded-lg border border-white/[0.10] py-1.5 pl-7 pr-2 font-mono text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 sm:w-[12rem]"
            />
          </div>

          <button type="button" onClick={onCopy} className={`${toggleBase} border-white/[0.10] bg-white/[0.02] text-slate-400 hover:border-white/[0.18] hover:text-slate-200`}>
            {copied ? <Check className="h-3 w-3 text-emerald-400" aria-hidden /> : <Copy className="h-3 w-3" aria-hidden />}
            {copied ? CICD_COPY.logs.copied : CICD_COPY.logs.copy}
          </button>

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-label={expanded ? CICD_COPY.logs.collapse : CICD_COPY.logs.expand}
            className={`${toggleBase} border-white/[0.10] bg-white/[0.02] text-slate-400 hover:border-white/[0.18] hover:text-slate-200`}
          >
            {expanded ? <Minimize2 className="h-3 w-3" aria-hidden /> : <Maximize2 className="h-3 w-3" aria-hidden />}
          </button>
        </div>
      </header>

      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={onScroll}
          role="log"
          aria-live={live ? 'polite' : 'off'}
          aria-label={CICD_COPY.logs.title}
          tabIndex={0}
          className={`overflow-y-auto bg-[rgba(2,4,10,0.6)] px-3 py-2.5 font-mono text-[11.5px] leading-[1.75] transition-[height] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-400/40 ${
            expanded ? 'h-[32rem]' : 'h-[15rem]'
          }`}
        >
          {visible.length === 0 ? (
            <EmptyNote icon={X} title={CICD_COPY.logs.empty} hint="Clear the filter or turn off Errors only." />
          ) : (
            visible.map((line) => {
              const level = LOG_LEVEL[line.level] || LOG_LEVEL.DEBUG
              return (
                <div key={line.id} className="flex gap-3 rounded px-1 hover:bg-white/[0.03]">
                  <span className="shrink-0 select-none text-slate-600">{formatLogTime(line.at)}</span>
                  <span className={`w-9 shrink-0 rounded px-1 text-center text-[10px] font-bold ${level.bg} ${level.text}`}>{line.level}</span>
                  <span className="min-w-0 flex-1 whitespace-pre-wrap break-words text-slate-300">{line.message}</span>
                </div>
              )
            })
          )}
        </div>

        {/* Re-arm the tail after the reader has scrolled away from it. */}
        {live && !following ? (
          <button
            type="button"
            onClick={() => {
              setFollowing(true)
              const el = scrollRef.current
              if (el) el.scrollTop = el.scrollHeight
            }}
            className="absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-sky-400/30 bg-[rgba(6,12,24,0.95)] px-3 py-1.5 text-[11px] font-semibold text-sky-200 shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-colors hover:bg-sky-500/[0.15] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
          >
            <ChevronDown className="h-3 w-3" aria-hidden />
            Jump to latest
          </button>
        ) : null}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] px-4 py-2 text-[10px] text-slate-600">
        <span className="font-mono">
          {visible.length} / {logs?.length || 0} lines
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${live ? 'bg-emerald-400' : 'bg-slate-600'}`} aria-hidden />
          {live ? CICD_COPY.logs.streaming : CICD_COPY.logs.paused}
        </span>
      </footer>
    </section>
  )
}
