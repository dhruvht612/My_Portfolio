import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import SpaceBackground from './SpaceBackground'
import AnimatedSection from './AnimatedSection'

const DESCRIPTION_PREVIEW_LENGTH = 220

const timelineItemVariants = {
  hidden: { opacity: 1, x: (i) => (i % 2 === 0 ? -32 : 32), y: 16 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    y: 0,
    transition: { duration: 0.5, delay: 0.05 + i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

const dotVariants = {
  hidden: { scale: 0.5, opacity: 0.5 },
  visible: (i) => ({
    scale: 1,
    opacity: 1,
    transition: { duration: 0.35, delay: 0.08 + i * 0.06, ease: 'easeOut' },
  }),
}

function Experience({ experienceByOrg = [] }) {
  const [expandedDescriptions, setExpandedDescriptions] = useState({})
  const containerRef = useRef(null)

  const toggleDescription = (key) => {
    setExpandedDescriptions((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  if (!Array.isArray(experienceByOrg) || experienceByOrg.length === 0) {
    return (
      <section
        id="experience"
        className="py-20 px-6 bg-[var(--color-bg)] text-[var(--color-text)] relative overflow-hidden"
        aria-labelledby="experience-heading"
      >
        <SpaceBackground />
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-bg-elevated)]/50 to-[var(--color-bg-elevated)] pointer-events-none" aria-hidden="true" />
        <div className="max-w-5xl mx-auto relative z-10 text-center py-16">
          <h2 id="experience-heading" className="text-5xl md:text-6xl font-extrabold mb-4">Experience</h2>
          <p className="text-[var(--color-text-muted)]">No experience entries to show yet.</p>
        </div>
      </section>
    )
  }

  return (
    <section
      id="experience"
      className="py-20 px-6 bg-[var(--color-bg)] text-[var(--color-text)] relative overflow-hidden"
      aria-labelledby="experience-heading"
    >
      <SpaceBackground />
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-bg-elevated)]/50 to-[var(--color-bg-elevated)] pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-accent)]/5 to-transparent pointer-events-none" aria-hidden="true" />

      <div className="max-w-5xl mx-auto relative z-10" ref={containerRef}>
        <AnimatedSection className="text-center mb-16" delayOrder={0}>
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-1 w-12 bg-gradient-to-r from-transparent to-[var(--color-accent)] rounded-full" />
            <i className="fas fa-briefcase text-4xl text-[var(--color-accent)] animate-pulse" aria-hidden="true" />
            <div className="h-1 w-12 bg-gradient-to-l from-transparent to-[var(--color-blue)] rounded-full" />
          </div>
          <h2 id="experience-heading" className="text-5xl md:text-6xl font-extrabold mb-4 animate-gradient">
            Experience
          </h2>
          <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto leading-relaxed">
            Leadership, outreach, and community roles
          </p>
        </AnimatedSection>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line – full height, subtle gradient */}
          <div
            className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-gradient-to-b from-[var(--color-accent)]/30 via-[var(--color-blue)]/60 to-[var(--color-accent)]/30 rounded-full"
            aria-hidden="true"
          />

          <div className="space-y-0">
            {experienceByOrg.map((orgBlock, index) => {
              const isLeft = index % 2 === 0
              return (
                <motion.div
                  key={orgBlock.org}
                  className="relative grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-0 items-start"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.05, margin: '0px 0px -80px 0px' }}
                  variants={timelineItemVariants}
                  custom={index}
                >
                  {/* Left column (desktop: card when even) */}
                  <div className={`flex pl-12 md:pl-0 ${isLeft ? 'md:justify-end md:pr-4 lg:pr-10' : 'md:justify-end md:pr-4 lg:pr-10 order-2 md:order-1'}`}>
                    {isLeft && (
                      <article
                        data-experience-index={index}
                        className="experience-card w-full max-w-xl rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-card)]/50 backdrop-blur-sm shadow-lg hover:border-[var(--color-accent)]/50 hover:shadow-[0_0_40px_rgba(125,211,252,0.12)] transition-all duration-300"
                      >
                        <OrgHeader orgBlock={orgBlock} />
                        <RoleCards orgBlock={orgBlock} expandedDescriptions={expandedDescriptions} onToggle={toggleDescription} />
                      </article>
                    )}
                  </div>

                  {/* Center: timeline dot */}
                  <div className="absolute left-0 md:left-1/2 top-6 md:pt-6 flex justify-center items-start -translate-x-1/2 md:translate-x-0 w-8 md:w-auto">
                    <motion.div
                      className="relative z-10 w-4 h-4 rounded-full border-2 border-[var(--color-blue)] bg-[var(--color-bg)] shadow-[0_0_0_4px_var(--color-bg)] flex-shrink-0 ring-4 ring-[var(--color-accent)]/20"
                      variants={dotVariants}
                      custom={index}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, amount: 0.05, margin: '0px 0px -80px 0px' }}
                    />
                  </div>

                  {/* Right column (desktop: card when odd) */}
                  <div className={`flex pl-12 md:pl-4 lg:pl-10 ${!isLeft ? 'md:justify-start' : 'md:justify-start order-1 md:order-2'}`}>
                    {!isLeft && (
                      <article
                        data-experience-index={index}
                        className="experience-card w-full max-w-xl rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-card)]/50 backdrop-blur-sm shadow-lg hover:border-[var(--color-accent)]/50 hover:shadow-[0_0_40px_rgba(125,211,252,0.12)] transition-all duration-300"
                      >
                        <OrgHeader orgBlock={orgBlock} />
                        <RoleCards orgBlock={orgBlock} expandedDescriptions={expandedDescriptions} onToggle={toggleDescription} />
                      </article>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function OrgHeader({ orgBlock }) {
  const initial = orgBlock.org.charAt(0).toUpperCase()
  return (
    <div
      className="px-6 py-4 border-b border-[var(--color-border)] bg-gradient-to-r from-[var(--color-blue-soft)] to-[var(--color-bg-elevated)]/80 flex items-center gap-4"
      style={{ borderLeftWidth: '4px', borderLeftColor: 'var(--color-accent)' }}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/30 text-lg font-bold text-[var(--color-accent)]">
        {initial}
      </div>
      <div>
        <h3 className="text-xl font-bold text-[var(--color-text)]">{orgBlock.org}</h3>
        {orgBlock.orgSub && <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{orgBlock.orgSub}</p>}
        {orgBlock.employmentType && (
          <p className="text-xs text-[var(--color-accent)] mt-2 font-medium">{orgBlock.employmentType}</p>
        )}
      </div>
    </div>
  )
}

function RoleCards({ orgBlock, expandedDescriptions, onToggle }) {
  return (
    <div className="p-4 space-y-4">
      {orgBlock.roles.map((role) => (
        <div
          key={role.title}
          className="rounded-xl p-4 border border-[var(--color-border)] bg-[var(--color-bg)]/30 hover:border-[var(--color-accent)]/30 hover:bg-[var(--color-bg)]/50 transition-all duration-300"
        >
          <div className="flex flex-wrap items-baseline gap-2 mb-3">
            <h4 className="text-lg font-bold text-[var(--color-text)]">{role.title}</h4>
            {role.employmentType && (
              <span className="text-xs text-[var(--color-text-muted)]">{role.employmentType}</span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)]/80 px-3 py-1 text-xs text-[var(--color-text-muted)]">
              <i className="fas fa-calendar-alt text-[var(--color-accent)] text-[10px]" />
              {role.dateRange}
            </span>
            {role.location && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)]/80 px-3 py-1 text-xs text-[var(--color-text-muted)]">
                <i className="fas fa-map-marker-alt text-[var(--color-accent)] text-[10px]" />
                <span className="truncate max-w-[180px]" title={role.location}>{role.location}</span>
              </span>
            )}
            {role.workMode && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)]/80 px-3 py-1 text-xs text-[var(--color-text-muted)]">
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
      <motion.p
        key={expanded ? 'full' : 'preview'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {expanded || !isLong ? description : preview}
      </motion.p>
      {isLong && (
        <button
          type="button"
          onClick={() => onToggle(expandKey)}
          className="mt-2 text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 rounded px-1 transition-colors"
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  )
}

export default Experience