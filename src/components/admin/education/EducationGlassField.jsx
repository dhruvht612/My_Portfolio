import { forwardRef, useId, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const EducationGlassField = forwardRef(function EducationGlassField(
  { label, error, hint, as = 'input', className = '', ...props },
  ref,
) {
  const id = useId()
  const [focused, setFocused] = useState(false)
  const hasValue = props.value != null && String(props.value).length > 0

  const shared = {
    id,
    ref,
    onFocus: (e) => {
      setFocused(true)
      props.onFocus?.(e)
    },
    onBlur: (e) => {
      setFocused(false)
      props.onBlur?.(e)
    },
    className: `edu-glass-input peer w-full rounded-xl px-3.5 pb-2.5 pt-5 text-sm text-slate-100 placeholder-transparent ${className}`,
    placeholder: ' ',
    ...props,
  }

  return (
    <motion.div className="relative">
      <div
        className={`edu-glass-field-wrap rounded-xl transition-shadow duration-300 ${
          focused ? 'edu-glass-field-focus' : ''
        } ${error ? 'edu-glass-field-error' : ''}`}
      >
        {as === 'textarea' ? <textarea rows={props.rows || 3} {...shared} /> : <input {...shared} />}
        <label
          htmlFor={id}
          className={`edu-floating-label pointer-events-none absolute left-3.5 transition-all duration-200 ${
            focused || hasValue ? 'edu-floating-label-up' : 'top-3 text-sm text-slate-500'
          }`}
        >
          {label}
        </label>
        {focused ? (
          <motion.div layoutId={`edu-glow-${id}`} className="edu-field-glow" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
        ) : null}
      </div>
      <AnimatePresence>
        {error ? (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-1 text-xs text-red-300"
            role="alert"
          >
            {error}
          </motion.p>
        ) : hint ? (
          <p className="mt-1 text-[11px] text-slate-500">{hint}</p>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
})

export default EducationGlassField
