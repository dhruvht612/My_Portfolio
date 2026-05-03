import { useMemo } from 'react'
import AdminForm from '../../components/admin/AdminForm'
import NotConfiguredBanner from '../../components/admin/NotConfiguredBanner'
import { useSupabaseRow } from '../../hooks/useSupabaseRow'
import { educationSchema } from '../../schemas/education.schema'
import { isSupabaseConfigured } from '../../lib/supabase'

const empty = {
  institution: '',
  degree: '',
  logo_url: '',
  progress_percent: 50,
  focus_areas: [],
  highlights: [],
  is_active: true,
}

export default function AdminEducation() {
  const { data, loading, save } = useSupabaseRow('education')

  const defaultValues = useMemo(() => {
    if (!data) return empty
    return {
      institution: data.institution ?? '',
      degree: data.degree ?? '',
      logo_url: data.logo_url ?? '',
      progress_percent: data.progress_percent ?? 50,
      focus_areas: data.focus_areas?.length ? data.focus_areas : [],
      highlights: Array.isArray(data.highlights) ? data.highlights : [],
      is_active: data.is_active ?? true,
    }
  }, [data])

  const fields = [
    {
      section: 'Program',
      fields: [
        { type: 'text', name: 'institution', label: 'Institution' },
        { type: 'text', name: 'degree', label: 'Degree' },
        { type: 'image', name: 'logo_url', label: 'Institution logo', bucket: 'logos', accept: 'image/*' },
        { type: 'slider', name: 'progress_percent', label: 'Progress %', min: 0, max: 100 },
        { type: 'toggle', name: 'is_active', label: 'Currently enrolled', hint: ' ' },
      ],
    },
    {
      section: 'Focus areas',
      fields: [{ type: 'array', name: 'focus_areas', label: 'Focus areas', itemLabel: 'Area' }],
    },
    {
      section: 'Highlights',
      fields: [
        {
          type: 'arrayOfObjects',
          name: 'highlights',
          label: 'Highlight cards',
          itemFields: [
            { name: 'icon', label: 'Icon class', type: 'text' },
            { name: 'title', label: 'Title', type: 'text' },
            { name: 'description', label: 'Description', type: 'textarea' },
          ],
        },
      ],
    },
  ]

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <div
          className="h-10 w-10 rounded-full border-2 border-[var(--color-accent)]/30 border-t-[var(--color-accent)]"
          style={{ animation: 'spin 0.7s linear infinite' }}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <NotConfiguredBanner />
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text)]">Education</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">Single-row upsert for the Education page.</p>
      </div>
      <AdminForm
        key={data?.id || 'new'}
        schema={educationSchema}
        defaultValues={defaultValues}
        fields={fields}
        disabled={!isSupabaseConfigured}
        onSubmit={async (values) => {
          await save({
            ...values,
            focus_areas: values.focus_areas.filter(Boolean),
          })
        }}
      />
    </div>
  )
}
