import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { usePortfolio } from '../../context/PortfolioContext'
import { ArrowIcon, SectionHead, SplitHeading } from './shared'
import { experienceLog } from './portfolioSystems'

/* Scene 3 — the highway: experience as a system log. One line per role;
   each opens (native <details>, so keyboard and screen readers get it free)
   into the record's own description. */
export default function FuturisticExperience() {
  const { experienceByOrg } = usePortfolio()
  const log = useMemo(() => experienceLog(experienceByOrg), [experienceByOrg])
  const active = log.filter((e) => e.live).length

  return (
    <section className="sec" id="experience" data-cam="3" data-name="System log" aria-labelledby="experience-title">
      <SectionHead num="03" label="System log" right={`${log.length} entries`} />
      <div className="log-head">
        <SplitHeading id="experience-title" className="display h-sec" lines={['Every role,', 'logged.']} />
        <p className="body-lg" data-rv="up">Roles from the record, newest first. Open an entry for the full log.</p>
      </div>

      <div className="log" data-rv="up">
        <div className="log-bar" aria-hidden="true">
          <span>sys.log --roles</span>
          <span>{active} active · {log.length - active} closed</span>
        </div>
        {log.map((e, i) => (
          <details key={`${e.org}-${e.title}-${i}`}>
            <summary>
              <span className="ts">{e.start ?? '----.--'} → {e.end ?? '----.--'}</span>
              <span className="role">{e.title}</span>
              <span className="org">{e.org}</span>
              <span className={`state${e.live ? ' live' : ''}`}>
                <span className={e.live ? 'dot dot--live' : 'dot dot--blue'} aria-hidden="true" />
                {e.live ? 'Active' : 'Closed'}
              </span>
              <span className="tog" aria-hidden="true">+</span>
            </summary>
            <div className="log-body">
              <div className="where">{[e.org, e.orgSub, e.location, e.workMode].filter(Boolean).join(' · ')}</div>
              {e.description ? <p>{e.description}</p> : null}
              {e.bullets?.length ? <ul>{e.bullets.map((b) => <li key={b}>{b}</li>)}</ul> : null}
            </div>
          </details>
        ))}
      </div>
      <div className="log-foot" data-rv="fade">
        <Link className="arrowlink" to="/experience"><span>Full experience record</span><span className="ar"><ArrowIcon /></span></Link>
      </div>
    </section>
  )
}
