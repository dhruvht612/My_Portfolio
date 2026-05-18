import { Fragment } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

export default function EducationStepper({ steps, current, onJump, fieldErrors = {} }) {
  return (
    <nav aria-label="Education form steps" className="edu-stepper w-fit max-w-full overflow-hidden">
      <ol className="edu-stepper-list">
        {steps.map((step, index) => {
          const active = index === current
          const done = index < current
          const hasErr = step.fieldKeys?.some((k) => fieldErrors[k])
          const isLast = index === steps.length - 1
          const connectorFilled = current > index

          return (
            <Fragment key={step.id}>
              <li className="shrink-0">
                <button
                  type="button"
                  onClick={() => (done || active) && onJump(index)}
                  disabled={index > current}
                  className={`edu-stepper-btn group text-left ${active ? 'edu-stepper-btn-active' : ''} ${done ? 'edu-stepper-btn-done' : ''}`}
                >
                  <span className="edu-stepper-node flex items-center gap-2">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-xs font-bold transition-all ${
                        active
                          ? 'border-sky-400/50 bg-sky-400/20 text-sky-100 shadow-[0_0_24px_rgba(56,189,248,0.25)]'
                          : done
                            ? 'border-emerald-400/40 bg-emerald-400/15 text-emerald-200'
                            : hasErr
                              ? 'border-amber-400/40 bg-amber-400/10 text-amber-200'
                              : 'border-white/10 bg-white/[0.03] text-slate-500'
                      }`}
                    >
                      {done ? <Check className="h-4 w-4" /> : index + 1}
                    </span>
                    <span className="min-w-0 max-w-[11rem] sm:max-w-[13rem]">
                      <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        {step.eyebrow || `Phase ${index + 1}`}
                      </span>
                      <span className="mt-0.5 block truncate text-xs font-medium text-slate-200 group-hover:text-white">
                        {step.label}
                      </span>
                    </span>
                  </span>
                </button>
              </li>
              {!isLast ? (
                <li className="edu-stepper-connector-wrap" aria-hidden>
                  <div className="edu-stepper-connector">
                    <motion.div
                      className="edu-stepper-connector-fill"
                      initial={false}
                      animate={{ scaleX: connectorFilled ? 1 : 0 }}
                      transition={{ type: 'spring', stiffness: 120, damping: 22 }}
                    />
                  </div>
                </li>
              ) : null}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
