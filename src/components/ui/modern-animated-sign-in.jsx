'use client'

import { memo, useState, useRef, useEffect, forwardRef } from 'react'
import { motion, useAnimation, useInView, useMotionTemplate, useMotionValue } from 'motion/react'
import { Eye, EyeOff, Mail, User, MessageSquare, Code2, Database, Globe, Cpu, Braces, Layers3 } from 'lucide-react'
import { cn } from '../../lib/utils'

const Input = memo(
  forwardRef(function Input({ className, type, icon: Icon, label, ...props }, ref) {
    const radius = 100
    const [visible, setVisible] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    function handleMouseMove({ currentTarget, clientX, clientY }) {
      const { left, top } = currentTarget.getBoundingClientRect()
      mouseX.set(clientX - left)
      mouseY.set(clientY - top)
    }

    const actualType = type === 'password' ? (showPassword ? 'text' : 'password') : type
    /** Outer chrome; value is typed in the inner area below the label strip (no overlap). */
    const fieldChrome =
      'overflow-hidden rounded-md border border-slate-200/80 bg-white/95 shadow-sm transition duration-300 focus-within:ring-2 focus-within:ring-sky-500/45'

    const valueClasses =
      'w-full border-0 bg-transparent px-3 text-sm text-slate-900 caret-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0'

    return (
      <motion.div
        style={{
          background: useMotionTemplate`
            radial-gradient(
              ${visible ? `${radius}px` : '0px'} circle at ${mouseX}px ${mouseY}px,
              rgba(60,162,250,0.85),
              transparent 80%
            )
          `,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="group/input rounded-lg p-[2px] transition duration-300"
      >
        <div className={cn('relative', fieldChrome)}>
          <div className="flex items-center gap-2 border-b border-slate-200/70 bg-slate-50/95 px-3 py-2">
            {Icon && <Icon size={16} className="shrink-0 text-slate-500" aria-hidden />}
            {label}
          </div>
          {type === 'textarea' ? (
            <textarea
              className={cn(`${valueClasses} min-h-[132px] resize-y py-3`, className)}
              ref={ref}
              {...props}
            />
          ) : (
            <div className="relative">
              <input
                type={actualType}
                className={cn(`${valueClasses} h-11 py-2`, type === 'password' ? 'pr-11' : '', className)}
                ref={ref}
                {...props}
              />
              {type === 'password' && (
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute inset-y-0 right-2 flex items-center text-slate-500 hover:text-slate-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    )
  })
)

Input.displayName = 'Input'

const BoxReveal = memo(function BoxReveal({
  children,
  width = 'fit-content',
  boxColor = 'rgba(60,162,250,0.9)',
  duration = 0.4,
  overflow = 'hidden',
  className,
}) {
  const mainControls = useAnimation()
  const slideControls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      slideControls.start('visible')
      mainControls.start('visible')
    }
  }, [isInView, mainControls, slideControls])

  return (
    <section ref={ref} style={{ position: 'relative', width, overflow }} className={className}>
      <motion.div
        variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }}
        initial="hidden"
        animate={mainControls}
        transition={{ duration, delay: 0.2 }}
      >
        {children}
      </motion.div>
      <motion.div
        variants={{ hidden: { left: 0 }, visible: { left: '100%' } }}
        initial="hidden"
        animate={slideControls}
        transition={{ duration, ease: 'easeIn' }}
        style={{ position: 'absolute', top: 2, bottom: 2, left: 0, right: 0, zIndex: 20, background: boxColor, borderRadius: 4 }}
      />
    </section>
  )
})

const BottomGradient = () => (
  <>
    <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
    <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
  </>
)

const iconMap = {
  name: User,
  email: Mail,
  message: MessageSquare,
}

export const AnimatedForm = memo(function AnimatedForm({
  header,
  subHeader,
  fields,
  submitButton,
  onSubmit,
  isSubmitting = false,
  isSuccess = false,
  submitDisabled = false,
  serverError,
  successMessage,
}) {
  const [errors, setErrors] = useState({})

  const validateForm = (event) => {
    const nextErrors = {}
    fields.forEach((field) => {
      const value = event.target[field.name]?.value
      if (field.required && !value) nextErrors[field.name] = `${field.label} is required`
      if (field.type === 'email' && value && !/\S+@\S+\.\S+/.test(value)) nextErrors[field.name] = 'Invalid email address'
    })
    return nextErrors
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validateForm(event)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) onSubmit(event)
  }

  return (
    <section className="max-md:w-full flex flex-col gap-4 w-full mx-auto">
      <BoxReveal boxColor="rgba(125,211,252,0.85)">
        <h2 className="font-bold text-3xl text-[var(--color-text)]">{header}</h2>
      </BoxReveal>

      {subHeader && (
        <BoxReveal boxColor="rgba(65,105,225,0.8)" className="pb-2">
          <p className="text-[var(--color-text-muted)] text-sm max-w-sm">{subHeader}</p>
        </BoxReveal>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <section key={field.name} className="flex flex-col gap-2">
            <BoxReveal width="100%" boxColor="rgba(60,162,250,0.45)" className="space-y-1">
              <div className="relative">
                <Input
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  placeholder={field.placeholder ?? ''}
                  icon={iconMap[field.name]}
                  required={field.required}
                  label={
                    <label htmlFor={field.name} className="min-w-0 text-xs font-semibold uppercase tracking-wide text-slate-700">
                      {field.label}
                      {field.required && <span className="text-red-500"> *</span>}
                    </label>
                  }
                />
              </div>
              <section className="h-4">
                {errors[field.name] && <p className="text-red-500 text-xs">{errors[field.name]}</p>}
              </section>
            </BoxReveal>
          </section>
        ))}

        {serverError && <div className="text-red-400 text-sm">{serverError}</div>}
        {isSuccess && successMessage && <p className="text-emerald-400 text-sm">{successMessage}</p>}

        <BoxReveal width="100%" boxColor="rgba(249,115,22,0.7)" overflow="visible">
          <button
            className="bg-gradient-to-br relative group/btn from-zinc-200 to-zinc-200 dark:from-zinc-900 dark:to-zinc-900 block w-full text-black dark:text-white rounded-md h-11 font-medium outline-hidden"
            type="submit"
            disabled={isSubmitting || isSuccess || submitDisabled}
          >
            {isSubmitting ? 'Sending...' : isSuccess ? 'Message Sent' : `${submitButton} →`}
            <BottomGradient />
          </button>
        </BoxReveal>
      </form>
    </section>
  )
})

