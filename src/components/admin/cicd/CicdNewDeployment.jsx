import { AlertTriangle, Check, ChevronLeft, ChevronRight, GitBranch, Loader2, Rocket } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import AdminModal from '../AdminModal'
import { CICD_COPY, ENVIRONMENT_FILTERS } from '../../../constants/cicdStrings'
import { statusToken } from './statusTokens'

/** Environments a deployment can target — `all` is a filter, not a destination. */
const TARGETS = ENVIRONMENT_FILTERS.filter((option) => option.value !== 'all')

/** The stages the simulated run walks through on the final step. */
const RUN_STAGES = ['Build', 'Unit Tests', 'Integration', 'Security', 'Deploy']

/**
 * Five-step deployment wizard.
 *
 * Each step is one decision, and the review step restates all of them before
 * anything is dispatched. Targeting production adds an explicit warning rather
 * than a second confirmation dialog — the review step already is one.
 *
 * The caller must key this component by its open state so each run starts from
 * step one rather than resuming a half-filled wizard from last time.
 */
export default function CicdNewDeployment({ open, projects, onClose, onDeploy }) {
  const [step, setStep] = useState(0)
  const [projectId, setProjectId] = useState(null)
  const [branch, setBranch] = useState(null)
  const [environment, setEnvironment] = useState(null)
  const [stageIndex, setStageIndex] = useState(-1)
  const timers = useRef([])

  useEffect(() => () => timers.current.forEach(window.clearTimeout), [])

  const project = projects?.find((p) => p.id === projectId) || null
  const commit = '8fa21c'

  const canAdvance = [Boolean(projectId), Boolean(branch), Boolean(environment), true, false][step]
  const running = step === 4 && stageIndex >= 0 && stageIndex < RUN_STAGES.length
  const complete = step === 4 && stageIndex >= RUN_STAGES.length

  const startDeployment = () => {
    setStep(4)
    setStageIndex(0)
    timers.current = RUN_STAGES.map((_, i) =>
      window.setTimeout(
        () => {
          setStageIndex(i + 1)
          if (i === RUN_STAGES.length - 1) {
            onDeploy?.({ projectId, branch, environment, commit })
          }
        },
        (i + 1) * 780,
      ),
    )
  }

  const dismissable = !running

  return (
    <AdminModal
      open={open}
      onClose={dismissable ? onClose : () => {}}
      closeOnBackdrop={dismissable}
      size="lg"
      title={CICD_COPY.newDeployment.title}
    >
      <div className="flex h-full min-h-0 flex-col">
        <Stepper step={step} />

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
          {step === 0 ? (
            <Choices
              legend={CICD_COPY.newDeployment.selectProject}
              options={projects?.map((p) => ({ value: p.id, label: p.name, hint: p.repository })) || []}
              value={projectId}
              onChange={(value) => {
                setProjectId(value)
                setBranch(null)
              }}
            />
          ) : null}

          {step === 1 ? (
            <Choices
              legend={CICD_COPY.newDeployment.selectBranch}
              options={(project?.branches || []).map((b) => ({
                value: b,
                label: b,
                hint: b === project?.defaultBranch ? 'default branch' : undefined,
                mono: true,
              }))}
              value={branch}
              onChange={setBranch}
              icon={GitBranch}
            />
          ) : null}

          {step === 2 ? (
            <Choices
              legend={CICD_COPY.newDeployment.selectEnvironment}
              options={TARGETS.map((t) => ({
                value: t.value,
                label: t.label,
                hint: t.value === 'production' ? 'serves live traffic' : undefined,
                danger: t.value === 'production',
              }))}
              value={environment}
              onChange={setEnvironment}
            />
          ) : null}

          {step === 3 ? (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{CICD_COPY.newDeployment.review}</p>
              <dl className="mt-3 divide-y divide-white/[0.05] rounded-xl border border-white/[0.08] bg-white/[0.015]">
                <Row label={CICD_COPY.newDeployment.project} value={project?.name} hint={project?.repository} />
                <Row label={CICD_COPY.newDeployment.branch} value={branch} mono />
                <Row label={CICD_COPY.newDeployment.environment} value={TARGETS.find((t) => t.value === environment)?.label} />
                <Row label={CICD_COPY.newDeployment.commit} value={commit} mono />
              </dl>

              {environment === 'production' ? (
                <p className="mt-3 flex items-start gap-2 rounded-xl border border-amber-400/25 bg-amber-500/[0.06] px-3.5 py-2.5 text-[12px] leading-relaxed text-amber-100">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  {CICD_COPY.newDeployment.productionWarning}
                </p>
              ) : null}
            </div>
          ) : null}

          {step === 4 ? (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {complete ? CICD_COPY.newDeployment.complete : CICD_COPY.newDeployment.deploying}
              </p>

              <ol className="mt-3 space-y-2">
                {RUN_STAGES.map((label, i) => {
                  const done = stageIndex > i
                  const active = stageIndex === i
                  const token = statusToken(done ? 'passed' : active ? 'running' : 'queued')
                  const Icon = token.icon
                  return (
                    <li
                      key={label}
                      className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 transition-colors duration-200 ${
                        active ? `${token.border} ${token.bg}` : 'border-white/[0.07] bg-white/[0.015]'
                      }`}
                    >
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${token.bg} ${token.text}`}>
                        <Icon className={`h-3 w-3 ${active ? 'animate-spin' : ''}`} aria-hidden />
                      </span>
                      <span className={`flex-1 text-[13px] ${done ? 'text-slate-300' : active ? 'text-sky-200' : 'text-slate-600'}`}>{label}</span>
                    </li>
                  )
                })}
              </ol>

              {complete ? (
                <p
                  role="status"
                  className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-500/[0.07] px-3.5 py-2.5 text-[13px] font-semibold text-emerald-200"
                >
                  <Check className="h-4 w-4" aria-hidden />
                  {commit} deployed to {environment}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/[0.07] pt-3.5">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || step === 4}
            className="theme-btn theme-btn-secondary px-3.5 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            {CICD_COPY.newDeployment.back}
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canAdvance}
              className="theme-btn theme-btn-primary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              {CICD_COPY.newDeployment.next}
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          ) : null}

          {step === 3 ? (
            <button type="button" onClick={startDeployment} className="theme-btn theme-btn-primary px-4 py-2 text-sm">
              <Rocket className="h-4 w-4" aria-hidden />
              {CICD_COPY.newDeployment.start}
            </button>
          ) : null}

          {step === 4 ? (
            <button
              type="button"
              onClick={onClose}
              disabled={running}
              className="theme-btn theme-btn-primary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              {running ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              {running ? CICD_COPY.newDeployment.deploying : CICD_COPY.newDeployment.close}
            </button>
          ) : null}
        </div>
      </div>
    </AdminModal>
  )
}

