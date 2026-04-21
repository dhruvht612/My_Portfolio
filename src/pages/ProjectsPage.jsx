import { useMemo, useState } from 'react'
import { usePortfolio } from '../context/PortfolioContext'
import Projects from '../components/Projects'

export default function ProjectsPage() {
  const { PROJECT_FILTERS, projects, projectStats } = usePortfolio()
  const [projectFilter, setProjectFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const filteredProjects = useMemo(() => {
    const filter = projectFilter.toLowerCase().trim()
    const query = searchQuery.toLowerCase().trim()

    return projects.filter((p) => {
      const matchesFilter =
        filter === 'all'
          ? true
          : (p.categories ?? []).map((c) => String(c).toLowerCase().trim()).includes(filter)

      if (!matchesFilter) return false
      if (!query) return true

      const searchable = [
        p.title,
        p.description,
        ...(p.tech ?? []),
        ...(p.features ?? []),
      ]
        .join(' ')
        .toLowerCase()

      return searchable.includes(query)
    })
  }, [projectFilter, projects, searchQuery])

  const resetFilters = () => {
    setProjectFilter('all')
    setSearchQuery('')
  }

  return (
    <main className="relative z-10 min-h-screen bg-transparent">
      <Projects
      projectStats={projectStats}
      filters={PROJECT_FILTERS}
      projectFilter={projectFilter}
      onFilterChange={setProjectFilter}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onResetFilters={resetFilters}
      projects={filteredProjects}
      totalProjects={projects.length}
      />
    </main>
  )
}

