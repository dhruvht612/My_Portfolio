import { useEffect, useRef, useState } from 'react'
import { usePortfolio } from '../context/PortfolioContext'
import Hero from '../components/Hero'

export default function HomePage() {
  const { typedRoles, heroSocials, quickStats } = usePortfolio()
  const [typedText, setTypedText] = useState('')
  const typedRoleRef = useRef(0)
  const typedCharRef = useRef(0)
  const typedDeletingRef = useRef(false)

  useEffect(() => {
    const interval = setInterval(() => {
      const currentRole = typedRoles[typedRoleRef.current]
      if (!typedDeletingRef.current) {
        typedCharRef.current += 1
        if (typedCharRef.current >= currentRole.length) typedDeletingRef.current = true
      } else {
        typedCharRef.current -= 1
        if (typedCharRef.current <= 0) {
          typedDeletingRef.current = false
          typedRoleRef.current = (typedRoleRef.current + 1) % typedRoles.length
        }
      }
      setTypedText(currentRole.slice(0, typedCharRef.current))
    }, 120)
    return () => clearInterval(interval)
  }, [typedRoles])

  return (
    <div className="theme-dark-blue-hero-bg min-h-screen">
      <Hero typedText={typedText} heroSocials={heroSocials} quickStats={quickStats} />
    </div>
  )
}
