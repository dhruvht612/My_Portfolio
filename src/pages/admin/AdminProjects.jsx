import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Rocket } from 'lucide-react'
import { AdminFormWatch } from '../../components/admin/AdminForm'
import AdminFormWizard from '../../components/admin/AdminFormWizard'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminPrimaryButton from '../../components/admin/AdminPrimaryButton'
import AdminModal from '../../components/admin/AdminModal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import NotConfiguredBanner from '../../components/admin/NotConfiguredBanner'
import ProjectsLoadingSkeleton from '../../components/admin/projects/ProjectsLoadingSkeleton'
import ProjectsWorkspace from '../../components/admin/projects/ProjectsWorkspace'
import HolographicCard from '../../components/ui/holographic-card'
import { useAdminCrud } from '../../hooks/useAdminCrud'
import { projectSchema } from '../../schemas/project.schema'
import { isSupabaseConfigured } from '../../lib/supabase'

function mapRowToForm(row) {
  return {
    title: row.title ?? '',
    description: row.description ?? '',
    icon_class: row.icon_class ?? '',
    badge: row.badge != null && typeof row.badge === 'object' ? row.badge.label ?? '' : row.badge ?? '',
    features: row.features?.length ? row.features : [],
    tech_stack: row.tech_stack?.length ? row.tech_stack : [],
    categories: row.categories?.length ? row.categories : [],
    live_url: row.live_url ?? '',
    code_url: row.code_url ?? '',
    is_disabled: row.is_disabled ?? false,
    is_featured: row.is_featured ?? false,
    display_order: row.display_order ?? 0,
    image_url: row.image_url ?? '',
  }
}

function ProjectHoloPreview() {
  return (
    <AdminFormWatch>
      {(vals) => {
        const title = vals.title || 'Project title'
        const description = vals.description || 'Short description appears here…'
        const iconClass = (vals.icon_class && String(vals.icon_class).trim()) || 'fas fa-code'
        const tech = Array.isArray(vals.tech_stack) ? vals.tech_stack.filter(Boolean) : []
        const badgeLabel = vals.badge ? String(vals.badge) : ''
        const disabled = !!vals.is_disabled
        const imageUrl = vals.image_url ? String(vals.image_url) : ''

        return (
          <motion.div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">Live preview</p>
            <HolographicCard className="project-card relative overflow-hidden rounded-2xl border border-[var(--color-blue)]/20 bg-gradient-to-br from-[var(--color-bg)] to-[var(--color-bg-elevated)] shadow-xl">
              {badgeLabel ? (
                <div className="absolute right-3 top-3 z-10">
                  <span className="rounded-full bg-gradient-to-r from-sky-400 to-blue-500 px-3 py-1 text-xs font-bold text-gray-900 shadow-lg">
                    {badgeLabel}
                  </span>
                </div>
              ) : null}
              <div className="relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-blue)]/20">
                {imageUrl ? (
                  <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-90" />
                ) : null}
                <div className="project-card-icon relative z-[1] text-5xl text-[var(--color-accent)]">
                  <i className={iconClass} aria-hidden />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] to-transparent opacity-60" />
              </div>
              <div className="space-y-3 p-4">
                <h3 className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-blue)] bg-clip-text text-lg font-bold text-transparent">{title}</h3>
                <p className="line-clamp-3 text-xs leading-relaxed text-[var(--color-text-muted)]">{description}</p>
                <div className="flex flex-wrap gap-1">
                  {tech.slice(0, 6).map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/15 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-accent)]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 border-t border-[var(--color-border)] pt-3">
                  {disabled ? (
                    <span className="text-xs text-[var(--color-text-muted)]">In development (disabled)</span>
                  ) : (
                    <span className="theme-btn theme-btn-primary pointer-events-none flex-1 px-3 py-2 text-center text-xs opacity-90">Live</span>
                  )}
                </div>
                </div>
            </HolographicCard>
          </motion.div>
        )
      }}
    </AdminFormWatch>
  )
}

