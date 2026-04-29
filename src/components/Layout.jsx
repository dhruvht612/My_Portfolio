import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { usePortfolio } from '../context/PortfolioContext'
import { useActiveSection } from '../hooks/useActiveSection'
import SkipLink from './SkipLink'
import Header from './Header'
import Footer from './Footer'
import ScrollToTop from './ScrollToTop'

const pageVariants = {
  initial: { opacity: 0, y: 18 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
}

export default function Layout() {
  const portfolio = usePortfolio()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const scrollProgressRef = useRef(null)

  const pathname = location.pathname
  const pathSection = pathname.slice(1) || 'home'
  const activeSection = useActiveSection(pathSection)
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollableHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
          const scrolled = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0
          if (scrollProgressRef.current) scrollProgressRef.current.style.width = `${scrolled}%`
          setIsHeaderScrolled(window.scrollY > 50)
          ticking = false
        })
        ticking = true
      }
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [pathname])

  const toggleMenu = () => setIsMenuOpen((p) => !p)
  const closeMenu = () => setIsMenuOpen(false)

  return (
    <div className="min-h-screen text-[var(--color-text)]" style={{ position: 'relative', background: 'transparent' }}>
      <div style={{ position: 'relative', zIndex: 1, background: 'transparent' }}>
        <SkipLink />
        <Header
          navLinks={portfolio.navLinks}
          activeSection={activeSection}
          isHeaderScrolled={isHeaderScrolled}
          isMenuOpen={isMenuOpen}
          onToggleMenu={toggleMenu}
          onCloseMenu={closeMenu}
          scrollProgressRef={scrollProgressRef}
          fixed={true}
        />
        <main id="main-content" className="pt-[72px] relative z-10 min-h-screen">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              variants={pageVariants}
              initial="initial"
              animate="enter"
              exit="exit"
              className="page-transition-wrapper"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        <Footer navLinks={portfolio.navLinks} heroSocials={portfolio.heroSocials} footerBadges={portfolio.footerBadges} />
        <ScrollToTop />
      </div>
    </div>
  )
}
