import { usePortfolio } from '../../context/PortfolioContext'
import { SectionHead, SplitHeading } from './shared'

/* Scene 1 — the AI core: identity, read out as a system initialising.
   Everything below the heading is the data layer's own words. */
export default function FuturisticAbout() {
  const { aboutTabs, focusAreas, quickStats, contactCards, beyondStats, projects } = usePortfolio()
  /* the heading already says hello, so a greeting-only opener is skipped */
  const story = (aboutTabs?.story ?? []).filter((p) => !/^(hey|hi|hello)\b/i.test(p))
  const grad = quickStats.find((s) => /graduat/i.test(s.label))
  const card = (t) => contactCards.find((c) => c.title === t)?.value
  const rows = [
    ['Identity', 'Dhruv Thakar'],
    grad ? ['Program', `${grad.detail} · graduating ${grad.value}`] : null,
    card('Location') ? ['Location', card('Location')] : null,
    card('Availability') ? ['Status', card('Availability')] : null,
    focusAreas?.length ? ['Focus', focusAreas] : null,
    aboutTabs?.interests?.length ? ['Modules', aboutTabs.interests.map((i) => i.title)] : null,
  ].filter(Boolean)
  const stats = [{ value: String(projects.length), label: 'Projects' }, ...(beyondStats ?? []).slice(0, 3)]

  return (
    <section className="sec" id="about" data-cam="1" data-name="Identity" aria-labelledby="about-title">
      <SectionHead num="01" label="Identity" right="AI core · init" />
      <div className="id-grid">
        <SplitHeading
          id="about-title"
          className="display h-sec"
          lines={["I'm Dhruv.", 'I build systems that think,', 'connect, and scale.']}
        />
        <div className="id-copy">
          {story.map((p, i) => (
            <p key={i} className={i === 0 ? 'lead' : 'body-lg'} data-rv="up">{p}</p>
          ))}
        </div>
      </div>

      <div className="boot" data-rv="up">
        <div className="boot-head" aria-hidden="true">
          <span>identity.init()</span>
          <span><span className="dot dot--blue" />ready</span>
        </div>
        <dl>
          {rows.map(([k, v]) => (
            <div key={k} style={{ display: 'contents' }}>
              <dt>{k}</dt>
              <dd>{Array.isArray(v) ? v.map((t) => <span key={t} className="tag">{t}</span>) : v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="stats" data-rv="up">
        {stats.map((s) => (
          <div key={s.label}><b>{s.value}</b><span>{s.label}</span></div>
        ))}
      </div>
    </section>
  )
}
