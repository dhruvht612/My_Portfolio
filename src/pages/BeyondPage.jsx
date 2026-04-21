import { usePortfolio } from '../context/PortfolioContext'
import Beyond from '../components/Beyond'

export default function BeyondPage() {
  const { beyondStats, goals } = usePortfolio()
  return (
    <main className="relative z-10 min-h-screen bg-transparent">
      <Beyond beyondStats={beyondStats} goals={goals} />
    </main>
  )
}


