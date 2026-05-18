import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import { GraduationCap, SlidersHorizontal } from 'lucide-react'
import ArrayInput from '../ArrayInput'
import { useToast } from '../../../hooks/useToast'
import { educationSchema } from '../../../schemas/education.schema'
import EducationAmbient from './EducationAmbient'
import EducationAchievementStats from './EducationAchievementStats'
import EducationAIInsights from './EducationAIInsights'
import EducationFocusViz from './EducationFocusViz'
import EducationGlassField from './EducationGlassField'
import EducationHeroPanel from './EducationHeroPanel'
import EducationHighlightsEditor from './EducationHighlightsEditor'
import EducationLogoUpload from './EducationLogoUpload'
import EducationMetrics from './EducationMetrics'
import EducationProgressRing from './EducationProgressRing'
import EducationStepper from './EducationStepper'
import EducationStickyFooter from './EducationStickyFooter'
import EducationTimeline from './EducationTimeline'

const STEPS = [
  {
    id: 'identity',
    label: 'Identity & progress',
    eyebrow: 'Foundation',
    fieldKeys: ['institution', 'degree', 'logo_url', 'progress_percent', 'is_active'],
  },
  {
    id: 'focus',
    label: 'Focus & highlights',
    eyebrow: 'Narrative',
    fieldKeys: ['focus_areas', 'highlights'],
  },
]

