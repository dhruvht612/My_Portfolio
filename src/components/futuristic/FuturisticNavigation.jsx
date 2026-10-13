import { memo } from 'react'
import { DTMark } from './shared'

const LINKS = [
  ['#hero', 'Home'],
  ['#projects', 'Projects'],
  ['#experience', 'Experience'],
  ['#about', 'About'],
  ['#contact', 'Contact'],
]

/* Kage's bar: brand left, links right, the burger below 820px. The engine
   owns its scroll states (stuck / hide / active link / open sheet). */
function FuturisticNavigation() {
  return (
    <header className="nav" id="nav">
      <a className="brand" href="#hero" aria-label="Dhruv Thakar, back to the top">
        <DTMark />
        <span className="brand-tx"><b>Dhruv Thakar</b><i>AI SYSTEM · 2026</i></span>
      </a>
      <nav aria-label="Primary" className="nav-links" id="navlinks">
        {LINKS.map(([href, label]) => (
          <a key={href} className="nav-link" href={href}>
            <span>{label}</span>
            <span className="alt" aria-hidden="true">[ {label} ]</span>
          </a>
        ))}
      </nav>
      <span className="nav-status"><span className="dot dot--live" aria-hidden="true" />SYSTEM ONLINE</span>
      <button className="nav-burger" type="button" aria-label="Menu" aria-controls="navlinks" aria-expanded="false">
        <i /><i />
      </button>
    </header>
  )
}

export default memo(FuturisticNavigation)
