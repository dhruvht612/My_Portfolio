import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FolderOpen } from 'lucide-react'
import EmptyState from '../EmptyState'
import ProjectCard from './ProjectCard'
import ProjectsAmbient from './ProjectsAmbient'
import ProjectsFeaturedSpotlight from './ProjectsFeaturedSpotlight'
import ProjectsFilters from './ProjectsFilters'
import ProjectsHero from './ProjectsHero'
import ProjectsIntelligence from './ProjectsIntelligence'
import { filterProjects, topTechStacks } from './projectInsights'

export default function ProjectsWorkspace({
  rows,
  loading,
  error,
  onEdit,
  onDelete,
  onToggleFeatured,
  onAdd,
  canEdit,
}) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [tech, setTech] = useState('all')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState('order')
  const [expandedId, setExpandedId] = useState(null)

  const categories = useMemo(() => {
    const s = new Set()
    for (const r of rows) {
      for (const c of r.categories || []) {
        if (c) s.add(String(c).toLowerCase())
      }
    }
    return [...s].sort()
  }, [rows])

  const techOptions = useMemo(() => topTechStacks(rows, 20).map(([t]) => t), [rows])

  const filtered = useMemo(
    () => filterProjects(rows, { query, category, tech, status, sort }),
    [rows, query, category, tech, status, sort],
  )

  const featuredProject = useMemo(() => {
    const f = rows.find((r) => r.is_featured)
    return f || rows.find((r) => !r.is_disabled) || rows[0]
  }, [rows])

  const showSpotlight = featuredProject && status !== 'disabled' && !query

  if (loading) return null

  return (
    <ProjectsAmbient className="border border-white/[0.06] p-3 md:p-4">
      <motion.div className="space-y-4">
        <ProjectsHero rows={rows} />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(260px,300px)]">
          <div className="min-w-0 space-y-4">
            <ProjectsFilters
              query={query}
              onQuery={setQuery}
              category={category}
              onCategory={setCategory}
              tech={tech}
              onTech={setTech}
              status={status}
              onStatus={setStatus}
              sort={sort}
              onSort={setSort}
              categories={categories}
              techOptions={techOptions}
            />

            {error ? (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error.message}</p>
            ) : null}

            {showSpotlight ? (
              <ProjectsFeaturedSpotlight project={featuredProject} onEdit={onEdit} />
            ) : null}

            {!filtered.length ? (
              <EmptyState
                title="No projects match"
                message={rows.length ? 'Try adjusting filters or search.' : 'Add your first project to populate the showcase.'}
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {filtered.map((row, index) => (
                  <ProjectCard
                    key={row.id}
                    row={row}
                    index={index}
                    expanded={expandedId === row.id}
                    onToggleExpand={() => setExpandedId((id) => (id === row.id ? null : row.id))}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleFeatured={canEdit ? onToggleFeatured : undefined}
                  />
                ))}
              </div>
            )}

            {canEdit && !rows.length ? (
              <button type="button" onClick={onAdd} className="proj-add-empty flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-8 text-sm text-slate-400 hover:border-sky-400/35 hover:text-slate-200">
                <FolderOpen className="h-4 w-4" />
                Create first project
              </button>
            ) : null}
          </div>

          <ProjectsIntelligence rows={rows} />
        </div>
      </motion.div>
    </ProjectsAmbient>
  )
}
