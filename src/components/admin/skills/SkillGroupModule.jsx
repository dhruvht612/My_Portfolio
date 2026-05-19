import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Layers3, Pencil, Plus, Trash2 } from 'lucide-react'
import { groupStats } from './skillInsights'
import SkillAdminCard from './SkillAdminCard'

export default function SkillGroupModule({
  group,
  projectMap,
  onEditGroup,
  onDeleteGroup,
  onAddSkill,
  onEditSkill,
  onDeleteSkill,
  index = 0,
}) {
  const [expanded, setExpanded] = useState(true)
  const stats = groupStats(group)

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="adm-sk-module relative overflow-hidden rounded-2xl border border-white/[0.08]"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/[0.06] via-transparent to-violet-500/[0.04]" />

      <div className="relative p-4 md:p-5">
        <div className="mb-4 flex flex-wrap items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-sky-400/25 bg-sky-500/10 text-sky-300">
            {group.icon_class ? <i className={group.icon_class} aria-hidden /> : <Layers3 className="h-5 w-5" />}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-slate-100">{group.group_name}</h3>
            <p className="text-xs text-slate-500">Domain module · order {group.display_order ?? 0}</p>
          </div>
          <motion.div layout className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => onAddSkill(group.id)}
              className="adm-sk-icon-btn"
              title="Add skill to group"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => onEditGroup(group)} className="adm-sk-icon-btn" title="Edit group">
              <Pencil className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => onDeleteGroup(group)} className="adm-sk-icon-btn text-red-300/90" title="Delete group">
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="adm-sk-icon-btn"
              aria-expanded={expanded}
            >
              <motion.span animate={{ rotate: expanded ? 180 : 0 }}>
                <ChevronDown className="h-4 w-4" />
              </motion.span>
            </button>
          </motion.div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: 'Skills', value: stats.density },
            { label: 'Avg proficiency', value: `${stats.avg}%` },
            { label: 'Expert', value: stats.expert },
            { label: 'Coverage', value: `${stats.coverage}%` },
          ].map((m) => (
            <div key={m.label} className="adm-sk-module-stat rounded-lg border border-white/[0.05] bg-black/20 px-2.5 py-2">
              <p className="text-sm font-bold text-slate-200">{m.value}</p>
              <p className="text-[9px] uppercase tracking-wider text-slate-600">{m.label}</p>
            </div>
          ))}
        </div>

        <div className="mb-3 h-1 overflow-hidden rounded-full bg-white/[0.05]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-sky-400/80 to-violet-400/70"
            initial={{ width: 0 }}
            animate={{ width: `${stats.coverage}%` }}
            transition={{ type: 'spring', stiffness: 50, damping: 18 }}
          />
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {!group.skills?.length ? (
                <button
                  type="button"
                  onClick={() => onAddSkill(group.id)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/12 py-6 text-sm text-slate-500 hover:border-sky-400/30 hover:text-slate-300"
                >
                  <Plus className="h-4 w-4" />
                  Add first skill
                </button>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {group.skills.map((skill, i) => (
                    <SkillAdminCard
                      key={skill.id}
                      skill={skill}
                      groupName={group.group_name}
                      projectTitle={projectMap.get(skill.related_project_id)}
                      onEdit={onEditSkill}
                      onDelete={onDeleteSkill}
                      index={i}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  )
}
