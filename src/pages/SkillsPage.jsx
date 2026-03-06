import { usePortfolio } from '../context/PortfolioContext'
import Skills from '../components/Skills'

export default function SkillsPage() {
  const { skillGroups } = usePortfolio()
  return <Skills skillGroups={skillGroups} />
}
