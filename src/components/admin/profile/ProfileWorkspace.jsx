import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, Link2, Tags, User } from 'lucide-react'
import ArrayInput from '../ArrayInput'
import ImageUploader from '../ImageUploader'
import { useToast } from '../../../hooks/useToast'
import { profileSchema } from '../../../schemas/profile.schema'
import ProfileAmbient from './ProfileAmbient'
import ProfileAIInsights from './ProfileAIInsights'
import ProfileCommandPalette from './ProfileCommandPalette'
import ProfileGlassField from './ProfileGlassField'
import ProfileHeroPanel from './ProfileHeroPanel'
import ProfileMetrics from './ProfileMetrics'
import ProfileObjectCards from './ProfileObjectCards'
import ProfilePreview from './ProfilePreview'
import ProfileRoleChips from './ProfileRoleChips'
import ProfileStepper from './ProfileStepper'
import ProfileStickyFooter from './ProfileStickyFooter'

const STEPS = [
  {
    id: 'foundation',
    label: 'Foundation',
    eyebrow: 'Step 1',
    fieldKeys: ['full_name', 'typed_roles'],
  },
  {
    id: 'narrative',
    label: 'Narrative',
    eyebrow: 'Step 2',
    fieldKeys: ['bio_story'],
  },
  {
    id: 'metadata',
    label: 'Metadata',
    eyebrow: 'Step 3',
    fieldKeys: ['interests', 'fun_facts'],
  },
  {
    id: 'links',
    label: 'Links & Assets',
    eyebrow: 'Step 4',
    fieldKeys: ['social_links', 'resume_url', 'footer_badges'],
  },
]

function formatSynced() {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date())
}

