import { useMemo } from 'react'
import { motion } from 'framer-motion'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import NotConfiguredBanner from '../../components/admin/NotConfiguredBanner'
import ProfileWorkspace from '../../components/admin/profile/ProfileWorkspace'
import { useSupabaseRow } from '../../hooks/useSupabaseRow'
import { isSupabaseConfigured } from '../../lib/supabase'

const empty = {
  full_name: '',
  typed_roles: [''],
  bio_story: [''],
  interests: [],
  fun_facts: [],
  social_links: { github: '', linkedin: '', instagram: '', email: '' },
  resume_url: '',
  footer_badges: [],
}

export default function AdminProfile() {
  const { data, loading, save } = useSupabaseRow('profile')

  const defaultValues = useMemo(() => {
    if (!data) return empty
    return {
      full_name: data.full_name ?? '',
      typed_roles: data.typed_roles?.length ? data.typed_roles : [''],
      bio_story: data.bio_story?.length ? data.bio_story : [''],
      interests: Array.isArray(data.interests) ? data.interests : [],
      fun_facts: Array.isArray(data.fun_facts) ? data.fun_facts : [],
      social_links: {
        github: data.social_links?.github ?? '',
        linkedin: data.social_links?.linkedin ?? '',
        instagram: data.social_links?.instagram ?? '',
        email: data.social_links?.email ?? '',
      },
      resume_url: data.resume_url ?? '',
      footer_badges: data.footer_badges?.length ? data.footer_badges : [],
    }
  }, [data])

  if (loading) {
    return (
      <div className="mx-auto flex max-w-6xl min-h-[min(88vh,520px)] items-center justify-center">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          className="idf-loading-shimmer h-12 w-12 rounded-2xl border border-violet-400/30"
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <NotConfiguredBanner />
      <AdminPageHeader
        eyebrow="Identity orchestration"
        title="Profile"
        description="Configure your public persona, narrative, and digital presence in an AI-powered identity workspace."
      />
      <ProfileWorkspace
        key={data?.id || 'new'}
        defaultValues={defaultValues}
        disabled={!isSupabaseConfigured}
        onSubmit={async (values) => {
          await save(values)
        }}
      />
    </div>
  )
}
