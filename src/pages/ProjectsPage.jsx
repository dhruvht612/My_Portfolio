import { useMemo, useState } from 'react'
import { usePortfolio } from '../context/PortfolioContext'
import Projects from '../components/Projects'

export default function ProjectsPage() {
  const { PROJECT_FILTERS, projects, projectStats } = usePortfolio()
  const [projectFilter, setProjectFilter] = useState('all')
  const filteredProjects = useMemo(() => {
    if (projectFilter === 'all') return projects
    const filter = projectFilter.toLowerCase().trim()
    return projects.filter((p) => (p.categories ?? []).map((c) => String(c).toLowerCase().trim()).includes(filter))
  }, [projectFilter, projects])
  return (
    <Projects
      projectStats={projectStats}
      filters={PROJECT_FILTERS}
      projectFilter={projectFilter}
      onFilterChange={setProjectFilter}
      projects={filteredProjects}
    />
  )
}
