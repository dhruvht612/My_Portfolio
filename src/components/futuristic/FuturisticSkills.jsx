import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { usePortfolio } from '../../context/PortfolioContext'
import { ArrowIcon, SectionHead, SplitHeading } from './shared'
import { pad2, skillModules } from './portfolioSystems'

/* Scene 4 — the infrastructure: each skill group a module, each skill a node
   on its trunk. The last module is what the projects actually shipped with. */
export default function FuturisticSkills() {
  const { skillGroups, projects } = usePortfolio()
  const mods = useMemo(() => skillModules(skillGroups, projects), [skillGroups, projects])

  return (
    <section className="sec" id="skills" data-cam="4" data-name="Technology" aria-labelledby="skills-title">
      <SectionHead num="04" label="Technology" right={`${mods.length} modules`} />
      <div className="log-head">
        <SplitHeading id="skills-title" className="display h-sec" lines={['The stack,', 'as infrastructure.']} />
        <p className="body-lg" data-rv="up">
          Each module is one group from the skills record. The last is read from the projects: the tools they shipped
          with beyond those groups.
        </p>
      </div>
      <div className="mods" data-rv="up">
        {mods.map((m, i) => (
          <article key={m.title} className="mod" aria-labelledby={`mod-${i}`}>
            <div className="mod-head">
              <h3 id={`mod-${i}`}>{m.title}</h3>
              <span>{pad2(i + 1)} · {m.items.length} nodes</span>
            </div>
            <ul className="bus">
              {m.items.map((it) => (
                <li key={it.name}><span className="nm">{it.name}</span><span className="lv">{it.level}</span></li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <div className="log-foot" data-rv="fade">
        <Link className="arrowlink" to="/skills"><span>Skills in detail</span><span className="ar"><ArrowIcon /></span></Link>
      </div>
    </section>
  )
}
