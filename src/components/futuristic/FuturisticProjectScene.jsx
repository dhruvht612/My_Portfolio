import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { usePortfolio } from '../../context/PortfolioContext'
import { trackProjectClick } from '../../hooks/usePageView'
import { ArrowIcon, HudCorners, SectionHead, SplitHeading } from './shared'
import { featuredSystems, pad2, splitTitle } from './portfolioSystems'

/* Scene 2 — the project network. Each featured project is a subsystem with
   a live window onto its own district of the city; the rest are indexed. */
export default function FuturisticProjectScene() {
  const { projects } = usePortfolio()
  /* on /projects this is the page: its heading is the h1 and it doesn't link to itself */
  const own = useLocation().pathname === '/projects'
  const featured = useMemo(() => featuredSystems(projects), [projects])
  const rest = projects.filter((p) => !featured.some((f) => f.project === p))
  const Row = own ? 'div' : Link

  return (
    <section className="sec" id="projects" data-cam="2" data-name="Subsystems" aria-labelledby="projects-title">
      <SectionHead num="02" label="Subsystems" right={`${featured.length} systems online`} />
      <div className="proj-intro">
        <SplitHeading as={own ? 'h1' : 'h2'} id="projects-title" className="display h-sec" lines={['Every build is', 'a system in', 'the city.']} />
        <p className="body-lg" data-rv="up">
          Each project runs as its own district of the network: a live view into the system, what it does, and what it
          was built with.
        </p>
      </div>

      <div className="systems">
        {featured.map((s, i) => {
          const p = s.project
          return (
            <article key={p.id ?? s.name} className="system" data-focus={i} aria-labelledby={`sys-${i}`}>
              <div className="sys-view" data-view={s.view} data-rv="up">
                <span className="sys-fr" data-frame>
                  <HudCorners />
                  <span className="sys-lab" aria-hidden="true">
                    <b><span className="dot dot--blue" />{s.system}</b>
                    <span>Live</span>
                  </span>
                </span>
              </div>
              <div className="sys-info" data-rv="up">
                <div className="sys-num"><b>{pad2(i + 1)}</b> / Subsystem · {s.system}</div>
                <h3 id={`sys-${i}`}>{s.name}</h3>
                {s.tagline ? <div className="sys-sub">{s.tagline}</div> : null}
                <p className="body-lg">{p.description}</p>
                <dl className="sys-meta">
                  {p.achievement ? (
                    <div><dt>Result</dt><dd>{p.achievement}</dd></div>
                  ) : null}
                  {p.tech?.length ? (
                    <div>
                      <dt>Stack</dt>
                      <dd><ul className="chips">{p.tech.map((t) => <li key={t} className="chip">{t}</li>)}</ul></dd>
                    </div>
                  ) : null}
                  {p.badge?.label ? <div><dt>Class</dt><dd>{p.badge.label}</dd></div> : null}
                </dl>
                <div className="sys-links">
                  {s.code ? (
                    <a className="arrowlink" href={s.code} target="_blank" rel="noreferrer" onClick={() => trackProjectClick(p.id)}>
                      <span>GitHub</span><span className="ar"><ArrowIcon /></span>
                    </a>
                  ) : null}
                  {s.live ? (
                    <a className="arrowlink" href={s.live} target="_blank" rel="noreferrer" onClick={() => trackProjectClick(p.id)}>
                      <span>Live system</span><span className="ar"><ArrowIcon /></span>
                    </a>
                  ) : null}
                  {own ? null : (
                    <Link className="arrowlink" to="/projects">
                      <span>Open in archive</span><span className="ar"><ArrowIcon /></span>
                    </Link>
                  )}
                  {!s.code && !s.live ? <span className="muted">Links not published</span> : null}
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {rest.length ? (
        <div className="index" data-rv="up">
          <div className="index-head">
            <span className="mono">All systems · {projects.length}</span>
            {own ? null : <Link className="arrowlink" to="/projects"><span>Project archive</span><span className="ar"><ArrowIcon /></span></Link>}
          </div>
          <ol>
            {rest.map((p, i) => (
              <li key={p.id ?? p.title}>
                <Row {...(own ? {} : { to: '/projects' })}>
                  <span className="n">{pad2(featured.length + i + 1)}</span>
                  <span className="t">{splitTitle(p.title).name}</span>
                  <span className="s">{(p.tech ?? []).slice(0, 4).join(' · ')}</span>
                  <span className="st">
                    <span className={p.disabled ? 'dot' : 'dot dot--blue'} aria-hidden="true" />
                    {p.disabled ? p.badge?.label || 'In progress' : 'Built'}
                  </span>
                </Row>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  )
}
