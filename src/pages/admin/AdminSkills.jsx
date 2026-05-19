import { useMemo, useState } from 'react'
import { Layers3, Plus, Sparkles } from 'lucide-react'
import AdminFormWizard from '../../components/admin/AdminFormWizard'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminPrimaryButton from '../../components/admin/AdminPrimaryButton'
import AdminModal from '../../components/admin/AdminModal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import NotConfiguredBanner from '../../components/admin/NotConfiguredBanner'
import SkillsLoadingSkeleton from '../../components/admin/skills/SkillsLoadingSkeleton'
import SkillsWorkspace from '../../components/admin/skills/SkillsWorkspace'
import { useAdminCrud } from '../../hooks/useAdminCrud'
import { skillGroupSchema } from '../../schemas/skillGroup.schema'
import { skillSchema } from '../../schemas/skill.schema'
import { isSupabaseConfigured } from '../../lib/supabase'

export default function AdminSkills() {
  const groupsCrud = useAdminCrud('skill_groups', { column: 'display_order', ascending: true })
  const skillsCrud = useAdminCrud('skills', { column: 'display_order', ascending: true })
  const projectsCrud = useAdminCrud('projects', { column: 'title', ascending: true })

  const [groupModal, setGroupModal] = useState(false)
  const [groupEditing, setGroupEditing] = useState(null)
  const [skillModal, setSkillModal] = useState(false)
  const [skillEditing, setSkillEditing] = useState(null)
  const [deleteGroup, setDeleteGroup] = useState(null)
  const [deleteSkill, setDeleteSkill] = useState(null)
  const [prefillGroupId, setPrefillGroupId] = useState(null)

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
    setGroupEditing({
      id: row.id,
      group_name: row.group_name ?? '',
      icon_class: row.icon_class ?? '',
      display_order: row.display_order ?? 0,
    })
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

  const openNewSkill = (groupId = null) => {
    const gid = groupId || groupsCrud.rows[0]?.id || ''
    setPrefillGroupId(groupId)
    setSkillEditing({ id: null, ...mapSkillRow({ skill_group_id: gid, details: [] }) })
    setSkillModal(true)
  }

  const openEditSkill = (row) => {
    setPrefillGroupId(null)
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
    setPrefillGroupId(null)
  }

  const nChild = deleteGroup ? childCountForGroup.get(deleteGroup.id) || 0 : 0
  const loading = groupsCrud.loading || skillsCrud.loading

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <NotConfiguredBanner />
      <AdminPageHeader
        eyebrow="Capabilities"
        title="Skills"
        description="Engineering capability OS — orchestrate domains, proficiency signals, and project linkages for your public intelligence workspace."
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="adm-sk-header-badge inline-flex items-center gap-1.5 self-start rounded-full border border-sky-400/25 bg-sky-500/10 px-3 py-1 text-[11px] font-medium text-sky-200 sm:self-auto">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Capability OS
          </span>
          <AdminPrimaryButton disabled={!isSupabaseConfigured} onClick={openNewGroup} className="self-start sm:self-auto">
            <Layers3 className="h-4 w-4" aria-hidden />
            Add domain
          </AdminPrimaryButton>
          <AdminPrimaryButton
            disabled={!isSupabaseConfigured || !groupsCrud.rows.length}
            onClick={() => openNewSkill()}
            className="self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add skill
          </AdminPrimaryButton>
        </div>
      </AdminPageHeader>

      {loading ? (
        <SkillsLoadingSkeleton />
      ) : (
        <SkillsWorkspace
          groups={groupsCrud.rows}
          skills={skillsCrud.rows}
          projects={projectsCrud.rows}
          loading={loading}
          error={groupsCrud.error || skillsCrud.error}
          canEdit={isSupabaseConfigured}
          onEditGroup={openEditGroup}
          onDeleteGroup={setDeleteGroup}
          onEditSkill={openEditSkill}
          onDeleteSkill={setDeleteSkill}
          onAddGroup={openNewGroup}
          onAddSkill={openNewSkill}
        />
      )}

      <AdminModal open={groupModal} onClose={() => setGroupModal(false)} title={groupEditing?.id ? 'Edit skill group' : 'New skill group'}>
        {groupEditing ? (
          <AdminFormWizard
            key={groupEditing.id || 'ng'}
            schema={skillGroupSchema}
            defaultValues={{
              group_name: groupEditing.group_name,
              icon_class: groupEditing.icon_class,
              display_order: groupEditing.display_order,
            }}
            disabled={!isSupabaseConfigured}
            submitLabel={groupEditing.id ? 'Save' : 'Create'}
            onCancel={() => setGroupModal(false)}
            steps={[
              {
                id: 'core',
                label: 'Core information',
                fields: [
                  {
                    section: 'Group',
                    fields: [
                      { type: 'text', name: 'group_name', label: 'Group name' },
                      { type: 'text', name: 'icon_class', label: 'Icon class (Font Awesome)' },
                    ],
                  },
                ],
              },
              {
                id: 'meta',
                label: 'Metadata',
                fields: [{ section: 'Metadata', fields: [{ type: 'number', name: 'display_order', label: 'Display order' }] }],
              },
            ]}
            onSubmit={saveGroup}
          />
        ) : null}
      </AdminModal>

      <AdminModal open={skillModal} onClose={() => setSkillModal(false)} title={skillEditing?.id ? 'Edit skill' : 'New skill'} size="lg">
        {skillEditing ? (
          <AdminFormWizard
            key={`${skillEditing.id || 'ns'}-${prefillGroupId || ''}`}
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
            onCancel={() => setSkillModal(false)}
            steps={[
              {
                id: 'core',
                label: 'Core information',
                fields: [
                  {
                    section: 'Skill',
                    fields: [
                      { type: 'select', name: 'skill_group_id', label: 'Group', options: groupOptions },
                      { type: 'text', name: 'name', label: 'Name' },
                      { type: 'slider', name: 'proficiency', label: 'Proficiency', min: 0, max: 100 },
                      { type: 'text', name: 'icon_class', label: 'Icon class' },
                      { type: 'text', name: 'level', label: 'Level label' },
                    ],
                  },
                ],
              },
              {
                id: 'meta',
                label: 'Links & metadata',
                fields: [
                  {
                    section: 'Links & metadata',
                    fields: [
                      { type: 'array', name: 'details', label: 'Detail lines', itemLabel: 'Line' },
                      { type: 'select', name: 'related_project_id', label: 'Related project', options: projectOptions },
                      { type: 'number', name: 'display_order', label: 'Display order' },
                    ],
                  },
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
        open={!!deleteSkill}
        title="Delete skill?"
        message="This cannot be undone."
        confirmLabel="Delete"
        danger
        onClose={() => setDeleteSkill(null)}
        onConfirm={async () => {
          if (deleteSkill) await skillsCrud.remove(deleteSkill.id)
          setDeleteSkill(null)
        }}
      />
    </div>
  )
}
