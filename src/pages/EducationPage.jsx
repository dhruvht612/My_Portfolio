import { usePortfolio } from '../context/PortfolioContext'
import Education from '../components/Education'

export default function EducationPage() {
  const { focusAreas, educationHighlights } = usePortfolio()
  return (
    <main className="relative z-10 min-h-screen bg-transparent">
      <Education focusAreas={focusAreas} highlightCards={educationHighlights} />
    </main>
  )
}


