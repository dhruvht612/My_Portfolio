import { useMemo } from 'react'
import AdminForm from '../../components/admin/AdminForm'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
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
      <div className="mx-auto flex max-w-6xl min-h-[240px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-400/30 border-t-sky-400" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <NotConfiguredBanner />
      <AdminPageHeader
        eyebrow="Academics"
        title="Education"
        description="Single-row upsert for the Education page: institution, degree, progress, focus areas, and highlights."
      />
      <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-white/[0.015] p-5 shadow-lg shadow-black/25 ring-1 ring-inset ring-white/[0.03] md:p-8">
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
    </div>
  )
}
