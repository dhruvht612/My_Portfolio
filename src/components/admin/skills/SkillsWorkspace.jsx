import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Layers3 } from 'lucide-react'
import EmptyState from '../EmptyState'
import SkillsAmbient from './SkillsAmbient'
import SkillsFilters from './SkillsFilters'
import SkillsHero from './SkillsHero'
import SkillsIntelligence from './SkillsIntelligence'
import SkillAdminCard from './SkillAdminCard'
import SkillGroupModule from './SkillGroupModule'
import {
  computeAdminMetrics,
  filterBundledGroups,
  filterFlatSkills,
  generateAdminInsights,
  groupsWithSkills,
} from './skillInsights'

export default function SkillsWorkspace({
  groups,
  skills,
  projects,
  loading,
  error,
  canEdit,
  onEditGroup,
  onDeleteGroup,
  onEditSkill,
  onDeleteSkill,
  onAddGroup,
  onAddSkill,
}) {
  const [view, setView] = useState('orchestration')
  const [query, setQuery] = useState('')
  const [groupId, setGroupId] = useState('all')
  const [sort, setSort] = useState('order')

  const projectMap = useMemo(() => {
    const m = new Map()
    for (const p of projects) m.set(p.id, p.title)
    return m
  }, [projects])

  const bundled = useMemo(() => groupsWithSkills(groups, skills), [groups, skills])
  const metrics = useMemo(() => computeAdminMetrics(groups, skills), [groups, skills])
  const insights = useMemo(() => generateAdminInsights(groups, skills, projects), [groups, skills, projects])

  const filteredBundled = useMemo(
    () => filterBundledGroups(bundled, { query, groupId, sort }),
    [bundled, query, groupId, sort],
  )

  const flatSkills = useMemo(
    () => filterFlatSkills(skills, groups, { query, groupId, sort }),
    [skills, groups, query, groupId, sort],
  )

  const groupNameById = useMemo(() => {
    const m = new Map()
    for (const g of groups) m.set(g.id, g.group_name)
    return m
  }, [groups])

  if (loading) return null

  return (
    <SkillsAmbient className="border border-white/[0.06] p-3 md:p-4">
      <motion.div className="space-y-4">
        <SkillsHero metrics={metrics} />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(260px,300px)]">
          <div className="min-w-0 space-y-4">
            <SkillsFilters
              view={view}
              onView={setView}
              query={query}
              onQuery={setQuery}
              groupId={groupId}
              onGroupId={setGroupId}
              sort={sort}
              onSort={setSort}
              groups={groups}
            />

            {error ? (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error.message}</p>
            ) : null}

            {view === 'orchestration' ? (
              !filteredBundled.length ? (
                <EmptyState
                  title="No domains match"
                  message={groups.length ? 'Adjust search or filters.' : 'Create your first skill group to build the capability graph.'}
                />
              ) : (
                <div className="space-y-4">
                  {filteredBundled.map((group, index) => (
                    <SkillGroupModule
                      key={group.id}
                      group={group}
                      projectMap={projectMap}
                      onEditGroup={onEditGroup}
                      onDeleteGroup={onDeleteGroup}
                      onAddSkill={onAddSkill}
                      onEditSkill={onEditSkill}
                      onDeleteSkill={onDeleteSkill}
                      index={index}
                    />
                  ))}
                </div>
              )
            ) : !flatSkills.length ? (
              <EmptyState
                title="No skills match"
                message={skills.length ? 'Try a different search or filter.' : 'Add skills after creating at least one group.'}
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {flatSkills.map((skill, index) => (
                  <SkillAdminCard
                    key={skill.id}
                    skill={skill}
                    groupName={groupNameById.get(skill.skill_group_id) || '—'}
                    projectTitle={projectMap.get(skill.related_project_id)}
                    onEdit={onEditSkill}
                    onDelete={onDeleteSkill}
                    index={index}
                  />
                ))}
              </div>
            )}

            {canEdit && !groups.length ? (
              <button
                type="button"
                onClick={onAddGroup}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-8 text-sm text-slate-400 hover:border-sky-400/35 hover:text-slate-200"
              >
                <Layers3 className="h-4 w-4" />
                Create first domain
              </button>
            ) : null}
          </div>

          <SkillsIntelligence metrics={metrics} insights={insights} />
        </div>
      </motion.div>
    </SkillsAmbient>
  )
}
