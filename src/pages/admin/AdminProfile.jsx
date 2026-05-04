import { useMemo } from 'react'
import AdminForm from '../../components/admin/AdminForm'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import NotConfiguredBanner from '../../components/admin/NotConfiguredBanner'
import { useSupabaseRow } from '../../hooks/useSupabaseRow'
import { profileSchema } from '../../schemas/profile.schema'
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

  const fields = [
    {
      section: 'Basic info',
      fields: [
        { type: 'text', name: 'full_name', label: 'Full name' },
        { type: 'array', name: 'typed_roles', label: 'Typed roles (hero)', itemLabel: 'Role' },
      ],
    },
    {
      section: 'Bio / story',
      fields: [{ type: 'array', name: 'bio_story', label: 'Paragraphs', multiline: true, itemLabel: 'Paragraph' }],
    },
    {
      section: 'Interests',
      fields: [
        {
          type: 'arrayOfObjects',
          name: 'interests',
          label: 'Interest cards',
          itemFields: [
            { name: 'icon', label: 'Icon class (e.g. fas fa-code)', type: 'text' },
            { name: 'title', label: 'Title', type: 'text' },
            { name: 'copy', label: 'Copy', type: 'textarea' },
          ],
        },
      ],
    },
    {
      section: 'Fun facts',
      fields: [
        {
          type: 'arrayOfObjects',
          name: 'fun_facts',
          label: 'Facts',
          itemFields: [
            { name: 'emoji', label: 'Emoji', type: 'text' },
            { name: 'title', label: 'Title', type: 'text' },
            { name: 'copy', label: 'Copy', type: 'textarea' },
          ],
        },
      ],
    },
    {
      section: 'Social links',
      fields: [
        { type: 'text', name: 'social_links.github', label: 'GitHub URL' },
        { type: 'text', name: 'social_links.linkedin', label: 'LinkedIn URL' },
        { type: 'text', name: 'social_links.instagram', label: 'Instagram URL' },
        { type: 'email', name: 'social_links.email', label: 'Email' },
      ],
    },
    {
      section: 'Assets',
      fields: [
        { type: 'image', name: 'resume_url', label: 'Resume PDF', bucket: 'resumes', accept: 'application/pdf' },
        { type: 'array', name: 'footer_badges', label: 'Footer badge image URLs', itemLabel: 'URL' },
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
        eyebrow="Identity"
        title="Profile"
        description="Single-row upsert for the public About / hero: name, roles, bio, socials, resume, and footer badges."
      />
      <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-white/[0.015] p-5 shadow-lg shadow-black/25 ring-1 ring-inset ring-white/[0.03] md:p-8">
        <AdminForm
        key={data?.id || 'new'}
        schema={profileSchema}
        defaultValues={defaultValues}
        fields={fields}
        disabled={!isSupabaseConfigured}
        onSubmit={async (values) => {
          const payload = {
            ...values,
            typed_roles: values.typed_roles.filter(Boolean),
            bio_story: values.bio_story.filter(Boolean),
            footer_badges: values.footer_badges.filter(Boolean),
          }
          await save(payload)
        }}
      />
      </div>
    </div>
  )
}
