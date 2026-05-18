import { forwardRef, useId, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const AccountGlassField = forwardRef(function AccountGlassField(
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
    className: `acc-glass-input peer w-full rounded-xl px-3.5 pb-2.5 pt-5 text-sm text-slate-100 placeholder-transparent ${className}`,
    placeholder: ' ',
    ...props,
  }

  return (
    <motion.div className="relative" layout>
      <motion.div
        className={`acc-glass-field-wrap rounded-xl transition-shadow duration-300 ${
          focused ? 'acc-glass-field-focus' : ''
        } ${error ? 'acc-glass-field-error' : ''}`}
        whileHover={{ borderColor: 'rgba(129, 140, 248, 0.25)' }}
      >
        {as === 'textarea' ? <textarea rows={props.rows || 3} {...shared} /> : <input {...shared} />}
        <label
          htmlFor={id}
          className={`acc-floating-label pointer-events-none absolute left-3.5 transition-all duration-200 ${
            focused || hasValue ? 'acc-floating-label-up' : 'top-3 text-sm text-slate-500'
          }`}
        >
          {label}
        </label>
        {focused ? (
          <motion.div
            layoutId={`acc-glow-${id}`}
            className="acc-field-glow"
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          />
        ) : null}
      </motion.div>
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

export default AccountGlassField
