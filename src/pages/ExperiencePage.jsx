import { usePortfolio } from '../context/PortfolioContext'
import Experience from '../components/Experience'

export default function ExperiencePage() {
  const { experienceByOrg } = usePortfolio()
  return <Experience experienceByOrg={experienceByOrg} />
}
