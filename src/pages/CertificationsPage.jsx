import { usePortfolio } from '../context/PortfolioContext'
import CertificationsSection from '../components/Certifications'

export default function CertificationsPage() {
  const { certifications } = usePortfolio()
  return <CertificationsSection certifications={certifications} />
}
