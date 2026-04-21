import { usePortfolio } from '../context/PortfolioContext'
import CertificationsSection from '../components/Certifications'

export default function CertificationsPage() {
  const { certifications } = usePortfolio()
  return (
    <main className="relative z-10 min-h-screen bg-transparent">
      <CertificationsSection certifications={certifications} />
    </main>
  )
}