export const Ripple = memo(function Ripple({
  mainCircleSize = 120,
  mainCircleOpacity = 0.2,
  numCircles = 8,
  className = '',
}) {
  return (
    <section
      className={cn(
        'absolute inset-0 flex items-center justify-center [mask-image:linear-gradient(to_bottom,black,transparent)]',
        className
      )}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 48
        const opacity = Math.max(mainCircleOpacity - i * 0.02, 0.03)
        return (
          <span
            key={i}
            className="absolute animate-ripple rounded-full border border-[var(--color-accent)]/20"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              opacity,
              animationDelay: `${i * 0.08}s`,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        )
      })}
    </section>
  )
})

export const OrbitingCircles = memo(function OrbitingCircles({
  className,
  children,
  reverse = false,
  duration = 20,
  delay = 0,
  radius = 80,
}) {
  return (
    <section
      style={{ '--duration': duration, '--radius': radius, '--delay': -delay }}
      className={cn(
        'absolute flex size-full transform-gpu animate-orbit items-center justify-center rounded-full [animation-delay:calc(var(--delay)*1000ms)]',
        reverse && '[animation-direction:reverse]',
        className
      )}
    >
      {children}
    </section>
  )
})

export const ContactTechOrbit = memo(function ContactTechOrbit() {
  const orbitIcons = [
    { icon: <Code2 size={20} />, radius: 150, delay: 0, className: 'text-[#f97316]' },
    { icon: <Braces size={20} />, radius: 150, delay: 10, className: 'text-[#7dd3fc]' },
    { icon: <Database size={22} />, radius: 190, delay: 18, className: 'text-[#38bdf8]' },
    { icon: <Layers3 size={22} />, radius: 190, delay: 30, className: 'text-[#94a3b8]' },
    { icon: <Cpu size={24} />, radius: 230, delay: 8, className: 'text-[#4169e1]' },
    { icon: <Globe size={22} />, radius: 230, delay: 22, className: 'text-[#7dd3fc]' },
  ]

  return (
    <section className="relative h-full w-full flex items-center justify-center overflow-hidden rounded-2xl bg-[var(--color-bg)]/30 border border-[var(--color-border)]">
      <Ripple />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
        <span className="px-6 py-3 rounded-2xl bg-[rgba(10,14,23,0.72)] border border-[var(--color-border)]/70 whitespace-pre-wrap text-center text-5xl font-semibold leading-none text-transparent bg-clip-text bg-gradient-to-b from-[var(--color-text)] to-[var(--color-text-muted)] opacity-95 drop-shadow-[0_2px_20px_rgba(10,14,23,0.9)]">
          Contact
        </span>
      </div>
      <div className="absolute inset-0 z-20 bg-[radial-gradient(circle_at_center,rgba(10,14,23,0.82)_0px,rgba(10,14,23,0.82)_120px,rgba(10,14,23,0.35)_160px,transparent_230px)] pointer-events-none" />
      {orbitIcons.map((item, index) => (
        <OrbitingCircles
          key={index}
          radius={item.radius}
          delay={item.delay}
          duration={20}
          reverse={index % 2 === 1}
          className="pointer-events-none"
        >
          <span className={cn('size-10 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)]/65 flex items-center justify-center shadow-lg opacity-90', item.className)}>
            {item.icon}
          </span>
        </OrbitingCircles>
      ))}
    </section>
  )
})

export default AnimatedForm

