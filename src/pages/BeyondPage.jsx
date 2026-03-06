import { usePortfolio } from '../context/PortfolioContext'
import Beyond from '../components/Beyond'

export default function BeyondPage() {
  const { beyondStats, goals } = usePortfolio()
  return <Beyond beyondStats={beyondStats} goals={goals} />
}
