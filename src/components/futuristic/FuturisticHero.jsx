import { memo } from 'react'
import { ArrowIcon, HudCorners, SplitHeading } from './shared'

/* Scene 0 — the city from the roof. Copy is the brief's, verbatim. */
function FuturisticHero() {
  return (
    <section className="hero" id="hero" data-cam="0" data-name="City overview" aria-labelledby="hero-title">
      <div className="hero-top">
        <div className="eyebrow" data-rv="fade">
          <span className="dot dot--live" aria-hidden="true" />Software Engineer / AI Builder
        </div>
        <SplitHeading
          as="h1"
          id="hero-title"
          className="display h-hero"
          lines={['Building intelligent', 'systems for a', 'smarter tomorrow.']}
          lineClass={[null, null, 'sig']}
        />
        <p className="hero-sub body-lg" data-rv="up">
          I&apos;m Dhruv Thakar, a Computer Science student at Ontario Tech University specializing in Artificial
          Intelligence. I build AI-powered products, full-stack systems, and developer experiences that turn ambitious
          ideas into working software.
        </p>
        <div className="hero-actions" data-rv="up">
          <a className="cta cta--signal" href="#projects">
            <i aria-hidden="true" /><span>View projects</span><ArrowIcon />
          </a>
          <a className="arrowlink" href="#about">
            <span>Learn more</span><span className="ar"><ArrowIcon /></span>
          </a>
        </div>
      </div>

      <div className="hero-spacer" />

      <div className="hero-foot">
        <a className="hero-cue" href="#about" data-rv="fade">
          <span className="arrow" aria-hidden="true">↓</span><span>Scroll</span>
        </a>
      </div>

      {/* a live window onto the core's crown, rendered by the engine into this frame */}
      <a className="peek" href="#about" data-view="core" data-rv="fade" aria-label="Live view of the AI core. Go to Identity">
        <span className="peek-fr" data-frame><HudCorners /></span>
        <span className="peek-cap">
          <b><span className="dot dot--blue" aria-hidden="true" />AI core · live</b>
          <span>Feed 01</span>
        </span>
      </a>

      <div className="hero-side" data-rv="fade" aria-hidden="true">
        <span className="v">DHRUV THAKAR // AI SYSTEM</span>
      </div>
    </section>
  )
}

export default memo(FuturisticHero)
