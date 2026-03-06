import { usePortfolio } from '../context/PortfolioContext'
import Education from '../components/Education'

export default function EducationPage() {
  const { focusAreas, educationHighlights } = usePortfolio()
  return <Education focusAreas={focusAreas} highlightCards={educationHighlights} />
}
