import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import AdminForm from '../../components/admin/AdminForm'
import AdminModal from '../../components/admin/AdminModal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import EmptyState from '../../components/admin/EmptyState'
import NotConfiguredBanner from '../../components/admin/NotConfiguredBanner'
import StatusBadge from '../../components/admin/StatusBadge'
import { useAdminCrud } from '../../hooks/useAdminCrud'
import { experienceSchema } from '../../schemas/experience.schema'
import { isSupabaseConfigured } from '../../lib/supabase'

function mapRowToForm(row) {
  return {
    organization: row.organization ?? '',
    organization_sub: row.organization_sub ?? '',
    employment_type: row.employment_type ?? '',
    role_title: row.role_title ?? '',
    date_range: row.date_range ?? '',
    location: row.location ?? '',
    work_mode: row.work_mode || '',
    description: row.description ?? '',
    bullets: row.bullets?.length ? row.bullets : [],
    skills_used: row.skills_used?.length ? row.skills_used : [],
    logo_url: row.logo_url ?? '',
    is_featured: row.is_featured ?? false,
    display_order: row.display_order ?? 0,
  }
}

export default function AdminExperiences() {
  const { rows, loading, refresh, create, update, remove, reorder } = useAdminCrud('experiences', {
    column: 'display_order',
    ascending: true,
  })
  const [openOrgs, setOpenOrgs] = useState({})
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  const grouped = useMemo(() => {
    const m = new Map()
    for (const r of rows) {
      const k = r.organization || '—'
      if (!m.has(k)) m.set(k, [])
      m.get(k).push(r)
    }
    return [...m.entries()].map(([org, list]) => ({
      org,
      rows: [...list].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)),
    }))
  }, [rows])

  const orgOptions = useMemo(() => [...new Set(rows.map((r) => r.organization).filter(Boolean))], [rows])

  const openNew = (orgPrefill = '') => {
    setEditing(
      orgPrefill
        ? { id: null, ...mapRowToForm({ organization: orgPrefill }) }
        : { id: null, ...mapRowToForm({}) },
    )
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditing({ id: row.id, ...mapRowToForm(row) })
    setModalOpen(true)
  }

  const saveExperience = async (values) => {
    const payload = {
      ...values,
      bullets: values.bullets.filter(Boolean),
      skills_used: values.skills_used.filter(Boolean),
    }
    if (editing?.id) await update(editing.id, payload)
    else await create(payload)
    setModalOpen(false)
    setEditing(null)
  }

  const moveInOrg = async (orgRows, row, dir) => {
    const idx = orgRows.findIndex((r) => r.id === row.id)
    const swap = orgRows[idx + dir]
    if (!swap) return
    await reorder(row.id, swap.display_order ?? 0)
    await reorder(swap.id, row.display_order ?? 0)
    await refresh()
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <NotConfiguredBanner />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)]">Experiences</h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Grouped by organization. Reorder updates display_order.</p>
        </div>
        <button type="button" disabled={!isSupabaseConfigured} onClick={() => openNew()} className="theme-btn theme-btn-primary px-4 py-2 text-sm">
          Add experience
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-accent)]/30 border-t-[var(--color-accent)]" />
        </div>
      ) : !rows.length ? (
        <EmptyState title="No experiences" message="Add your first role with the button above." />
      ) : (
        <div className="space-y-3">
          {grouped.map(({ org, rows: orgRows }) => {
            const open = openOrgs[org] ?? true
            return (
              <div key={org} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/30">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
                  onClick={() => setOpenOrgs((s) => ({ ...s, [org]: !open }))}
                >
                  <span className="font-semibold text-[var(--color-text)]">{org}</span>
                  {open ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </button>
                {open && (
                  <div className="border-t border-[var(--color-border)]/60 px-2 py-2">
                    {orgRows.map((row) => (
                      <div
                        key={row.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl px-3 py-2 hover:bg-[var(--color-bg)]/50"
                      >
                        <div>
                          <p className="text-sm font-medium text-[var(--color-text)]">{row.role_title}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">{row.date_range}</p>
                          {row.is_featured ? (
                            <span className="mt-1 inline-block">
                              <StatusBadge tone="amber">Featured</StatusBadge>
                            </span>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <button type="button" className="theme-btn theme-btn-secondary px-2 py-1 text-xs" onClick={() => moveInOrg(orgRows, row, -1)}>
                            Up
                          </button>
                          <button type="button" className="theme-btn theme-btn-secondary px-2 py-1 text-xs" onClick={() => moveInOrg(orgRows, row, 1)}>
                            Down
                          </button>
                          <button type="button" className="theme-btn theme-btn-secondary px-2 py-1 text-xs" onClick={() => openEdit(row)}>
                            Edit
                          </button>
                          <button type="button" className="theme-btn theme-btn-secondary px-2 py-1 text-xs text-red-300" onClick={() => setConfirmId(row.id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                    <button type="button" className="mt-2 w-full rounded-lg border border-dashed border-[var(--color-border)] py-2 text-xs text-[var(--color-text-muted)] hover:border-[var(--color-accent)]" onClick={() => openNew(org)}>
                      + Add role in {org}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing?.id ? 'Edit experience' : 'New experience'} size="xl">
        {editing ? (
          <div className="space-y-4">
            <AdminForm
              key={editing.id || 'new'}
              schema={experienceSchema}
              defaultValues={{
                organization: editing.organization,
                organization_sub: editing.organization_sub,
                employment_type: editing.employment_type,
                role_title: editing.role_title,
                date_range: editing.date_range,
                location: editing.location,
                work_mode: editing.work_mode,
                description: editing.description,
                bullets: editing.bullets,
                skills_used: editing.skills_used,
                logo_url: editing.logo_url,
                is_featured: editing.is_featured,
                display_order: editing.display_order,
              }}
              disabled={!isSupabaseConfigured}
              fields={[
                {
                  section: 'Role',
                  fields: [
                    {
                      type: 'text',
                      name: 'organization',
                      label: 'Organization',
                      datalistId: 'exp-org-list',
                      datalistOptions: orgOptions,
                    },
                    { type: 'text', name: 'organization_sub', label: 'Organization subtitle' },
                    { type: 'text', name: 'employment_type', label: 'Employment type' },
                    { type: 'text', name: 'role_title', label: 'Role title' },
                    { type: 'text', name: 'date_range', label: 'Date range' },
                    { type: 'text', name: 'location', label: 'Location' },
                    {
                      type: 'select',
                      name: 'work_mode',
                      label: 'Work mode',
                      options: [
                        { value: '', label: '—' },
                        { value: 'Remote', label: 'Remote' },
                        { value: 'Hybrid', label: 'Hybrid' },
                        { value: 'On-site', label: 'On-site' },
                      ],
                    },
                    { type: 'textarea', name: 'description', label: 'Description', rows: 4 },
                    { type: 'array', name: 'bullets', label: 'Bullets', multiline: true, itemLabel: 'Bullet' },
                    { type: 'tags', name: 'skills_used', label: 'Skills used' },
                    { type: 'image', name: 'logo_url', label: 'Logo', bucket: 'logos', accept: 'image/*' },
                    { type: 'toggle', name: 'is_featured', label: 'Featured', hint: ' ' },
                    { type: 'number', name: 'display_order', label: 'Display order' },
                  ],
                },
              ]}
              submitLabel={editing.id ? 'Save' : 'Create'}
              onSubmit={async (vals) => {
                await saveExperience(vals)
              }}
            />
          </div>
        ) : null}
      </AdminModal>

      <ConfirmDialog
        open={!!confirmId}
        title="Delete experience"
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
