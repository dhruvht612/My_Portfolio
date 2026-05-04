import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import AdminForm from '../../components/admin/AdminForm'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminPrimaryButton from '../../components/admin/AdminPrimaryButton'
import AdminModal from '../../components/admin/AdminModal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import EmptyState from '../../components/admin/EmptyState'
import ExperienceOrgCard from '../../components/admin/experiences/ExperienceOrgCard'
import NotConfiguredBanner from '../../components/admin/NotConfiguredBanner'
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
    <div className="mx-auto max-w-6xl space-y-8">
      <NotConfiguredBanner />

      <AdminPageHeader
        eyebrow="Work history"
        title="Experiences"
        description="Organizations as cards; roles in order. Use the menu on each role to edit, reorder, or delete."
      >
        <AdminPrimaryButton disabled={!isSupabaseConfigured} onClick={() => openNew()} className="self-start sm:self-auto">
          <Plus className="h-4 w-4" aria-hidden />
          Add experience
        </AdminPrimaryButton>
      </AdminPageHeader>

      {loading ? (
        <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-white/[0.06] bg-slate-950/40">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-400/30 border-t-sky-400" />
        </div>
      ) : !rows.length ? (
        <EmptyState title="No experiences" message="Add your first role with the button above." />
      ) : (
        <div className="space-y-5 md:space-y-6">
          {grouped.map(({ org, rows: orgRows }, index) => {
            const expanded = openOrgs[org] ?? true
            const panelId = `exp-org-panel-${index}`
            return (
              <ExperienceOrgCard
                key={org}
                org={org}
                panelId={panelId}
                orgRows={orgRows}
                expanded={expanded}
                onToggle={() => setOpenOrgs((s) => ({ ...s, [org]: !expanded }))}
                onAddRole={() => openNew(org)}
                onEdit={openEdit}
                onDeleteRole={(id) => setConfirmId(id)}
                onMoveRole={(row, dir) => moveInOrg(orgRows, row, dir)}
              />
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
