import { useEffect, useRef, useState } from 'react'
import SpaceBackground from './SpaceBackground'

const DESCRIPTION_PREVIEW_LENGTH = 220

function Experience({ experienceByOrg }) {
  const [expandedDescriptions, setExpandedDescriptions] = useState({})
  const [visibleCards, setVisibleCards] = useState({})
  const cardRefs = useRef([])

  const toggleDescription = (key) => {
    setExpandedDescriptions((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = entry.target.getAttribute('data-experience-index')
            if (index != null) setVisibleCards((prev) => ({ ...prev, [index]: true }))
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    )
    cardRefs.current.forEach((el) => {
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [experienceByOrg.length])

  return (
    <section
      id="experience"
      className="py-20 px-6 bg-[var(--color-bg)] text-[var(--color-text)] relative overflow-hidden"
      aria-labelledby="experience-heading"
    >
      <SpaceBackground />
      <div
        className="absolute inset-0 bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-bg-elevated)]/50 to-[var(--color-bg-elevated)]"
        aria-hidden="true"
      />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Sticky section title */}
        <header
          className="glass sticky top-0 z-20 -mx-6 px-6 pt-2 pb-6 mb-10 border-b border-[var(--glass-border)]"
          style={{ marginTop: '-0.5rem' }}
        >
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="h-1 w-12 bg-gradient-to-r from-transparent to-[var(--color-accent)] rounded-full" />
              <i className="fas fa-briefcase text-4xl text-[var(--color-accent)]" />
              <div className="h-1 w-12 bg-gradient-to-l from-transparent to-[var(--color-blue)] rounded-full" />
            </div>
            <h2 id="experience-heading" className="text-4xl md:text-5xl font-extrabold mb-3">
              Experience
            </h2>
            <p className="text-[var(--color-text-muted)] text-lg">Leadership, outreach, and community roles</p>
          </div>
        </header>

        {/* Timeline: vertical line down the center */}
        <div className="relative">
          <div
            className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-gradient-to-b from-[var(--color-accent)]/50 via-[var(--color-blue)] to-[var(--color-accent)]/50 rounded-full"
            aria-hidden="true"
          />

          <div className="space-y-12">
            {experienceByOrg.map((orgBlock, index) => {
              const isLeft = index % 2 === 0
              const setRef = (el) => {
                cardRefs.current[index] = el
              }
              const isVisible = visibleCards[index]
              const cardClass = `experience-card glass w-full max-w-xl rounded-2xl overflow-hidden shadow-lg hover:border-[var(--color-accent)]/40 hover:shadow-[0_0_30px_rgba(125,211,252,0.08)] ${isVisible ? 'animate-in' : ''}`
              const cardContent = (
                <>
                  <OrgHeader orgBlock={orgBlock} />
                  <RoleCards orgBlock={orgBlock} expandedDescriptions={expandedDescriptions} onToggle={toggleDescription} />
                </>
              )

              return (
                <div
                  key={orgBlock.org}
                  className="relative grid grid-cols-[1fr_auto_1fr] gap-0 items-start md:grid-cols-[1fr_auto_1fr]"
                  style={{ minHeight: '120px' }}
                >
                  {/* Left column: card when even (desktop) / empty on mobile when odd */}
                  <div className={`flex ${isLeft ? 'justify-end pr-3 md:pr-8' : 'justify-end'}`}>
                    {isLeft && (
                      <article
                        ref={setRef}
                        data-experience-index={index}
                        className={cardClass}
                        style={{ transitionDelay: `${index * 80}ms` }}
                      >
                        {cardContent}
                      </article>
                    )}
                  </div>

                  {/* Center: timeline dot */}
                  <div className="relative flex justify-center items-start pt-6">
                    <div
                      className="w-4 h-4 rounded-full border-2 border-[var(--color-blue)] bg-[var(--color-bg)] shadow-[0_0_0_4px_var(--color-bg)] flex-shrink-0 z-10"
                      aria-hidden="true"
                    />
                  </div>

                  {/* Right column: card when odd (desktop) / always on mobile for consistency */}
                  <div className={`flex ${!isLeft ? 'justify-start pl-3 md:pl-8' : 'justify-start'}`}>
                    {!isLeft && (
                      <article
                        ref={setRef}
                        data-experience-index={index}
                        className={cardClass}
                        style={{ transitionDelay: `${index * 80}ms` }}
                      >
                        {cardContent}
                      </article>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function OrgHeader({ orgBlock }) {
  return (
    <div
      className="px-6 py-4 border-b border-[var(--color-border)] bg-gradient-to-r from-[var(--color-blue-soft)] to-[var(--color-bg-elevated)]/80"
      style={{ borderLeftWidth: '4px', borderLeftColor: 'var(--color-accent)' }}
    >
      <h3 className="text-xl font-bold text-[var(--color-text)]">{orgBlock.org}</h3>
      {orgBlock.orgSub && <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{orgBlock.orgSub}</p>}
      {orgBlock.employmentType && (
        <p className="text-xs text-[var(--color-accent)] mt-2 font-medium">{orgBlock.employmentType}</p>
      )}
    </div>
  )
}

function RoleCards({ orgBlock, expandedDescriptions, onToggle }) {
  return (
    <div className="p-4 space-y-4">
      {orgBlock.roles.map((role) => (
        <div
          key={role.title}
          className="glass rounded-xl p-4 hover:border-[var(--color-accent)]/20 transition-colors"
        >
          <div className="flex flex-wrap items-baseline gap-2 mb-3">
            <h4 className="text-lg font-bold text-[var(--color-text)]">{role.title}</h4>
            {role.employmentType && (
              <span className="text-xs text-[var(--color-text-muted)]">{role.employmentType}</span>
            )}
          </div>

          {/* Pill badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)]/80 px-3 py-1 text-xs text-[var(--color-text-muted)]">
              <i className="fas fa-calendar-alt text-[var(--color-accent)] text-[10px]" />
              {role.dateRange}
            </span>
            {role.location && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)]/80 px-3 py-1 text-xs text-[var(--color-text-muted)]">
                <i className="fas fa-map-marker-alt text-[var(--color-accent)] text-[10px]" />
                <span className="truncate max-w-[180px]" title={role.location}>{role.location}</span>
              </span>
            )}
            {role.workMode && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)]/80 px-3 py-1 text-xs text-[var(--color-text-muted)]">
                <i className="fas fa-laptop-house text-[var(--color-accent)] text-[10px]" />
                {role.workMode}
              </span>
            )}
          </div>

          {role.bullets && (
            <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
              {role.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2">
                  <i className="fas fa-check text-[var(--color-accent)] mt-1.5 flex-shrink-0 text-xs" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          )}

          {role.description && (
            <DescriptionBlock
              description={role.description}
              expandKey={`${orgBlock.org}|${role.title}`}
              expanded={expandedDescriptions[`${orgBlock.org}|${role.title}`]}
              onToggle={onToggle}
            />
          )}

          {role.skills && (
            <p className="text-xs text-[var(--color-accent)] mt-3 pt-3 border-t border-[var(--color-border)]">
              <span className="font-semibold text-[var(--color-text-muted)]">Skills: </span>
              {role.skills}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

function DescriptionBlock({ description, expandKey, expanded, onToggle }) {
  const isLong = description.length > DESCRIPTION_PREVIEW_LENGTH
  const preview = isLong ? description.slice(0, DESCRIPTION_PREVIEW_LENGTH).trim() + '…' : description

  return (
    <div className="text-sm text-[var(--color-text-muted)] leading-relaxed">
      <p>{expanded || !isLong ? description : preview}</p>
      {isLong && (
        <button
          type="button"
          onClick={() => onToggle(expandKey)}
          className="mt-2 text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 rounded px-1"
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  )
}

export default Experience
