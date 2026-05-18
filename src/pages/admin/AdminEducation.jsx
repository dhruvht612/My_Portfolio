import { useMemo } from 'react'
import { Sparkles } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import EducationLoadingSkeleton from '../../components/admin/education/EducationLoadingSkeleton'
import EducationWorkspace from '../../components/admin/education/EducationWorkspace'
import NotConfiguredBanner from '../../components/admin/NotConfiguredBanner'
import { useSupabaseRow } from '../../hooks/useSupabaseRow'
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

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <NotConfiguredBanner />
      <AdminPageHeader
        eyebrow="Academics"
        title="Education"
        description="Futuristic student identity workspace — institution profile, degree trajectory, focus map, and milestone highlights for your public Education page."
      >
        <span className="edu-header-badge inline-flex items-center gap-1.5 self-start rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-[11px] font-medium text-violet-200 sm:self-auto">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Student OS
        </span>
      </AdminPageHeader>

      {loading ? (
        <EducationLoadingSkeleton />
      ) : (
        <EducationWorkspace
          key={data?.id || 'new'}
          defaultValues={defaultValues}
          disabled={!isSupabaseConfigured}
          onSubmit={save}
        />
      )}
    </div>
  )
}
