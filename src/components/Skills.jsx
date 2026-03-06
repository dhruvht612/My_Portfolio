import { useState } from 'react'
import SpaceBackground from './SpaceBackground'

const GROUP_IDS = ['all', 'programming', 'data', 'web', 'tools']

function Skills({ skillGroups }) {
  const [activeGroup, setActiveGroup] = useState('all')

  const getGroupId = (title) => {
    const m = { 'Programming': 'programming', 'Data & Analytics': 'data', 'Web Development': 'web', 'Databases & Tools': 'tools' }
    return m[title] || title.toLowerCase().replace(/\s+/g, '-')
  }

  const filteredGroups = activeGroup === 'all'
    ? skillGroups
    : skillGroups.filter((g) => getGroupId(g.title) === activeGroup)

  return (
    <section id="skills" className="py-20 px-6 bg-[var(--color-bg)] relative overflow-hidden" aria-labelledby="skills-heading">
      <SpaceBackground />
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-bg-elevated)]/50 to-[var(--color-bg-elevated)] pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-accent)]/5 to-transparent pointer-events-none" aria-hidden="true" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-1 w-12 bg-gradient-to-r from-transparent to-[var(--color-accent)] rounded-full" />
            <i className="fas fa-code text-4xl text-[var(--color-accent)] animate-pulse" aria-hidden="true" />
            <div className="h-1 w-12 bg-gradient-to-l from-transparent to-[var(--color-blue)] rounded-full" />
          </div>
          <h2 id="skills-heading" className="text-5xl md:text-6xl font-extrabold mb-4 animate-gradient">
            Technical Skills
          </h2>
          <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto leading-relaxed">
            Technologies and tools I work with. Filter by category or browse all.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10" role="tablist" aria-label="Skill categories">
          {GROUP_IDS.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeGroup === id}
              onClick={() => setActiveGroup(id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeGroup === id
                  ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/40 shadow-lg'
                  : 'bg-[var(--color-bg-card)]/60 text-[var(--color-text-muted)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/30 hover:text-[var(--color-text)]'
              }`}
            >
              {id === 'all' ? 'All' : id.charAt(0).toUpperCase() + id.slice(1)}
            </button>
          ))}
        </div>

        <div className="space-y-10">
          {filteredGroups.map((group) => (
            <article
              key={group.title}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/40 backdrop-blur-sm overflow-hidden hover:border-[var(--color-accent)]/30 transition-colors duration-300"
            >
              <div className="px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]/50">
                <h3 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/30">
                    <i className={`${group.icon} text-lg text-[var(--color-accent)]`} aria-hidden />
                  </span>
                  {group.title}
                </h3>
              </div>
              <div className="p-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((skill) => (
                    <div
                      key={skill.name}
                      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/60 p-4 hover:border-[var(--color-accent)]/25 hover:shadow-[0_0_20px_rgba(65,105,225,0.08)] transition-all duration-300"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--color-blue)]/20 border border-[var(--color-blue)]/30">
                            <i className={`${skill.icon} text-base text-[var(--color-accent)]`} aria-hidden />
                          </span>
                          <span className="text-[var(--color-text)] font-semibold truncate">{skill.name}</span>
                        </div>
                        <span className="text-[var(--color-accent)] font-bold tabular-nums flex-shrink-0 text-sm">
                          {skill.percent}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden bg-[var(--color-bg-elevated)]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-blue)] transition-all duration-700 ease-out"
                          style={{ width: `${skill.percent}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-[var(--color-text-muted)] font-medium">{skill.level}</span>
                        <span className="text-[var(--color-text-muted)] truncate max-w-[60%]" title={skill.details}>
                          {skill.details}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Skills