export default function AdminProjects() {
  const { rows, loading, error, create, update, remove } = useAdminCrud('projects', {
    column: 'display_order',
    ascending: true,
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  const categorySuggestions = useMemo(() => {
    const s = new Set()
    for (const r of rows) {
      for (const c of r.categories || []) {
        if (c) s.add(String(c))
      }
    }
    return [...s].sort()
  }, [rows])

  const openNew = () => {
    setEditing({ id: null, ...mapRowToForm({}) })
    setModalOpen(true)
  }

  const openEdit = (row) => {
    const id = row.id ?? null
    setEditing({ id, ...mapRowToForm(row) })
    setModalOpen(true)
  }

  const saveProject = async (values) => {
    const payload = {
      ...values,
      features: values.features.filter(Boolean),
      tech_stack: values.tech_stack.filter(Boolean),
      categories: values.categories.map((c) => String(c).toLowerCase()).filter(Boolean),
      badge: values.badge?.trim() || null,
    }
    if (editing?.id) await update(editing.id, payload)
    else await create(payload)
    setModalOpen(false)
    setEditing(null)
  }

  const toggleFeatured = async (row) => {
    if (!isSupabaseConfigured) return
    await update(row.id, { is_featured: !row.is_featured })
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <NotConfiguredBanner />
      <AdminPageHeader
        eyebrow="Portfolio"
        title="Projects"
        description="Futuristic product showcase — cinematic cards, deployment signals, stack intelligence, and portfolio analytics."
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="proj-header-badge inline-flex items-center gap-1.5 self-start rounded-full border border-indigo-400/25 bg-indigo-500/10 px-3 py-1 text-[11px] font-medium text-indigo-200 sm:self-auto">
            <Rocket className="h-3.5 w-3.5" aria-hidden />
            Portfolio OS
          </span>
          <AdminPrimaryButton disabled={!isSupabaseConfigured} onClick={openNew} className="self-start sm:self-auto">
            <Plus className="h-4 w-4" aria-hidden />
            Add project
          </AdminPrimaryButton>
        </div>
      </AdminPageHeader>

      {loading ? (
        <ProjectsLoadingSkeleton />
      ) : (
        <ProjectsWorkspace
          rows={rows}
          loading={loading}
          error={error}
          canEdit={isSupabaseConfigured}
          onEdit={openEdit}
          onDelete={(row) => setConfirmId(row.id)}
          onToggleFeatured={toggleFeatured}
          onAdd={openNew}
        />
      )}

      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing?.id ? 'Edit project' : 'New project'}
        size="xl"
        variant="drawer"
      >
        {editing ? (
          <AdminFormWizard
            key={editing.id || 'new'}
            schema={projectSchema}
            defaultValues={{
              title: editing.title,
              description: editing.description,
              icon_class: editing.icon_class,
              badge: editing.badge,
              features: editing.features,
              tech_stack: editing.tech_stack,
              categories: editing.categories,
              live_url: editing.live_url,
              code_url: editing.code_url,
              is_disabled: editing.is_disabled,
              is_featured: editing.is_featured,
              display_order: editing.display_order,
              image_url: editing.image_url,
            }}
            disabled={!isSupabaseConfigured}
            submitLabel={editing.id ? 'Save' : 'Create'}
            sidebar={() => <ProjectHoloPreview />}
            onCancel={() => setModalOpen(false)}
            steps={[
              {
                id: 'core',
                label: 'Core information',
                fields: [
                  {
                    section: 'Core information',
                    fields: [
                      { type: 'text', name: 'title', label: 'Title' },
                      { type: 'textarea', name: 'description', label: 'Description', rows: 3 },
                      { type: 'text', name: 'icon_class', label: 'Icon class (Font Awesome, e.g. fas fa-code)' },
                      { type: 'text', name: 'badge', label: 'Badge label (short)' },
                      { type: 'number', name: 'display_order', label: 'Display order' },
                    ],
                  },
                ],
              },
              {
                id: 'media',
                label: 'Media & links',
                fields: [
                  {
                    section: 'Media & links',
                    fields: [
                      { type: 'image', name: 'image_url', label: 'Card image', bucket: 'project-images', accept: 'image/*' },
                      { type: 'text', name: 'live_url', label: 'Live URL' },
                      { type: 'text', name: 'code_url', label: 'Repository URL' },
                    ],
                  },
                ],
              },
              {
                id: 'meta',
                label: 'Metadata',
                fields: [
                  {
                    section: 'Metadata / tags',
                    fields: [
                      { type: 'tags', name: 'tech_stack', label: 'Tech stack', suggestions: [] },
                      { type: 'tags', name: 'categories', label: 'Categories', suggestions: categorySuggestions },
                      { type: 'array', name: 'features', label: 'Feature bullets', multiline: true, itemLabel: 'Feature' },
                    ],
                  },
                ],
              },
              {
                id: 'review',
                label: 'Review & publish',
                fields: [
                  {
                    section: 'Review & publish',
                    fields: [
                      { type: 'toggle', name: 'is_featured', label: 'Featured', hint: ' ' },
                      { type: 'toggle', name: 'is_disabled', label: 'Disabled / in development', hint: ' ' },
                    ],
                  },
                ],
              },
            ]}
            onSubmit={saveProject}
          />
        ) : null}
      </AdminModal>

      <ConfirmDialog
        open={!!confirmId}
        title="Delete project"
        message="This cannot be undone."
        confirmLabel="Delete"
        danger
        onClose={() => setConfirmId(null)}
        onConfirm={async () => {
          if (confirmId) await remove(confirmId)
          setConfirmId(null)
        }}
      />
    </div>
  )
}
