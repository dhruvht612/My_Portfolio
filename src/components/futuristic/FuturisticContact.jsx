import { Link, useLocation } from 'react-router-dom'
import { usePortfolio } from '../../context/PortfolioContext'
import { ArrowIcon, SectionHead, SplitHeading } from './shared'

const YEAR = new Date().getFullYear()
const shown = (href) => href.replace(/^mailto:/, '').replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

/* Scene 5 — the highest point: the city goes quiet, the core in the distance.
   /contact passes the message form in as children. */
export default function FuturisticContact({ children }) {
  const { heroSocials, altContactLinks, navLinks } = usePortfolio()
  const social = (name) => heroSocials.find((s) => s.tooltip === name)
  const links = ['GitHub', 'LinkedIn', 'Email'].map(social).filter(Boolean)
  const resumes = altContactLinks.filter((l) => /^resume/i.test(l.label))
  const own = useLocation().pathname === '/contact'

  return (
    <section className="sec fin" id="contact" data-cam="5" data-name="Connection" aria-labelledby="contact-title">
      <SectionHead num="05" label="Connection" right="Uplink open" />
      <SplitHeading
        as={own ? 'h1' : 'h2'}
        id="contact-title"
        className="display"
        lines={["Let's build", 'something', 'intelligent.']}
        lineClass={[null, null, 'sig']}
      />
      <div className="fin-who" data-rv="up">
        <b>Dhruv Thakar</b>
        <span className="mono">Software Engineer / AI Builder</span>
      </div>

      <div className="fin-links" data-rv="up">
        {links.map((l) => {
          const external = /^https?:/.test(l.href)
          return (
            <a key={l.tooltip} href={l.href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})} aria-label={l.label}>
              <span className="k"><span>{l.tooltip}</span><ArrowIcon /></span>
              <span className="v">{shown(l.href)}</span>
            </a>
          )
        })}
        {resumes.length ? (
          <div>
            <span className="k"><span>Resume</span></span>
            <span className="sub">
              {resumes.map((r) => (
                <a key={r.href} href={r.href} download={r.download}>{r.label.replace(/^Resume\s*·\s*/i, '')} · PDF</a>
              ))}
            </span>
          </div>
        ) : null}
      </div>

      <div className="fin-actions" data-rv="fade">
        <Link className="cta cta--signal" to="/contact#message"><i aria-hidden="true" /><span>Send a message</span><ArrowIcon /></Link>
        <span className="mono"><span className="dot dot--live" aria-hidden="true" /> System online</span>
      </div>

      {children}

      <footer className="foot">
        <nav className="foot-routes" aria-label="Site pages">
          {navLinks.filter((l) => l.id !== 'home').map((l) => <Link key={l.id} to={l.path}>{l.label}</Link>)}
          <Link to="/admin" rel="nofollow">Admin panel</Link>
        </nav>
        <div className="foot-base">
          <span>© {YEAR} Dhruv Thakar</span>
          <span><span className="dot dot--blue" aria-hidden="true" />DHRUV THAKAR // AI SYSTEM</span>
          <span>WebGL · three.js r149 · Kage engine</span>
        </div>
      </footer>
    </section>
  )
}
