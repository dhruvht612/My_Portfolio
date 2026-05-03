import { useState } from 'react'
import AdminForm from '../../components/admin/AdminForm'
import AdminModal from '../../components/admin/AdminModal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import DataTable from '../../components/admin/DataTable'
import NotConfiguredBanner from '../../components/admin/NotConfiguredBanner'
import StatusBadge from '../../components/admin/StatusBadge'
import { useAdminCrud } from '../../hooks/useAdminCrud'
import { certificationSchema } from '../../schemas/certification.schema'
import { isSupabaseConfigured } from '../../lib/supabase'

function mapRow(row) {
  return {
    title: row.title ?? '',
    issuer: row.issuer ?? '',
    issued_date: row.issued_date ?? '',
    credential_id: row.credential_id ?? '',
    credential_url: row.credential_url ?? '',
    tags: row.tags?.length ? row.tags : [],
    category: row.category ?? '',
    is_featured: row.is_featured ?? false,
    learned: row.learned ?? '',
    applied: row.applied ?? '',
    applied_project: row.applied_project ?? '',
    image_url: row.image_url ?? '',
  }
}

export default function AdminCertifications() {
  const { rows, loading, error, create, update, remove } = useAdminCrud('certifications', {
    column: 'issued_date',
    ascending: false,
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  const openNew = () => {
    setEditing({ id: null, ...mapRow({}) })
    setModalOpen(true)
  }
  const openEdit = (row) => {
    setEditing({ id: row.id, ...mapRow(row) })
    setModalOpen(true)
  }

  const saveCert = async (values) => {
    const payload = {
      ...values,
      tags: values.tags.filter(Boolean),
      credential_id: values.credential_id || null,
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
      width: '56px',
      render: (row) =>
        row.image_url ? (
          <img src={row.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
        ) : (
          <span className="text-[var(--color-text-muted)]">—</span>
        ),
    },
    { key: 'title', header: 'Title', sortable: true },
    { key: 'issuer', header: 'Issuer', sortable: true },
    {
      key: 'is_featured',
      header: '',
      render: (row) => (row.is_featured ? <StatusBadge tone="amber">Featured</StatusBadge> : null),
    },
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <NotConfiguredBanner />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)]">Certifications</h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Badges, issuers, and links.</p>
        </div>
        <button type="button" disabled={!isSupabaseConfigured} onClick={openNew} className="theme-btn theme-btn-primary px-4 py-2 text-sm">
          Add certification
        </button>
      </div>
      <p className="text-xs text-[var(--color-text-muted)]">
        Badge uploads use the <code className="text-[var(--color-accent)]">cert-images</code> bucket. If save fails with “column image_url does not exist”, run{' '}
        <code className="text-[var(--color-accent)]">docs/migrations/add_certifications_image_url.sql</code> in Supabase.
      </p>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        emptyMessage="No certifications."
        onEdit={isSupabaseConfigured ? openEdit : undefined}
        onDelete={isSupabaseConfigured ? (row) => setConfirmId(row.id) : undefined}
      />

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing?.id ? 'Edit certification' : 'New certification'} size="lg">
        {editing ? (
          <AdminForm
            key={editing.id || 'nc'}
            schema={certificationSchema}
            defaultValues={mapRow(editing)}
            disabled={!isSupabaseConfigured}
            submitLabel={editing.id ? 'Save' : 'Create'}
            fields={[
              {
                section: 'Credential',
                fields: [
                  { type: 'text', name: 'title', label: 'Title' },
                  { type: 'text', name: 'issuer', label: 'Issuer' },
                  { type: 'text', name: 'issued_date', label: 'Issued (text or date)' },
                  { type: 'text', name: 'credential_id', label: 'Credential ID' },
                  { type: 'text', name: 'credential_url', label: 'Credential URL' },
                  { type: 'image', name: 'image_url', label: 'Badge image', bucket: 'cert-images', accept: 'image/*' },
                  { type: 'text', name: 'category', label: 'Category' },
                  { type: 'tags', name: 'tags', label: 'Tags' },
                  { type: 'toggle', name: 'is_featured', label: 'Featured', hint: ' ' },
                ],
              },
              {
                section: 'Narrative',
                fields: [
                  { type: 'textarea', name: 'learned', label: 'Learned', rows: 3 },
                  { type: 'textarea', name: 'applied', label: 'Applied', rows: 3 },
                  { type: 'text', name: 'applied_project', label: 'Applied project' },
                ],
              },
            ]}
            onSubmit={saveCert}
          />
        ) : null}
      </AdminModal>

      <ConfirmDialog
        open={!!confirmId}
        title="Delete certification?"
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
