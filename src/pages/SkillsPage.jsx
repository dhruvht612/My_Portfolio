import { usePortfolio } from '../context/PortfolioContext'
import Skills from '../components/Skills'

export default function SkillsPage() {
  const { skillGroups, projects } = usePortfolio()
  return <Skills skillGroups={skillGroups} projects={projects} />
}
