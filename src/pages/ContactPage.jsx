import { usePortfolio } from '../context/PortfolioContext'
import Contact from '../components/Contact'

export default function ContactPage() {
  const { contactCards, heroSocials, altContactLinks } = usePortfolio()
  return (
    <main className="relative z-10 min-h-screen bg-transparent">
      <Contact contactCards={contactCards} heroSocials={heroSocials} altContactLinks={altContactLinks} />
    </main>
  )
}


