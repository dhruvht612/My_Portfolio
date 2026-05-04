import { useState } from 'react'
import { Plus } from 'lucide-react'
import AdminForm from '../../components/admin/AdminForm'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminPrimaryButton from '../../components/admin/AdminPrimaryButton'
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
          <span className="text-slate-500">—</span>
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
    <div className="mx-auto max-w-6xl space-y-8">
      <NotConfiguredBanner />
      <AdminPageHeader
        eyebrow="Credentials"
        title="Certifications"
        description="Badges, issuers, links, and narrative fields. Row actions live in the table menu."
      >
        <AdminPrimaryButton disabled={!isSupabaseConfigured} onClick={openNew}>
          <Plus className="h-4 w-4" aria-hidden />
          Add certification
        </AdminPrimaryButton>
      </AdminPageHeader>
      <p className="rounded-xl border border-white/[0.06] bg-slate-900/35 px-4 py-3 text-xs leading-relaxed text-slate-400 ring-1 ring-inset ring-white/[0.03]">
        Badge uploads use the <code className="text-sky-300/90">cert-images</code> bucket. If save fails with “column image_url does not exist”, run{' '}
        <code className="text-sky-300/90">docs/migrations/add_certifications_image_url.sql</code> in Supabase.
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
