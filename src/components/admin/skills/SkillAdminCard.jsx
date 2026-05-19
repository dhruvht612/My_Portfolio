import { motion } from 'framer-motion'
import { Link2 } from 'lucide-react'
import ActionMenu from '../ActionMenu'

const LEVEL_CLASS = {
  expert: 'text-fuchsia-300 border-fuchsia-400/30 bg-fuchsia-500/10',
  advanced: 'text-sky-300 border-sky-400/30 bg-sky-500/10',
  intermediate: 'text-violet-300 border-violet-400/30 bg-violet-500/10',
}

function levelClass(level) {
  const l = (level || '').toLowerCase()
  if (l.includes('expert')) return LEVEL_CLASS.expert
  if (l.includes('advanced')) return LEVEL_CLASS.advanced
  if (l.includes('intermediate')) return LEVEL_CLASS.intermediate
  return 'text-slate-400 border-white/10 bg-white/[0.04]'
}

export default function SkillAdminCard({ skill, groupName, projectTitle, onEdit, onDelete, index = 0 }) {
  const menuItems = [
    { id: 'edit', label: 'Edit skill', onClick: () => onEdit(skill) },
    { id: 'del', label: 'Delete', danger: true, onClick: () => onDelete(skill) },
  ]

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ y: -2 }}
      className="adm-sk-skill-card group relative rounded-xl border border-white/[0.08] p-3"
    >
      <motion.div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {skill.icon_class ? (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-sky-300/90">
              <i className={`${skill.icon_class} text-sm`} aria-hidden />
            </span>
          ) : null}
          <div className="min-w-0">
            <h4 className="truncate text-sm font-semibold text-slate-100">{skill.name}</h4>
            <p className="truncate text-[10px] text-slate-500">{groupName}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {skill.level ? (
            <span className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase ${levelClass(skill.level)}`}>
              {skill.level}
            </span>
          ) : null}
          <ActionMenu items={menuItems} />
        </div>
      </div>

      {(skill.details || []).filter(Boolean).slice(0, 2).map((line) => (
        <p key={line} className="mb-1 text-[10px] text-slate-500">
          {line}
        </p>
      ))}

      <div className="mb-1 flex items-center justify-between text-[10px]">
        <span className="text-slate-500">Proficiency</span>
        <span className="font-semibold text-sky-300">{skill.proficiency ?? 0}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className="adm-sk-progress-fill h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${skill.proficiency ?? 0}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>

      <motion.div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
        {projectTitle ? (
          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-400/20 bg-emerald-500/10 px-1.5 py-0.5 text-emerald-200/90">
            <Link2 className="h-3 w-3" />
            {projectTitle}
          </span>
        ) : (
          <span className="text-slate-600">No project link</span>
        )}
        <span className="ml-auto">Order {skill.display_order ?? 0}</span>
      </motion.div>
    </motion.article>
  )
}
