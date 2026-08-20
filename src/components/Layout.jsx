import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { usePortfolio } from '../context/PortfolioContext'
import { usePageView } from '../hooks/usePageView'
import SkipLink from './SkipLink'
import Header from './Header'
import Footer from './Footer'
import ScrollToTop from './ScrollToTop'

/* Hysteresis band for the nav shell. The pill compacts only after passing
   COMPACT_ENTER and expands only after falling back below COMPACT_EXIT, so
   hovering the threshold (or a rubber-band scroll) can never flicker it the way a
   single 50px trip point did. */
const COMPACT_ENTER = 64
const COMPACT_EXIT = 40

const pageVariants = {
  initial: { opacity: 0, y: 18 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
}

export default function Layout() {
  usePageView()
  const portfolio = usePortfolio()
  const location = useLocation()
  /* Two refs rather than walking the DOM: the fill element takes the width, the track
     element carries role="progressbar" and its aria-valuenow. Reaching for
     `.parentElement` from here would couple Layout to Header's markup shape. */
  const scrollProgressRef = useRef(null)
  const scrollProgressTrackRef = useRef(null)

  const pathname = location.pathname
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false)
  /* Mirrors isHeaderScrolled for the rAF callback: the scroll effect is recreated on
     every route change, so the current side of the hysteresis band has to live
     outside it. Kept in sync only where setIsHeaderScrolled is called. */
  const isCompactRef = useRef(false)
  /* Cached scroll extent. Reading scrollHeight/clientHeight forces a synchronous
     layout, and doing that inside the scroll rAF meant one forced reflow per frame
     for the whole page. The extent only changes when content or the viewport does,
     so it is measured on those events instead. */
  const scrollExtentRef = useRef(0)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    const measureExtent = () => {
      const doc = document.documentElement
      scrollExtentRef.current = doc.scrollHeight - doc.clientHeight
    }

    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const extent = scrollExtentRef.current
          const scrolled = extent > 0 ? (window.scrollY / extent) * 100 : 0
          if (scrollProgressRef.current) scrollProgressRef.current.style.width = `${scrolled}%`
          scrollProgressTrackRef.current?.setAttribute('aria-valuenow', String(Math.round(scrolled)))
          // Only crosses the band edge -> only one setState per actual change.
          const y = window.scrollY
          const shouldFlip = isCompactRef.current ? y < COMPACT_EXIT : y > COMPACT_ENTER
          if (shouldFlip) {
            isCompactRef.current = !isCompactRef.current
            setIsHeaderScrolled(isCompactRef.current)
          }
          ticking = false
        })
        ticking = true
      }
    }

    measureExtent()
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', measureExtent)
    /* Lazy routes and images grow the document after mount; without this the bar
       would be calibrated against the pre-hydration height for the whole visit. */
    const resizeObserver = new ResizeObserver(measureExtent)
    resizeObserver.observe(document.documentElement)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', measureExtent)
      resizeObserver.disconnect()
    }
  }, [pathname])

  return (
    <div className="min-h-screen text-[var(--color-text)]" style={{ position: 'relative', background: 'transparent' }}>
      <div style={{ position: 'relative', zIndex: 1, background: 'transparent' }}>
        <SkipLink />
        <Header
          navLinks={portfolio.navLinks}
          isHeaderScrolled={isHeaderScrolled}
          scrollProgressRef={scrollProgressRef}
          scrollProgressTrackRef={scrollProgressTrackRef}
        />
        {/* Offset comes from the same token the nav geometry does, so the two cannot
            drift. The previous hardcoded 88px was short of the real 108px expanded
            height, tucking the top of every page under the pill. */}
        <main id="main-content" className="nav-offset-top relative z-10 min-h-screen">
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
        <Footer />
        <ScrollToTop />
      </div>
    </div>
  )
}
