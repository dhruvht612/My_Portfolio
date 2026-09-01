import { motion as Motion } from 'framer-motion'
import { AlertTriangle, ArrowRight, Check, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import AdminModal from '../AdminModal'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { CICD_COPY } from '../../../constants/cicdStrings'

/**
 * Rollback confirmation.
 *
 * Deliberately high-friction: the target versions are spelled out, a reason is
 * mandatory, and the confirm button stays disabled until one is typed. Nothing
 * is dispatched on open — the destructive call only happens on confirm, and
 * once it starts the dialog becomes a progress view that cannot be dismissed
 * mid-flight.
 *
 * The caller must key this component by deployment id. That remounts it per
 * target, which is what guarantees a reason typed for one rollback can never
 * be submitted against another.
 */
export default function CicdRollbackDialog({ open, deployment, previousVersion, onClose, onConfirm }) {
  const reduced = useReducedMotion()
  const [reason, setReason] = useState('')
  const [phase, setPhase] = useState('form') // form | running | done
  const [step, setStep] = useState(0)
  const [touched, setTouched] = useState(false)
  const timers = useRef([])

  useEffect(() => () => timers.current.forEach(window.clearTimeout), [])

  if (!deployment) return null

  const steps = CICD_COPY.rollback.steps
  const valid = reason.trim().length > 0

  const start = () => {
    setTouched(true)
    if (!valid) return

    setPhase('running')
    setStep(0)

    // Walk the progress steps, then hand off to the caller.
    timers.current = steps.map((_, i) =>
      window.setTimeout(() => {
        setStep(i + 1)
        if (i === steps.length - 1) {
          setPhase('done')
          onConfirm?.({ deployment, toVersion: previousVersion, reason: reason.trim() })
        }
      }, (i + 1) * 850),
    )
  }

  const dismissable = phase !== 'running'

  return (
    <AdminModal
      open={open}
      onClose={dismissable ? onClose : () => {}}
      closeOnBackdrop={dismissable}
      size="md"
      title={CICD_COPY.rollback.title}
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="flex items-start gap-3 rounded-xl border border-amber-400/25 bg-amber-500/[0.06] px-3.5 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden />
            <p className="text-[13px] leading-relaxed text-amber-100">
              <span className="font-semibold capitalize">{deployment.environment}</span> {CICD_COPY.rollback.lead}{' '}
              <span className="font-mono font-semibold">{deployment.version}</span> {CICD_COPY.rollback.to}{' '}
              <span className="font-mono font-semibold">{previousVersion}</span>.
            </p>
          </div>

          {/* Version transition */}
          <div className="mt-4 flex items-center justify-center gap-4 rounded-xl border border-white/[0.07] bg-white/[0.015] px-4 py-3.5">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Current</p>
              <p className="mt-1 font-mono text-sm font-bold text-slate-200 line-through decoration-rose-400/60">{deployment.version}</p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-600" aria-hidden />
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Target</p>
              <p className="mt-1 font-mono text-sm font-bold text-emerald-300">{previousVersion}</p>
            </div>
          </div>

          {phase === 'form' ? (
            <div className="mt-4">
              <label htmlFor="rollback-reason" className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                {CICD_COPY.rollback.reason}
              </label>
              <textarea
                id="rollback-reason"
                rows={3}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                onBlur={() => setTouched(true)}
                placeholder={CICD_COPY.rollback.reasonPlaceholder}
                aria-invalid={touched && !valid}
                aria-describedby={touched && !valid ? 'rollback-reason-error' : undefined}
                className={`admin-field-input mt-1.5 w-full resize-none rounded-xl border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 ${
                  touched && !valid ? 'border-rose-400/50' : 'border-white/[0.10]'
                }`}
              />
              {touched && !valid ? (
                <p id="rollback-reason-error" role="alert" className="mt-1.5 text-[11px] text-rose-300">
                  {CICD_COPY.rollback.reasonRequired}
                </p>
              ) : (
                <p className="mt-1.5 text-[11px] text-slate-600">Recorded on the deployment audit trail.</p>
              )}
            </div>
          ) : (
            <ol className="mt-4 space-y-2">
              {steps.map((label, i) => {
                const complete = step > i
                const active = step === i
                return (
                  <li key={label} className="flex items-center gap-2.5">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        complete
                          ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300'
                          : active
                            ? 'border-sky-400/40 bg-sky-500/15 text-sky-300'
                            : 'border-white/[0.10] bg-white/[0.03] text-slate-600'
                      }`}
                    >
                      {complete ? (
                        <Check className="h-3 w-3" aria-hidden />
                      ) : active ? (
                        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                      ) : (
                        <span className="h-1 w-1 rounded-full bg-current" aria-hidden />
                      )}
                    </span>
                    <span className={`text-[13px] ${complete ? 'text-slate-300' : active ? 'text-sky-200' : 'text-slate-600'}`}>{label}</span>
                  </li>
                )
              })}
            </ol>
          )}

          {phase === 'done' ? (
            <Motion.p
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              role="status"
              className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-500/[0.07] px-3.5 py-2.5 text-[13px] font-semibold text-emerald-200"
            >
              <Check className="h-4 w-4" aria-hidden />
              {CICD_COPY.rollback.done} — {previousVersion} is live
            </Motion.p>
          ) : null}
        </div>

        <div className="mt-4 flex justify-end gap-2.5 border-t border-white/[0.07] pt-3.5">
          {phase === 'done' ? (
            <button type="button" onClick={onClose} className="theme-btn theme-btn-primary px-4 py-2 text-sm">
              {CICD_COPY.newDeployment.close}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={phase === 'running'}
                className="theme-btn theme-btn-secondary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {CICD_COPY.rollback.cancel}
              </button>
              <button
                type="button"
                onClick={start}
                disabled={phase === 'running' || (touched && !valid)}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/20 px-4 py-2 text-sm font-bold text-amber-100 transition-colors duration-200 hover:bg-amber-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {phase === 'running' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <AlertTriangle className="h-4 w-4" aria-hidden />}
                {phase === 'running' ? CICD_COPY.rollback.running : CICD_COPY.rollback.confirm}
              </button>
            </>
          )}
        </div>
      </div>
    </AdminModal>
  )
}
