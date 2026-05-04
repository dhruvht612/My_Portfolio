import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useFormContext } from 'react-hook-form'
import AdminForm from '../../components/admin/AdminForm'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminPrimaryButton from '../../components/admin/AdminPrimaryButton'
import NotConfiguredBanner from '../../components/admin/NotConfiguredBanner'
import { fetchRowById, insertRow, listSlugs, updateRow } from '../../lib/admin/queries'
import { ensureUniqueSlug, slugify } from '../../lib/admin/slug'
import { blogSchema } from '../../schemas/blog.schema'
import { isSupabaseConfigured } from '../../lib/supabase'
import { useToast } from '../../hooks/useToast'

const editorSchema = blogSchema
  .omit({ status: true, published_at: true })
  .extend({
    slug: z.string().optional().or(z.literal('')),
  })
  .passthrough()

function BlogAutoSave({ postId, onSave }) {
  const { getValues, formState } = useFormContext()
  const dirtyRef = useRef(false)

  useEffect(() => {
    dirtyRef.current = formState.isDirty
  }, [formState.isDirty])

  useEffect(() => {
    if (!postId || !isSupabaseConfigured) return
    const id = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return
      if (!dirtyRef.current) return
      void onSave(getValues(), 'draft', { silent: true })
    }, 30000)
    return () => window.clearInterval(id)
  }, [postId, onSave, getValues])

  return <p className="text-xs text-[var(--color-text-muted)]">Auto-saves draft every 30s when this tab is visible (saved posts only).</p>
}

const emptyForm = {
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  cover_image_url: '',
  tags: [],
}

export default function AdminBlogEditor() {
  const { id: routeId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [loading, setLoading] = useState(!!routeId)
  const [defaults, setDefaults] = useState(emptyForm)
  const [formKey, setFormKey] = useState(0)

  const load = useCallback(async () => {
    if (!routeId || !isSupabaseConfigured) {
      setDefaults(emptyForm)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const row = await fetchRowById('blog_posts', routeId)
      setDefaults({
        title: row.title ?? '',
        slug: row.slug ?? '',
        content: row.content ?? '',
        excerpt: row.excerpt ?? '',
        cover_image_url: row.cover_image_url ?? '',
        tags: row.tags?.length ? row.tags : [],
      })
    } catch (e) {
      toast.error(e.message || 'Failed to load post')
      setDefaults(emptyForm)
    } finally {
      setLoading(false)
    }
  }, [routeId, toast])

  useEffect(() => {
    void load()
  }, [load])

  const bumpForm = useCallback(() => {
    setFormKey((k) => k + 1)
  }, [])

  const persist = useCallback(
    async (values, mode, opts = {}) => {
      const silent = opts.silent
      if (!isSupabaseConfigured) return
      const existing = await listSlugs('blog_posts', routeId || undefined)
      let slug = (values.slug && values.slug.trim()) || slugify(values.title)
      slug = ensureUniqueSlug(slugify(slug) || 'post', existing)

      let status = 'draft'
      let published_at = null
      if (mode === 'draft') {
        status = 'draft'
        published_at = null
      }
      if (mode === 'published') {
        if (!String(values.content || '').trim()) {
          if (!silent) toast.error('Add content before publishing.')
          return
        }
        status = 'published'
        published_at = new Date().toISOString()
      }

      const payload = {
        title: values.title,
        slug,
        content: values.content || '',
        excerpt: values.excerpt || '',
        cover_image_url: values.cover_image_url || null,
        tags: (values.tags || []).filter(Boolean),
        status,
        published_at,
      }

      try {
        if (routeId) {
          await updateRow('blog_posts', routeId, payload)
          if (!silent) toast.success(mode === 'published' ? 'Published' : 'Saved draft')
          await load()
          bumpForm()
        } else {
          const row = await insertRow('blog_posts', payload)
          if (!silent) toast.success('Saved')
          navigate(`/admin/blog/edit/${row.id}`, { replace: true })
        }
      } catch (e) {
        if (!silent) toast.error(e.message || 'Save failed')
        throw e
      }
    },
    [routeId, navigate, toast, load, bumpForm],
  )

  const fields = useMemo(
    () => [
      {
        section: 'Post',
        fields: [
          {
            type: 'text',
            name: 'title',
            label: 'Title',
            onBlur: async (e, { setValue, getValues }) => {
              const title = e.target.value.trim()
              if (!title) return
              const existing = await listSlugs('blog_posts', routeId || undefined)
              const cur = (getValues('slug') || '').trim()
              if (!cur) setValue('slug', ensureUniqueSlug(slugify(title), existing))
            },
          },
          { type: 'text', name: 'slug', label: 'Slug' },
          { type: 'textarea', name: 'excerpt', label: 'Excerpt', rows: 3 },
          { type: 'image', name: 'cover_image_url', label: 'Cover image', bucket: 'blog-images', accept: 'image/*' },
          { type: 'tags', name: 'tags', label: 'Tags' },
          { type: 'markdown', name: 'content', label: 'Content' },
          {
            type: 'custom',
            name: '_autosave',
            label: 'Notes',
            render: () => <BlogAutoSave postId={routeId} onSave={persist} />,
          },
        ],
      },
    ],
    [routeId, persist],
  )

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
        eyebrow="Blog"
        title={routeId ? 'Edit post' : 'New post'}
        description="Markdown body, slug, excerpt, cover, and tags. Draft saves to Supabase; publish when ready."
      />

      <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-white/[0.015] p-5 shadow-lg shadow-black/25 ring-1 ring-inset ring-white/[0.03] md:p-8">
        <AdminForm
        key={`${routeId || 'new'}-${formKey}`}
        schema={editorSchema}
        defaultValues={defaults}
        disabled={!isSupabaseConfigured}
        fields={fields}
        submitLabel="Save draft"
        onSubmit={async (v) => persist(v, 'draft', {})}
        extraFooter={({ handleSubmit }) => (
          <AdminPrimaryButton disabled={!isSupabaseConfigured} onClick={() => void handleSubmit((vals) => persist(vals, 'published', {}))()}>
            Publish
          </AdminPrimaryButton>
        )}
      />
      </div>
    </div>
  )
}
