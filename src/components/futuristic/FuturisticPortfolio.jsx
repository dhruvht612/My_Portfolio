import { useEffect, useRef } from 'react'
import { usePortfolio } from '../../context/PortfolioContext'
import { usePageView } from '../../hooks/usePageView'
import { mountKageCity } from './engine/kageCity'
import FuturisticHUD from './FuturisticHUD'
import FuturisticNavigation from './FuturisticNavigation'
import FuturisticHero from './FuturisticHero'
import FuturisticAbout from './FuturisticAbout'
import FuturisticProjectScene from './FuturisticProjectScene'
import FuturisticExperience from './FuturisticExperience'
import FuturisticSkills from './FuturisticSkills'
import FuturisticContact from './FuturisticContact'
import './futuristic.css'

const TITLE = 'Dhruv Thakar — Software Engineer / AI Builder'

/* DHRUV THAKAR // AI SYSTEM. The page is plain, readable HTML rendered from
   the portfolio data; the Kage engine mounts underneath it and drives the
   city from the page's own sections (one [data-cam] each). */
export default function FuturisticPortfolio() {
  usePageView()
  const { projects, experienceByOrg, skillGroups } = usePortfolio()
  const rootRef = useRef(null)
  const engineRef = useRef(null)

  useEffect(() => {
    const html = document.documentElement
    const prevTitle = document.title
    html.classList.add('dt-city-page')
    document.title = TITLE
    if (!window.location.hash) window.scrollTo(0, 0)
    const engine = mountKageCity(rootRef.current)
    engineRef.current = engine
    return () => {
      engine.dispose()
      engineRef.current = null
      html.classList.remove('dt-city-page')
      document.title = prevTitle
    }
  }, [])

  /* Supabase data lands after the first paint: re-measure the scenes and
     pick up any live windows the new markup brought with it */
  useEffect(() => {
    engineRef.current?.refresh()
  }, [projects, experienceByOrg, skillGroups])

  return (
    <div className="dt-city" ref={rootRef}>
      <a className="skip" href="#main">Skip to content</a>
      <FuturisticHUD />
      <FuturisticNavigation />
      <main className="page" id="main">
        <FuturisticHero />
        <FuturisticAbout />
        <FuturisticProjectScene />
        <FuturisticExperience />
        <FuturisticSkills />
        <FuturisticContact />
      </main>
    </div>
  )
}