export default function ProfileWorkspace({ defaultValues, disabled, onSubmit }) {
  const toast = useToast()
  const [step, setStep] = useState(0)
  const [saveState, setSaveState] = useState('idle')
  const [indexing, setIndexing] = useState(false)
  const [lastSynced, setLastSynced] = useState(null)
  const [paletteOpen, setPaletteOpen] = useState(false)

  const methods = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues,
    mode: 'onChange',
  })

  const {
    register,
    control,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors, isSubmitting, isDirty },
  } = methods

  const values = useWatch({ control }) || defaultValues
  const lastStep = step === STEPS.length - 1

  useEffect(() => {
    if (isDirty) setSaveState('dirty')
  }, [isDirty, values])

  const submit = useCallback(
    async (vals) => {
      setIndexing(true)
      try {
        await onSubmit({
          ...vals,
          typed_roles: (vals.typed_roles || []).filter(Boolean),
          bio_story: (vals.bio_story || []).filter(Boolean),
          footer_badges: (vals.footer_badges || []).filter(Boolean),
        })
        setSaveState('saved')
        setLastSynced(formatSynced())
        setTimeout(() => setSaveState('idle'), 2400)
      } catch (e) {
        toast.error(e.message || 'Save failed')
        setSaveState('dirty')
      } finally {
        setTimeout(() => setIndexing(false), 600)
      }
    },
    [onSubmit, toast],
  )

  const draftSave = useCallback(() => {
    const vals = getValues()
    const parsed = profileSchema.safeParse({
      ...vals,
      typed_roles: (vals.typed_roles || []).filter(Boolean),
      bio_story: (vals.bio_story || []).filter(Boolean),
      footer_badges: (vals.footer_badges || []).filter(Boolean),
    })
    if (!parsed.success) {
      toast.error('Name and at least one role are required to save.')
      return
    }
    void submit(parsed.data)
  }, [getValues, submit, toast])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setPaletteOpen(true)
        return
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (lastStep) void handleSubmit(submit)()
        else draftSave()
        return
      }
      if (e.altKey && /^[1-4]$/.test(e.key)) {
        e.preventDefault()
        setStep(Number(e.key) - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleSubmit, submit, lastStep, draftSave])

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

  const scrollPreview = () => {
    document.getElementById('profile-live-preview')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  return (
    <ProfileAmbient className="idf-workspace min-h-[min(88vh,920px)] border border-white/[0.06] p-3 md:p-4">
      <ProfileCommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        steps={STEPS}
        current={step}
        onSelect={setStep}
      />
      <div className="space-y-4">
        <ProfileHeroPanel values={values} lastSynced={lastSynced} />

        <div className="flex justify-start overflow-x-auto pb-1">
          <ProfileStepper steps={STEPS} current={step} onJump={setStep} fieldErrors={fieldErrors} />
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
                  <section className="idf-glass-card p-4 md:p-5">
                    <header className="mb-4 flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/15">
                        <User className="h-4 w-4 text-violet-300" />
                      </span>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/90">Foundation</p>
                        <h3 className="text-sm font-semibold text-slate-100">Core identity</h3>
                      </div>
                    </header>
                    <div className="space-y-5">
                      <ProfileGlassField
                        label="Full name"
                        {...register('full_name')}
                        error={errors.full_name?.message}
                      />
                      <Controller
                        name="typed_roles"
                        control={control}
                        render={({ field }) => (
                          <div>
                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                              Typed roles (hero)
                            </p>
                            <ProfileRoleChips value={field.value} onChange={field.onChange} disabled={disabled} />
                            {errors.typed_roles?.message ? (
                              <p className="mt-1 text-xs text-red-300">{errors.typed_roles.message}</p>
                            ) : null}
                          </div>
                        )}
                      />
                    </div>
                  </section>
                ) : null}

                {step === 1 ? (
                  <section className="idf-glass-card p-4 md:p-5">
                    <header className="mb-4 flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/15">
                        <BookOpen className="h-4 w-4 text-cyan-300" />
                      </span>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300/90">Narrative</p>
                        <h3 className="text-sm font-semibold text-slate-100">Bio story</h3>
                      </div>
                    </header>
                    <Controller
                      name="bio_story"
                      control={control}
                      render={({ field }) => (
                        <ArrayInput
                          value={field.value || []}
                          onChange={field.onChange}
                          itemLabel="Paragraph"
                          multiline
                          disabled={disabled}
                        />
                      )}
                    />
                  </section>
                ) : null}

                {step === 2 ? (
                  <div className="space-y-4">
                    <section className="idf-glass-card p-4 md:p-5">
                      <Controller
                        name="interests"
                        control={control}
                        render={({ field }) => (
                          <ProfileObjectCards
                            value={field.value}
                            onChange={field.onChange}
                            disabled={disabled}
                            eyebrow="Metadata"
                            title="Interest cards"
                            fields={[
                              { name: 'icon', label: 'Icon class (e.g. fas fa-code)' },
                              { name: 'title', label: 'Title' },
                              { name: 'copy', label: 'Copy', type: 'textarea', full: true },
                            ]}
                          />
                        )}
                      />
                    </section>
                    <section className="idf-glass-card p-4 md:p-5">
                      <Controller
                        name="fun_facts"
                        control={control}
                        render={({ field }) => (
                          <ProfileObjectCards
                            value={field.value}
                            onChange={field.onChange}
                            disabled={disabled}
                            eyebrow="Personality"
                            title="Fun facts"
                            fields={[
                              { name: 'emoji', label: 'Emoji' },
                              { name: 'title', label: 'Title' },
                              { name: 'copy', label: 'Copy', type: 'textarea', full: true },
                            ]}
                          />
                        )}
                      />
                    </section>
                  </div>
                ) : null}

                {step === 3 ? (
                  <motion.div className="space-y-4">
                    <section className="idf-glass-card p-4 md:p-5">
                      <header className="mb-4 flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-500/15">
                          <Link2 className="h-4 w-4 text-sky-300" />
                        </span>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-300/90">Presence</p>
                          <h3 className="text-sm font-semibold text-slate-100">Social links</h3>
                        </div>
                      </header>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <ProfileGlassField label="GitHub URL" {...register('social_links.github')} />
                        <ProfileGlassField label="LinkedIn URL" {...register('social_links.linkedin')} />
                        <ProfileGlassField label="Instagram URL" {...register('social_links.instagram')} />
                        <ProfileGlassField label="Email" type="email" {...register('social_links.email')} />
                      </div>
                    </section>
                    <section className="idf-glass-card p-4 md:p-5">
                      <header className="mb-4 flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/15">
                          <Tags className="h-4 w-4 text-amber-300" />
                        </span>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-300/90">Assets</p>
                          <h3 className="text-sm font-semibold text-slate-100">Resume & badges</h3>
                        </div>
                      </header>
                      <div className="space-y-4">
                        <Controller
                          name="resume_url"
                          control={control}
                          render={({ field }) => (
                            <ImageUploader
                              bucket="resumes"
                              value={field.value}
                              onChange={field.onChange}
                              onUploadError={(m) => toast.error(m)}
                              label="Resume PDF"
                              accept="application/pdf"
                              disabled={disabled}
                            />
                          )}
                        />
                        <Controller
                          name="footer_badges"
                          control={control}
                          render={({ field }) => (
                            <div>
                              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                Footer badge image URLs
                              </p>
                              <ArrayInput
                                value={field.value || []}
                                onChange={field.onChange}
                                itemLabel="URL"
                                disabled={disabled}
                              />
                            </div>
                          )}
                        />
                      </div>
                    </section>
                  </motion.div>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            <ProfilePreview values={values} />
            <ProfileMetrics values={values} saveState={saveState} />
            <ProfileAIInsights values={values} />
          </aside>
        </div>

        <ProfileStickyFooter
          currentStep={step}
          totalSteps={STEPS.length}
          isLast={lastStep}
          isFirst={step === 0}
          isSubmitting={isSubmitting}
          disabled={disabled}
          saveState={saveState}
          indexing={indexing}
          onBack={() => setStep((s) => Math.max(0, s - 1))}
          onNext={goNext}
          onDraftSave={draftSave}
          onPreview={scrollPreview}
          onOpenCommand={() => setPaletteOpen(true)}
        />
      </div>
    </ProfileAmbient>
  )
}