/* ------------------------------------------------------------------ pieces */

function Stepper({ step }) {
  return (
    <ol className="flex items-center gap-1.5" aria-label="Deployment steps">
      {CICD_COPY.newDeployment.steps.map((label, i) => {
        const done = i < step
        const active = i === step
        return (
          <li key={label} className="flex min-w-0 flex-1 items-center gap-1.5">
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors duration-200 ${
                done
                  ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30'
                  : active
                    ? 'bg-sky-500/20 text-sky-200 ring-1 ring-sky-400/40'
                    : 'bg-white/[0.04] text-slate-600'
              }`}
              aria-current={active ? 'step' : undefined}
            >
              {done ? <Check className="h-3 w-3" aria-hidden /> : i + 1}
            </span>
            <span className={`hidden truncate text-[11px] sm:block ${active ? 'text-slate-200' : 'text-slate-600'}`}>{label}</span>
            {i < CICD_COPY.newDeployment.steps.length - 1 ? (
              <span className={`h-px min-w-2 flex-1 ${done ? 'bg-emerald-400/30' : 'bg-white/[0.08]'}`} aria-hidden />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

/** Radio group rendered as selectable cards. */
function Choices({ legend, options, value, onChange, icon: Icon }) {
  return (
    <fieldset>
      <legend className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{legend}</legend>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const selected = value === option.value
          return (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-3 transition-colors duration-200 focus-within:ring-2 focus-within:ring-sky-400/50 ${
                selected
                  ? option.danger
                    ? 'border-amber-400/40 bg-amber-500/[0.08]'
                    : 'border-sky-400/40 bg-sky-500/[0.08]'
                  : 'border-white/[0.08] bg-white/[0.015] hover:border-white/[0.18]'
              }`}
            >
              <input
                type="radio"
                name={legend}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                  selected ? 'border-sky-400 bg-sky-400/20' : 'border-white/20'
                }`}
                aria-hidden
              >
                {selected ? <span className="h-1.5 w-1.5 rounded-full bg-sky-300" /> : null}
              </span>
              {Icon ? <Icon className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden /> : null}
              <span className="min-w-0 flex-1">
                <span className={`block truncate text-[13px] font-semibold text-slate-100 ${option.mono ? 'font-mono' : ''}`}>{option.label}</span>
                {option.hint ? <span className="mt-0.5 block truncate text-[11px] text-slate-500">{option.hint}</span> : null}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

function Row({ label, value, hint, mono }) {
  return (
    <div className="flex items-baseline justify-between gap-3 px-3.5 py-2.5">
      <dt className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{label}</dt>
      <dd className="min-w-0 text-right">
        <span className={`block truncate text-[13px] font-semibold text-slate-100 ${mono ? 'font-mono' : ''}`}>{value || '—'}</span>
        {hint ? <span className="block truncate text-[11px] text-slate-600">{hint}</span> : null}
      </dd>
    </div>
  )
}
