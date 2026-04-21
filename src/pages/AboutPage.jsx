import { useState } from 'react'
import { usePortfolio } from '../context/PortfolioContext'
import About from '../components/About'

export default function AboutPage() {
  const { aboutTabs, aboutCounters } = usePortfolio()
  const [aboutTab, setAboutTab] = useState('story')
  return (
    <main className="relative z-10 min-h-screen bg-transparent">
      <About aboutTab={aboutTab} setAboutTab={setAboutTab} aboutTabs={aboutTabs} aboutCounters={aboutCounters} />
    </main>
  )
}

