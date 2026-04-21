import { usePortfolio } from '../context/PortfolioContext'
import Skills from '../components/Skills'

export default function SkillsPage() {
  const { skillGroups, projects } = usePortfolio()
  return (
    <main className="relative z-10 min-h-screen bg-transparent">
      <Skills skillGroups={skillGroups} projects={projects} />
    </main>
  )
}


