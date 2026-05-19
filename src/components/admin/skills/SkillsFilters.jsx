import { motion } from 'framer-motion'
import { LayoutGrid, List, Search, SlidersHorizontal } from 'lucide-react'

export default function SkillsFilters({
  view,
  onView,
  query,
  onQuery,
  groupId,
  onGroupId,
  sort,
  onSort,
  groups = [],
}) {
  return (
    <div className="adm-sk-filters space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search skills, groups, levels…"
          className="adm-sk-search-input w-full rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          <SlidersHorizontal className="h-3 w-3" />
          View
        </span>
        {[
          { id: 'orchestration', label: 'Orchestration', icon: LayoutGrid },
          { id: 'index', label: 'Flat index', icon: List },
        ].map(({ id, label, icon: Icon }) => (
          <motion.button
            key={id}
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => onView(id)}
            className={`adm-sk-filter-pill ${view === id ? 'adm-sk-filter-pill-active' : ''}`}
          >
            <Icon className="h-3 w-3" />
            {label}
          </motion.button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <select value={groupId} onChange={(e) => onGroupId(e.target.value)} className="adm-sk-select">
          <option value="all">All domains</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.group_name}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(e) => onSort(e.target.value)} className="adm-sk-select">
          <option value="order">Display order</option>
          <option value="proficiency">Proficiency</option>
          <option value="name">Name A–Z</option>
          <option value="density">Skill density</option>
        </select>
      </div>
    </div>
  )
}
