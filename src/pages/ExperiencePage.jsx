import { usePortfolio } from '../context/PortfolioContext'
import Experience from '../components/Experience'

export default function ExperiencePage() {
  const { experienceByOrg } = usePortfolio()
  return (
    <main className="relative z-10 min-h-screen bg-transparent">
      <Experience experienceByOrg={experienceByOrg} />
    </main>
  )
}