export default function EducationWorkspace({ defaultValues, disabled, onSubmit }) {
  const toast = useToast()
  const [step, setStep] = useState(0)
  const [saveState, setSaveState] = useState('idle')

  const methods = useForm({
    resolver: zodResolver(educationSchema),
    defaultValues,
    mode: 'onChange',
  })

  const {
    register,
    control,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting, isDirty },
  } = methods

  const values = useWatch({ control }) || defaultValues
  const lastStep = step === STEPS.length - 1

  useEffect(() => {
    if (isDirty) setSaveState('dirty')
  }, [isDirty, values])

  const submit = useCallback(
    async (vals) => {
      try {
        await onSubmit({
          ...vals,
          focus_areas: (vals.focus_areas || []).filter(Boolean),
        })
        setSaveState('saved')
        setTimeout(() => setSaveState('idle'), 2400)
      } catch (e) {
        toast.error(e.message || 'Save failed')
        setSaveState('dirty')
      }
    },
    [onSubmit, toast],
  )

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && lastStep) {
        e.preventDefault()
        void handleSubmit(submit)()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleSubmit, submit, lastStep])

  const fieldErrors = useMemo(() => {
    const map = {}
    for (const k of Object.keys(errors)) map[k] = errors[k]
    return map
  }, [errors])

  const goNext = () =>
    void handleSubmit(async (vals) => {
      const keys = STEPS[step].fieldKeys
      const ok = await trigger(keys)
      if (!ok) return
      if (!lastStep) {
        setStep((s) => s + 1)
        return
      }
      await submit(vals)
    })()

  return (
    <EducationAmbient className="edu-workspace min-h-[min(88vh,920px)] border border-white/[0.06] p-3 md:p-4">
      <div className="space-y-4">
        <EducationHeroPanel values={values} />
        <EducationMetrics values={values} />

        <div className="flex justify-start overflow-hidden">
          <EducationStepper steps={STEPS} current={step} onJump={setStep} fieldErrors={fieldErrors} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
          <div className="min-w-0 space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={STEPS[step].id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                className="space-y-4"
              >
                {step === 0 ? (
                  <>
                    <section className="edu-glass-card overflow-hidden p-0">
                      <div className="edu-identity-banner relative px-4 py-5 md:px-5">
                        <div className="relative z-[1] grid gap-4 md:grid-cols-[auto_1fr] md:items-start">
                          <Controller
                            name="logo_url"
                            control={control}
                            render={({ field }) => (
                              <EducationLogoUpload
                                value={field.value}
                                onChange={field.onChange}
                                onError={(m) => toast.error(m)}
                                disabled={disabled}
                              />
                            )}
                          />
                          <div className="grid gap-3 sm:grid-cols-2">
                            <EducationGlassField
                              label="Institution"
                              {...register('institution')}
                              error={errors.institution?.message}
                            />
                            <EducationGlassField
                              label="Degree"
                              {...register('degree')}
                              error={errors.degree?.message}
                            />
                            <label className="edu-enrollment-toggle sm:col-span-2">
                              <input type="checkbox" {...register('is_active')} disabled={disabled} className="peer sr-only" />
                              <span className="edu-toggle-track" />
                              <span className="text-sm text-slate-300">
                                <GraduationCap className="mr-1.5 inline h-4 w-4 text-sky-400" />
                                Currently enrolled
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="edu-glass-card p-4 md:p-5">
                      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-300/90">Progression</p>
                          <h3 className="text-sm font-semibold text-slate-100">Degree completion</h3>
                        </div>
                        <EducationProgressRing percent={values.progress_percent} isActive={values.is_active} />
                      </header>
                      <Controller
                        name="progress_percent"
                        control={control}
                        render={({ field }) => (
                          <motion.div className="space-y-3">
                            <div className="flex items-center justify-between text-xs text-slate-400">
                              <span className="inline-flex items-center gap-1">
                                <SlidersHorizontal className="h-3.5 w-3.5" />
                                Adjust trajectory
                              </span>
                              <span className="font-semibold tabular-nums text-sky-300">{field.value ?? 0}%</span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              disabled={disabled}
                              value={field.value ?? 0}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              className="edu-progress-slider w-full"
                            />
                            <div className="edu-semester-track">
                              {['Y1', 'Y2', 'Y3', 'Y4'].map((y, i) => {
                                const threshold = (i + 1) * 25
                                const lit = (field.value ?? 0) >= threshold - 8
                                return (
                                  <span key={y} className={`edu-semester-pip ${lit ? 'edu-semester-pip-lit' : ''}`}>
                                    {y}
                                  </span>
                                )
                              })}
                            </div>
                          </motion.div>
                        )}
                      />
                    </section>
                  </>
                ) : (
                  <>
                    <section className="edu-glass-card p-4">
                      <header className="mb-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300/90">Curriculum</p>
                        <h3 className="text-sm font-semibold text-slate-100">Custom focus areas</h3>
                      </header>
                      <Controller
                        name="focus_areas"
                        control={control}
                        render={({ field }) => (
                          <ArrayInput
                            value={field.value || []}
                            onChange={field.onChange}
                            itemLabel="Focus area"
                            disabled={disabled}
                          />
                        )}
                      />
                      <div className="mt-4">
                        <Controller
                          name="focus_areas"
                          control={control}
                          render={({ field }) => (
                            <EducationFocusViz
                              focusAreas={field.value || []}
                              onToggle={(next) => field.onChange(next)}
                            />
                          )}
                        />
                      </div>
                    </section>

                    <section className="edu-glass-card p-4">
                      <header className="mb-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/90">Showcase</p>
                        <h3 className="text-sm font-semibold text-slate-100">Highlight cards</h3>
                      </header>
                      <Controller
                        name="highlights"
                        control={control}
                        render={({ field }) => (
                          <EducationHighlightsEditor
                            value={field.value}
                            onChange={field.onChange}
                            disabled={disabled}
                            errors={errors.highlights}
                          />
                        )}
                      />
                    </section>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <aside className="space-y-3 lg:sticky lg:top-4 lg:self-start">
            <EducationAIInsights values={values} />
            <EducationTimeline values={values} />
            <EducationAchievementStats values={values} />
          </aside>
        </div>

        <EducationStickyFooter
          currentStep={step}
          totalSteps={STEPS.length}
          isLast={lastStep}
          isFirst={step === 0}
          isSubmitting={isSubmitting}
          disabled={disabled}
          saveState={saveState}
          onBack={() => setStep((s) => Math.max(0, s - 1))}
          onNext={goNext}
        />
      </div>
    </EducationAmbient>
  )
}
