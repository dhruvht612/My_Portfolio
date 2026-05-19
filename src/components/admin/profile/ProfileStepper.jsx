import { Fragment } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

export default function ProfileStepper({ steps, current, onJump, fieldErrors = {} }) {
  return (
    <nav aria-label="Profile identity workflow" className="idf-stepper w-fit max-w-full overflow-x-auto">
      <ol className="idf-stepper-list">
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
                  className={`idf-stepper-btn group text-left ${active ? 'idf-stepper-btn-active' : ''} ${done ? 'idf-stepper-btn-done' : ''}`}
                >
                  <span className="flex items-center gap-2">
                    <motion.span
                      animate={active ? { boxShadow: ['0 0 16px rgba(167,139,250,0.2)', '0 0 28px rgba(167,139,250,0.35)', '0 0 16px rgba(167,139,250,0.2)'] } : {}}
                      transition={{ duration: 2.2, repeat: active ? Infinity : 0 }}
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-xs font-bold transition-all ${
                        active
                          ? 'border-violet-400/50 bg-violet-400/20 text-violet-100'
                          : done
                            ? 'border-emerald-400/40 bg-emerald-400/15 text-emerald-200'
                            : hasErr
                              ? 'border-amber-400/40 bg-amber-400/10 text-amber-200'
                              : 'border-white/10 bg-white/[0.03] text-slate-500'
                      }`}
                    >
                      {done ? <Check className="h-4 w-4" /> : index + 1}
                    </motion.span>
                    <span className="min-w-0 max-w-[10rem] sm:max-w-[12rem]">
                      <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        {step.eyebrow || `Step ${index + 1}`}
                      </span>
                      <span className="mt-0.5 block truncate text-xs font-medium text-slate-200 group-hover:text-white">
                        {step.label}
                      </span>
                    </span>
                  </span>
                </button>
              </li>
              {!isLast ? (
                <li className="idf-stepper-connector-wrap" aria-hidden>
                  <motion.div className="idf-stepper-connector">
                    <motion.div
                      className="idf-stepper-connector-fill"
                      initial={false}
                      animate={{ scaleX: connectorFilled ? 1 : 0 }}
                      transition={{ type: 'spring', stiffness: 120, damping: 22 }}
                    />
                  </motion.div>
                </li>
              ) : null}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
