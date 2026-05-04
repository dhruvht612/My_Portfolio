import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import AdminForm from '../../components/admin/AdminForm'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminPrimaryButton from '../../components/admin/AdminPrimaryButton'
import AdminSegmentedControl from '../../components/admin/AdminSegmentedControl'
import AdminModal from '../../components/admin/AdminModal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import DataTable from '../../components/admin/DataTable'
import NotConfiguredBanner from '../../components/admin/NotConfiguredBanner'
import { useAdminCrud } from '../../hooks/useAdminCrud'
import { skillGroupSchema } from '../../schemas/skillGroup.schema'
import { skillSchema } from '../../schemas/skill.schema'
import { isSupabaseConfigured } from '../../lib/supabase'

export default function AdminSkills() {
  const [tab, setTab] = useState('groups')
  const groupsCrud = useAdminCrud('skill_groups', { column: 'display_order', ascending: true })
  const skillsCrud = useAdminCrud('skills', { column: 'display_order', ascending: true })
  const projectsCrud = useAdminCrud('projects', { column: 'title', ascending: true })

  const [groupModal, setGroupModal] = useState(false)
  const [groupEditing, setGroupEditing] = useState(null)
  const [skillModal, setSkillModal] = useState(false)
  const [skillEditing, setSkillEditing] = useState(null)
  const [deleteGroup, setDeleteGroup] = useState(null)
  const [deleteSkillId, setDeleteSkillId] = useState(null)

  const childCountForGroup = useMemo(() => {
    const m = new Map()
    for (const s of skillsCrud.rows) {
      const gid = s.skill_group_id
      if (!gid) continue
      m.set(gid, (m.get(gid) || 0) + 1)
    }
    return m
  }, [skillsCrud.rows])

  const projectOptions = useMemo(
    () => [{ value: '', label: '— None —' }, ...projectsCrud.rows.map((p) => ({ value: p.id, label: p.title }))],
    [projectsCrud.rows],
  )

  const groupOptions = useMemo(
    () => groupsCrud.rows.map((g) => ({ value: g.id, label: g.group_name })),
    [groupsCrud.rows],
  )

  const openNewGroup = () => {
    setGroupEditing({ id: null, group_name: '', icon_class: '', display_order: groupsCrud.rows.length })
    setGroupModal(true)
  }
  const openEditGroup = (row) => {
    setGroupEditing({ id: row.id, group_name: row.group_name ?? '', icon_class: row.icon_class ?? '', display_order: row.display_order ?? 0 })
    setGroupModal(true)
  }

  const saveGroup = async (values) => {
    if (groupEditing?.id) await groupsCrud.update(groupEditing.id, values)
    else await groupsCrud.create(values)
    setGroupModal(false)
    setGroupEditing(null)
  }

  const mapSkillRow = (row) => ({
    skill_group_id: row.skill_group_id ?? '',
    name: row.name ?? '',
    proficiency: row.proficiency ?? 50,
    icon_class: row.icon_class ?? '',
    level: row.level ?? '',
    details: row.details?.length ? row.details : [],
    related_project_id: row.related_project_id ?? '',
    display_order: row.display_order ?? 0,
  })

  const openNewSkill = () => {
    const firstG = groupsCrud.rows[0]?.id || ''
    setSkillEditing({ id: null, ...mapSkillRow({ skill_group_id: firstG, details: [] }) })
    setSkillModal(true)
  }
  const openEditSkill = (row) => {
    setSkillEditing({ id: row.id, ...mapSkillRow(row) })
    setSkillModal(true)
  }

  const saveSkill = async (values) => {
    const payload = {
      ...values,
      details: values.details.filter(Boolean),
      related_project_id: values.related_project_id || null,
    }
    if (skillEditing?.id) await skillsCrud.update(skillEditing.id, payload)
    else await skillsCrud.create(payload)
    setSkillModal(false)
    setSkillEditing(null)
  }

  const groupColumns = [
    { key: 'group_name', header: 'Group', sortable: true },
    { key: 'icon_class', header: 'Icon', render: (r) => <span className="text-xs text-slate-500">{r.icon_class || '—'}</span> },
    {
      key: 'count',
      header: 'Skills',
      render: (r) => <span>{childCountForGroup.get(r.id) || 0}</span>,
    },
    { key: 'display_order', header: 'Order', sortable: true },
  ]

  const skillColumns = [
    { key: 'name', header: 'Skill', sortable: true },
    {
      key: 'skill_group_id',
      header: 'Group',
      render: (r) => groupsCrud.rows.find((g) => g.id === r.skill_group_id)?.group_name || '—',
    },
    {
      key: 'proficiency',
      header: 'Proficiency',
      render: (r) => `${r.proficiency ?? 0}%`,
      sortable: true,
    },
    { key: 'display_order', header: 'Order', sortable: true },
  ]

  const nChild = deleteGroup ? childCountForGroup.get(deleteGroup.id) || 0 : 0

  const tabOptions = [
    { value: 'groups', label: 'Skill groups' },
    { value: 'skills', label: 'Skills' },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <NotConfiguredBanner />
      <AdminPageHeader
        eyebrow="Capabilities"
        title="Skills"
        description="Skill groups organize the grid on your site; skills belong to one group and can link to a project."
      >
        <AdminSegmentedControl
          options={tabOptions}
          value={tab}
          onChange={setTab}
          disabled={!isSupabaseConfigured}
        />
      </AdminPageHeader>

      {tab === 'groups' ? (
        <>
          <div className="flex justify-end">
            <AdminPrimaryButton disabled={!isSupabaseConfigured} onClick={openNewGroup}>
              <Plus className="h-4 w-4" aria-hidden />
              Add group
            </AdminPrimaryButton>
          </div>
          <DataTable
            columns={groupColumns}
            rows={groupsCrud.rows}
            loading={groupsCrud.loading}
            error={groupsCrud.error}
            emptyMessage="No skill groups."
            onEdit={isSupabaseConfigured ? openEditGroup : undefined}
            onDelete={isSupabaseConfigured ? (row) => setDeleteGroup(row) : undefined}
          />
        </>
      ) : (
        <>
          <div className="flex justify-end">
            <AdminPrimaryButton disabled={!isSupabaseConfigured || !groupsCrud.rows.length} onClick={openNewSkill}>
              <Plus className="h-4 w-4" aria-hidden />
              Add skill
            </AdminPrimaryButton>
          </div>
          {!groupsCrud.rows.length ? (
            <p className="rounded-xl border border-amber-500/35 bg-amber-500/[0.08] p-4 text-sm text-amber-100 shadow-lg shadow-black/20">
              Create a skill group first.
            </p>
          ) : null}
          <DataTable
            columns={skillColumns}
            rows={skillsCrud.rows}
            loading={skillsCrud.loading}
            error={skillsCrud.error}
            emptyMessage="No skills yet."
            onEdit={isSupabaseConfigured ? openEditSkill : undefined}
            onDelete={isSupabaseConfigured ? (row) => setDeleteSkillId(row.id) : undefined}
          />
        </>
      )}

      <AdminModal open={groupModal} onClose={() => setGroupModal(false)} title={groupEditing?.id ? 'Edit skill group' : 'New skill group'}>
        {groupEditing ? (
          <AdminForm
            key={groupEditing.id || 'ng'}
            schema={skillGroupSchema}
            defaultValues={{
              group_name: groupEditing.group_name,
              icon_class: groupEditing.icon_class,
              display_order: groupEditing.display_order,
            }}
            disabled={!isSupabaseConfigured}
            submitLabel={groupEditing.id ? 'Save' : 'Create'}
            fields={[
              {
                section: 'Group',
                fields: [
                  { type: 'text', name: 'group_name', label: 'Group name' },
                  { type: 'text', name: 'icon_class', label: 'Icon class (Font Awesome)' },
                  { type: 'number', name: 'display_order', label: 'Display order' },
                ],
              },
            ]}
            onSubmit={saveGroup}
          />
        ) : null}
      </AdminModal>

      <AdminModal open={skillModal} onClose={() => setSkillModal(false)} title={skillEditing?.id ? 'Edit skill' : 'New skill'} size="lg">
        {skillEditing ? (
          <AdminForm
            key={skillEditing.id || 'ns'}
            schema={skillSchema}
            defaultValues={{
              skill_group_id: skillEditing.skill_group_id,
              name: skillEditing.name,
              proficiency: skillEditing.proficiency,
              icon_class: skillEditing.icon_class,
              level: skillEditing.level,
              details: skillEditing.details,
              related_project_id: skillEditing.related_project_id || '',
              display_order: skillEditing.display_order,
            }}
            disabled={!isSupabaseConfigured}
            submitLabel={skillEditing.id ? 'Save' : 'Create'}
            fields={[
              {
                section: 'Skill',
                fields: [
                  { type: 'select', name: 'skill_group_id', label: 'Group', options: groupOptions },
                  { type: 'text', name: 'name', label: 'Name' },
                  { type: 'slider', name: 'proficiency', label: 'Proficiency', min: 0, max: 100 },
                  { type: 'text', name: 'icon_class', label: 'Icon class' },
                  { type: 'text', name: 'level', label: 'Level label' },
                  { type: 'array', name: 'details', label: 'Detail lines', itemLabel: 'Line' },
                  { type: 'select', name: 'related_project_id', label: 'Related project', options: projectOptions },
                  { type: 'number', name: 'display_order', label: 'Display order' },
                ],
              },
            ]}
            onSubmit={saveSkill}
          />
        ) : null}
      </AdminModal>

      <ConfirmDialog
        open={!!deleteGroup}
        title="Delete skill group?"
        message={
          nChild > 0
            ? `This will delete ${nChild} child skill(s) due to ON DELETE CASCADE. This cannot be undone.`
            : 'Delete this empty group?'
        }
        confirmLabel="Delete group"
        danger
        onClose={() => setDeleteGroup(null)}
        onConfirm={async () => {
          if (deleteGroup) await groupsCrud.remove(deleteGroup.id)
          setDeleteGroup(null)
        }}
      />

      <ConfirmDialog
        open={!!deleteSkillId}
        title="Delete skill?"
        message="This cannot be undone."
        confirmLabel="Delete"
        danger
        onClose={() => setDeleteSkillId(null)}
        onConfirm={async () => {
          if (deleteSkillId) await skillsCrud.remove(deleteSkillId)
          setDeleteSkillId(null)
        }}
      />
    </div>
  )
}
