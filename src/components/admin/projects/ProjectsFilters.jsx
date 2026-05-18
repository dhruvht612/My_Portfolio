import { motion } from 'framer-motion'
import { Search, SlidersHorizontal } from 'lucide-react'

export default function ProjectsFilters({
  query,
  onQuery,
  category,
  onCategory,
  tech,
  onTech,
  status,
  onStatus,
  sort,
  onSort,
  categories = [],
  techOptions = [],
}) {
  const pills = [
    { id: 'all', label: 'All' },
    { id: 'live', label: 'Live' },
    { id: 'disabled', label: 'In dev' },
    { id: 'featured', label: 'Featured' },
  ]

  return (
    <div className="proj-filters space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search projects, stacks, categories…"
          className="proj-search-input w-full rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          <SlidersHorizontal className="h-3 w-3" />
          Status
        </span>
        {pills.map((p) => (
          <motion.button
            key={p.id}
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => onStatus(p.id)}
            className={`proj-filter-pill ${status === p.id ? 'proj-filter-pill-active' : ''}`}
          >
            {p.label}
          </motion.button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <select value={category} onChange={(e) => onCategory(e.target.value)} className="proj-select">
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={tech} onChange={(e) => onTech(e.target.value)} className="proj-select">
          <option value="all">All stacks</option>
          {techOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(e) => onSort(e.target.value)} className="proj-select">
          <option value="order">Display order</option>
          <option value="title">Title A–Z</option>
          <option value="tech">Most tech</option>
        </select>
      </div>
    </div>
  )
}
