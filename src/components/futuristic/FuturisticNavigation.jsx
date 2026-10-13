import { memo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { DTMark } from './shared'

/* [route, label, the section that route's camera stands on]. On / the engine
   lights the link whose section is in view; on a page it is that page's own. */
const LINKS = [
  ['/', 'Home', '#hero'],
  ['/projects', 'Projects', '#projects'],
  ['/experience', 'Experience', '#experience'],
  ['/about', 'About', '#about'],
  ['/skills', 'Skills', '#skills'],
  ['/contact', 'Contact', '#contact'],
]

/* Kage's bar: brand left, links right, the burger below 820px. The engine
   owns its scroll states (stuck / hide / lit link / open sheet); the router
   owns which page is current. Plain Link, not NavLink: NavLink rewrites the
   class and would wipe the engine's `.on`. */
function FuturisticNavigation() {
  const { pathname } = useLocation()
  return (
    <header className="nav" id="nav">
      <Link className="brand" to="/" aria-label="Dhruv Thakar, home">
        <DTMark />
        <span className="brand-tx"><b>Dhruv Thakar</b><i>AI SYSTEM · 2026</i></span>
      </Link>
      <nav aria-label="Primary" className="nav-links" id="navlinks">
        {LINKS.map(([to, label, sec]) => (
          <Link key={to} className="nav-link" to={to} data-sec={sec} aria-current={pathname === to ? 'page' : undefined}>
            <span>{label}</span>
            <span className="alt" aria-hidden="true">[ {label} ]</span>
          </Link>
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
