import { useMemo, useState } from 'react'
import { Plus, Sparkles } from 'lucide-react'
import AdminForm, { AdminFormWatch } from '../../components/admin/AdminForm'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminPrimaryButton from '../../components/admin/AdminPrimaryButton'
import AdminModal from '../../components/admin/AdminModal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import DataTable from '../../components/admin/DataTable'
import NotConfiguredBanner from '../../components/admin/NotConfiguredBanner'
import StatusBadge from '../../components/admin/StatusBadge'
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
          <div className="space-y-2">
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
                    <>
                      <span className="theme-btn theme-btn-primary pointer-events-none flex-1 px-3 py-2 text-center text-xs opacity-90">
                        <Sparkles className="inline h-3 w-3" /> Live
                      </span>
                      <span className="theme-btn theme-btn-secondary pointer-events-none flex-1 px-3 py-2 text-center text-xs opacity-90">GitHub</span>
                    </>
                  )}
                </div>
              </div>
            </HolographicCard>
          </div>
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
    setEditing({ id: row.id, ...mapRowToForm(row) })
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

  const columns = [
    {
      key: 'image_url',
      header: '',
      width: '72px',
      render: (row) =>
        row.image_url ? (
          <img src={row.image_url} alt="" className="h-12 w-16 rounded-lg object-cover" />
        ) : (
          <div className="flex h-12 w-16 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-500">
            <i className={row.icon_class || 'fas fa-code'} />
          </div>
        ),
    },
    { key: 'title', header: 'Title', sortable: true },
    {
      key: 'categories',
      header: 'Categories',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {(row.categories || []).slice(0, 4).map((c) => (
            <span key={c} className="rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] uppercase text-slate-500">
              {c}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'tech_stack',
      header: 'Tech',
      render: (row) => <span className="text-[var(--color-text-muted)]">{Array.isArray(row.tech_stack) ? row.tech_stack.length : 0}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) =>
        row.is_disabled ? <StatusBadge tone="gray">Disabled</StatusBadge> : <StatusBadge tone="green">Live</StatusBadge>,
    },
    {
      key: 'is_featured',
      header: '',
      render: (row) => (row.is_featured ? <StatusBadge tone="amber">Featured</StatusBadge> : null),
    },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <NotConfiguredBanner />
      <AdminPageHeader
        eyebrow="Portfolio"
        title="Projects"
        description="Case studies and builds. Edit rows from the table menu; preview updates live in the form sidebar."
      >
        <AdminPrimaryButton disabled={!isSupabaseConfigured} onClick={openNew}>
          <Plus className="h-4 w-4" aria-hidden />
          Add project
        </AdminPrimaryButton>
      </AdminPageHeader>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        emptyMessage="No projects yet."
        onEdit={isSupabaseConfigured ? openEdit : undefined}
        onDelete={isSupabaseConfigured ? (row) => setConfirmId(row.id) : undefined}
      />

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing?.id ? 'Edit project' : 'New project'} size="xl">
        {editing ? (
          <AdminForm
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
            fields={[
              {
                section: 'Core',
                fields: [
                  { type: 'text', name: 'title', label: 'Title' },
                  { type: 'textarea', name: 'description', label: 'Description', rows: 5 },
                  {
                    type: 'text',
                    name: 'icon_class',
                    label: 'Icon class (Font Awesome, e.g. fas fa-code)',
                  },
                  { type: 'text', name: 'badge', label: 'Badge label (short)' },
                  { type: 'number', name: 'display_order', label: 'Display order' },
                  { type: 'toggle', name: 'is_featured', label: 'Featured', hint: ' ' },
                  { type: 'toggle', name: 'is_disabled', label: 'Disabled / in development', hint: ' ' },
                ],
              },
              {
                section: 'Media & links',
                fields: [
                  { type: 'image', name: 'image_url', label: 'Card image', bucket: 'project-images', accept: 'image/*' },
                  { type: 'text', name: 'live_url', label: 'Live URL' },
                  { type: 'text', name: 'code_url', label: 'Repository URL' },
                ],
              },
              {
                section: 'Taxonomy',
                fields: [
                  { type: 'tags', name: 'tech_stack', label: 'Tech stack', suggestions: [] },
                  { type: 'tags', name: 'categories', label: 'Categories', suggestions: categorySuggestions },
                ],
              },
              {
                section: 'Features',
                fields: [{ type: 'array', name: 'features', label: 'Feature bullets', multiline: true, itemLabel: 'Feature' }],
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
