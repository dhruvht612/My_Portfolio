import { usePortfolio } from '../context/PortfolioContext'
import Contact from '../components/Contact'

export default function ContactPage() {
  const { contactCards, heroSocials, altContactLinks } = usePortfolio()
  return <Contact contactCards={contactCards} heroSocials={heroSocials} altContactLinks={altContactLinks} />
}
