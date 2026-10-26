import { useEffect, useLayoutEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import ErrorBoundary from '../ErrorBoundary'
import { usePortfolio } from '../../context/PortfolioContext'
import { usePageView } from '../../hooks/usePageView'
import { mountKageCity } from './engine/kageCity'
import FuturisticHUD from './FuturisticHUD'
import FuturisticNavigation from './FuturisticNavigation'
import './futuristic.css'


/* DHRUV THAKAR // AI SYSTEM. One city under every public page: the Kage
   engine mounts once here and stays up across routes. Each page is plain,
   readable HTML from the portfolio data, and its sections (one [data-cam]
   each) tell the engine where on the camera path that page stands. */
export default function CityLayout() {
  usePageView()
  const portfolio = usePortfolio()
  const { key, pathname } = useLocation()
  const rootRef = useRef(null)
  const engineRef = useRef(null)

  useEffect(() => {
    const html = document.documentElement
    html.classList.add('dt-city-page')
    if (!window.location.hash) window.scrollTo(0, 0)
    const engine = mountKageCity(rootRef.current)
    engineRef.current = engine
    return () => {
      engine.dispose()
      engineRef.current = null
      html.classList.remove('dt-city-page')
    }
  }, [])

  /* A new route under the same city. Layout effect, so the engine re-measures
     before its next frame reads the old page's anchors; a no-op on first
     mount, where boot() takes the first page. */
  useLayoutEffect(() => {
    engineRef.current?.setPage()
  }, [key])

  /* Supabase data lands after the first paint: re-measure the scenes and
     pick up any live windows the new markup brought with it */
  useEffect(() => {
    engineRef.current?.refresh()
  }, [portfolio])

  return (
    <div className="dt-city" ref={rootRef}>
      <a className="skip" href="#main">Skip to content</a>
      <FuturisticHUD />
      <FuturisticNavigation />
      <main className="page" id="main">
        {/* a page that throws resets on the next route instead of taking the city down */}
        <ErrorBoundary key={pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}
