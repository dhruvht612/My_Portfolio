import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import ArrayInput from './ArrayInput'
import IconPicker from './IconPicker'
import ImageUploader from './ImageUploader'
import MarkdownEditor from './MarkdownEditor'
import TagInput from './TagInput'
import { useToast } from '../../hooks/useToast'

const inputClass =
  'admin-field-input w-full rounded-xl border border-slate-500/25 px-3 py-2 text-sm shadow-sm placeholder:text-slate-500 focus:border-sky-400/45 focus:outline-none focus:ring-2 focus:ring-sky-400/25'

/**
 * @param {import('zod').ZodTypeAny} schema
 * @param {object} defaultValues
 * @param {Array<Record<string, unknown>>} fields
 * @param {(values: object) => Promise<void> | void} onSubmit
 * @param {string} [submitLabel]
 * @param {boolean} [disabled]
 * @param {(methods: import('react-hook-form').UseFormReturn) => React.ReactNode} [sidebar] — e.g. live preview beside the form
 * @param {(methods: import('react-hook-form').UseFormReturn) => React.ReactNode} [extraFooter] — extra controls inside the form (e.g. Save draft / Publish)
 * @param {boolean} [hideSubmitButton]
 */
export default function AdminForm({
  schema,
  defaultValues,
  fields,
  onSubmit,
  submitLabel = 'Save',
  disabled,
  sidebar,
  extraFooter,
  hideSubmitButton,
}) {
  const toast = useToast()
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = methods

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (e) {
      toast.error(e.message || 'Save failed')
    }
  })

  const renderField = (field) => {
    const err = field.name.includes('.')
      ? field.name.split('.').reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), errors)
      : errors[field.name]

    const errMsg = err && typeof err === 'object' && 'message' in err ? err.message : typeof err === 'string' ? err : undefined

    let controlEl = null
    switch (field.type) {
      case 'text':
      case 'email':
        controlEl = (
          <>
            <input
              type={field.type}
              {...register(
                field.name,
                field.onBlur
                  ? {
                      onBlur: (e) => field.onBlur(e, { setValue, getValues }),
                    }
                  : undefined,
              )}
              disabled={disabled}
              className={inputClass}
              list={field.datalistId || undefined}
            />
            {field.datalistId && Array.isArray(field.datalistOptions) && field.datalistOptions.length > 0 ? (
              <datalist id={field.datalistId}>
                {field.datalistOptions.map((o) => (
                  <option key={o} value={o} />
                ))}
              </datalist>
            ) : null}
          </>
        )
        break
      case 'textarea':
        controlEl = (
          <textarea {...register(field.name)} disabled={disabled} rows={field.rows || 4} className={inputClass} />
        )
        break
      case 'number':
        controlEl = (
          <input type="number" step={field.step || 1} {...register(field.name, { valueAsNumber: true })} disabled={disabled} className={inputClass} />
        )
        break
      case 'slider':
        controlEl = (
          <Controller
            name={field.name}
            control={control}
            render={({ field: f }) => (
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={field.min ?? 0}
                  max={field.max ?? 100}
                  disabled={disabled}
                  className="flex-1 accent-[var(--color-accent)]"
                  {...f}
                  value={f.value ?? 0}
                  onChange={(e) => f.onChange(Number(e.target.value))}
                />
                <span className="w-10 text-right text-sm text-[var(--color-text-muted)]">{f.value ?? 0}%</span>
              </div>
            )}
          />
        )
        break
      case 'toggle':
        controlEl = (
          <Controller
            name={field.name}
            control={control}
            render={({ field: f }) => (
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  disabled={disabled}
                  checked={!!f.value}
                  onChange={(e) => f.onChange(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-500/50 bg-slate-800 text-sky-500 focus:ring-2 focus:ring-sky-400/40"
                />
                <span className="text-sm text-[var(--color-text-muted)]">{field.hint}</span>
              </label>
            )}
          />
        )
        break
      case 'select':
        controlEl = (
          <select {...register(field.name)} disabled={disabled} className={inputClass}>
            {(field.options || []).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )
        break
      case 'tags':
        controlEl = (
          <Controller
            name={field.name}
            control={control}
            render={({ field: f }) => (
              <TagInput value={f.value || []} onChange={f.onChange} suggestions={field.suggestions} disabled={disabled} />
            )}
          />
        )
        break
      case 'array':
        controlEl = (
          <Controller
            name={field.name}
            control={control}
            render={({ field: f }) => (
              <ArrayInput
                value={f.value || []}
                onChange={f.onChange}
                itemLabel={field.itemLabel || 'Line'}
                multiline={field.multiline}
                disabled={disabled}
              />
            )}
          />
        )
        break
      case 'arrayOfObjects':
        controlEl = (
          <Controller
            name={field.name}
            control={control}
            render={({ field: f }) => {
              const list = f.value || []
              return (
                <div className="space-y-3">
                  {list.map((item, idx) => (
                    <div key={idx} className="space-y-2 rounded-xl border border-slate-600/20 bg-slate-900/35 p-3 shadow-inner shadow-black/20">
                      {(field.itemFields || []).map((sub) => (
                        <div key={sub.name}>
                          <label className="mb-1 block text-xs text-slate-400">{sub.label}</label>
                          {sub.type === 'textarea' ? (
                            <textarea
                              disabled={disabled}
                              value={item[sub.name] || ''}
                              onChange={(e) => {
                                const next = [...list]
                                next[idx] = { ...next[idx], [sub.name]: e.target.value }
                                f.onChange(next)
                              }}
                              rows={2}
                              className={inputClass}
                            />
                          ) : (
                            <input
                              type="text"
                              disabled={disabled}
                              value={item[sub.name] || ''}
                              onChange={(e) => {
                                const next = [...list]
                                next[idx] = { ...next[idx], [sub.name]: e.target.value }
                                f.onChange(next)
                              }}
                              className={inputClass}
                            />
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => f.onChange(list.filter((_, i) => i !== idx))}
                        className="inline-flex items-center gap-1 text-xs text-red-300 hover:underline"
                      >
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      f.onChange([
                        ...list,
                        Object.fromEntries((field.itemFields || []).map((sub) => [sub.name, ''])),
                      ])
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-dashed border-slate-500/30 px-3 py-2 text-xs text-slate-400 transition-colors hover:border-sky-500/35 hover:text-slate-200"
                  >
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>
              )
            }}
          />
        )
        break
      case 'image':
        controlEl = (
          <Controller
            name={field.name}
            control={control}
            render={({ field: f }) => (
              <ImageUploader
                bucket={field.bucket}
                accept={field.accept}
                value={f.value || ''}
                onChange={f.onChange}
                onUploadError={(msg) => toast.error(msg)}
                label={field.label}
                hideLabel
                disabled={disabled}
              />
            )}
          />
        )
        break
      case 'markdown':
        controlEl = (
          <Controller
            name={field.name}
            control={control}
            render={({ field: f }) => <MarkdownEditor value={f.value || ''} onChange={f.onChange} disabled={disabled} />}
          />
        )
        break
      case 'iconPicker':
        controlEl = (
          <Controller
            name={field.name}
            control={control}
            render={({ field: f }) => <IconPicker value={f.value || ''} onChange={f.onChange} disabled={disabled} />}
          />
        )
        break
      case 'custom':
        controlEl = field.render ? field.render({ control, disabled, register, getValues, setValue, trigger }) : null
        break
      default:
        controlEl = <p className="text-xs text-amber-200">Unknown field type: {field.type}</p>
    }

    return (
      <div key={field.name} className="space-y-1">
        <label className="block text-xs font-medium text-slate-400" htmlFor={field.name}>
          {field.label}
        </label>
        {controlEl}
        {errMsg ? (
          <p className="text-xs text-red-300" role="alert">
            {String(errMsg)}
          </p>
        ) : null}
      </div>
    )
  }

  const formInner = (
    <form onSubmit={submit} className="space-y-6">
      {fields.map((block, i) => {
        if (block.section && Array.isArray(block.fields)) {
          return (
            <div
              key={block.section || i}
              className="space-y-4 rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.045] to-white/[0.015] p-5 shadow-lg shadow-black/25 ring-1 ring-inset ring-white/[0.03]"
            >
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-400/80">{block.section}</h3>
              <div className="grid gap-4 md:grid-cols-2">{block.fields.map((f) => renderField(f))}</div>
            </div>
          )
        }
        return <div key={block.name || i}>{renderField(block)}</div>
      })}
      {(extraFooter || !hideSubmitButton) && (
        <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-white/[0.06] pt-6">
          {!hideSubmitButton ? (
            <button
              type="submit"
              disabled={disabled || isSubmitting}
              className="theme-btn theme-btn-primary px-6 py-2.5 text-sm disabled:opacity-50 sm:mr-auto"
            >
              {isSubmitting ? 'Saving…' : submitLabel}
            </button>
          ) : null}
          {extraFooter ? <div className="flex flex-wrap gap-2">{extraFooter({ ...methods, getValues, trigger })}</div> : null}
        </div>
      )}
    </form>
  )

  return (
    <FormProvider {...methods}>
      {sidebar ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
          {formInner}
          <div className="lg:sticky lg:top-4 h-min space-y-2">{sidebar(methods)}</div>
        </div>
      ) : (
        formInner
      )}
    </FormProvider>
  )
}

/** Subscribe to full form values for live previews (must be under FormProvider). */
export function AdminFormWatch({ children }) {
  const vals = useWatch()
  return children(vals || {})
}
