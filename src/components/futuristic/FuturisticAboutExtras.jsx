import { usePortfolio } from '../../context/PortfolioContext'
import { ArrowIcon, SectionHead, SplitHeading } from './shared'
import { isRealLink, pad2 } from './portfolioSystems'

/* /about past the core: the records the old Education, Certifications and
   Beyond pages held, read as more of the same system. No [data-cam] here, so
   the camera stays parked on the core while these scroll over it. */
export default function FuturisticAboutExtras() {
  const { quickStats, educationHighlights, certifications, beyondStats, goals } = usePortfolio()
  const grad = quickStats.find((s) => /graduat/i.test(s.label))

  return (
    <>
      <section className="sec" id="education" aria-labelledby="education-title">
        <SectionHead num="01.A" label="Education" right="Training data" />
        <SplitHeading id="education-title" className="display h-sec" lines={['Education.']} />
        <div className="boot" data-rv="up">
          <div className="boot-head" aria-hidden="true">
            <span>education.load()</span>
            <span><span className="dot dot--blue" />{grad ? `class of ${grad.value}` : 'enrolled'}</span>
          </div>
          <dl>
            <dt>Institution</dt><dd>Ontario Tech University</dd>
            {grad ? <><dt>Program</dt><dd>{grad.detail}</dd><dt>Graduating</dt><dd>{grad.value}</dd></> : null}
          </dl>
        </div>
        {educationHighlights?.length ? (
          <div className={`mods mods--${educationHighlights.length}`} data-rv="up" style={{ marginTop: 'clamp(30px,5vh,56px)' }}>
            {educationHighlights.map((h, i) => (
              <article key={h.title} className="mod" aria-labelledby={`edu-${i}`}>
                <div className="mod-head">
                  <h3 id={`edu-${i}`}>{h.title}</h3>
                  <span>{pad2(i + 1)}</span>
                </div>
                <ul className="bus">{(h.bullets ?? []).map((b) => <li key={b}><span className="nm">{b}</span></li>)}</ul>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <section className="sec" id="certifications" aria-labelledby="certifications-title">
        <SectionHead num="01.B" label="Certifications" right={`${certifications.length} records`} />
        <SplitHeading id="certifications-title" className="display h-sec" lines={['Certifications.']} />
        <div className="log" data-rv="up">
          <div className="log-bar" aria-hidden="true">
            <span>certs.verify()</span>
            <span>{certifications.length} on record</span>
          </div>
          {certifications.map((c) => (
            <details key={`${c.title}-${c.issued}`}>
              <summary>
                <span className="ts">{c.issued}</span>
                <span className="role">{c.title}</span>
                <span className="org">{c.issuer}</span>
                <span className="state">{c.category}</span>
                <span className="tog" aria-hidden="true">+</span>
              </summary>
              <div className="log-body">
                <div className="where">{[c.issuer, c.credentialId ? `ID ${c.credentialId}` : null].filter(Boolean).join(' · ')}</div>
                <ul>
                  {c.learned ? <li>Learned: {c.learned}</li> : null}
                  {c.applied ? <li>Applied: {c.applied}{c.appliedProject ? ` (${c.appliedProject})` : ''}</li> : null}
                </ul>
                {isRealLink(c.credentialUrl) ? (
                  <a className="arrowlink" href={c.credentialUrl} target="_blank" rel="noreferrer" style={{ marginTop: 14 }}>
                    <span>View credential</span><span className="ar"><ArrowIcon /></span>
                  </a>
                ) : null}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="sec" id="beyond" aria-labelledby="beyond-title">
        <SectionHead num="01.C" label="Beyond" right="Off the clock" />
        <SplitHeading id="beyond-title" className="display h-sec" lines={['Beyond the code.']} />
        {beyondStats?.length ? (
          <div className="stats" data-rv="up">
            {beyondStats.map((s) => <div key={s.label}><b>{s.value}</b><span>{s.label}</span></div>)}
          </div>
        ) : null}
        {goals?.length ? (
          <div className={`mods mods--${goals.length}`} data-rv="up" style={{ marginTop: 'clamp(30px,5vh,56px)' }}>
            {goals.map((g, i) => (
              <article key={g.title} className="mod" aria-labelledby={`goal-${i}`}>
                <div className="mod-head">
                  <h3 id={`goal-${i}`}>{g.title}</h3>
                  {g.badge ? <span>{g.badge}</span> : null}
                </div>
                <ul className="bus">{(g.bullets ?? []).map((b) => <li key={b}><span className="nm">{b}</span></li>)}</ul>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </>
  )
}
