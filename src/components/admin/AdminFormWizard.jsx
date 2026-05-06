import { useMemo, useState } from 'react'
import AdminForm from './AdminForm'

function StepProgress({ steps, currentStep, onJump }) {
  return (
    <ol className="admin-card-premium grid grid-cols-2 gap-2 p-2 md:grid-cols-4">
      {steps.map((step, index) => {
        const active = index === currentStep
        const done = index < currentStep
        return (
          <li key={step.id}>
            <button
              type="button"
              onClick={() => onJump(index)}
              disabled={!done}
              className={`w-full rounded-xl border px-2.5 py-2 text-left transition ${
                active
                  ? 'border-sky-400/45 bg-sky-400/15 text-sky-100'
                  : done
                    ? 'border-white/15 bg-white/[0.03] text-slate-200 hover:border-sky-400/35'
                    : 'border-white/[0.08] bg-white/[0.02] text-slate-500'
              }`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em]">Step {index + 1}</p>
              <p className="mt-1 truncate text-xs font-medium">{step.label}</p>
            </button>
          </li>
        )
      })}
    </ol>
  )
}

export default function AdminFormWizard({
  schema,
  defaultValues,
  steps,
  onSubmit,
  disabled,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  onCancel,
  sidebar,
}) {
  const [currentStep, setCurrentStep] = useState(0)
  const [draftValues, setDraftValues] = useState(defaultValues)

  const step = steps[currentStep]
  const stepFields = useMemo(() => step.fields, [step.fields])
  const lastStep = currentStep === steps.length - 1
  const partialSchema = useMemo(() => (typeof schema?.partial === 'function' ? schema.partial() : schema), [schema])

  const saveDraft = (values) => {
    setDraftValues(values)
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <StepProgress
        steps={steps}
        currentStep={currentStep}
        onJump={(index) => {
          setCurrentStep(index)
        }}
      />
      <div className="min-h-0 flex-1">
        <AdminForm
          key={`step-${step.id}`}
          schema={lastStep ? schema : partialSchema}
          defaultValues={draftValues}
          fields={stepFields}
          disabled={disabled}
          submitLabel={lastStep ? submitLabel : 'Next'}
          sidebar={sidebar}
          stickyFooter
          hideSubmitButton
          extraFooter={({ getValues, handleSubmit }) => (
            <>
              {onCancel ? (
                <button type="button" onClick={onCancel} className="theme-btn theme-btn-secondary px-4 py-2 text-sm">
                  {cancelLabel}
                </button>
              ) : null}
              <button
                type="button"
                disabled={currentStep === 0}
                onClick={() => {
                  saveDraft(getValues())
                  setCurrentStep((s) => Math.max(0, s - 1))
                }}
                className="theme-btn theme-btn-secondary px-4 py-2 text-sm disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() =>
                  void handleSubmit(async (vals) => {
                    saveDraft(vals)
                    if (!lastStep) {
                      setCurrentStep((s) => Math.min(steps.length - 1, s + 1))
                      return
                    }
                    await onSubmit(vals)
                  })()
                }
                className="theme-btn theme-btn-primary px-5 py-2 text-sm"
              >
                {lastStep ? submitLabel : 'Next'}
              </button>
            </>
          )}
          onSubmit={() => {}}
        />
      </div>
    </div>
  )
}
