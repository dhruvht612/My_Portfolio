import SpaceBackground from './SpaceBackground'

function Skills({ skillGroups }) {
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
          <h2 id="skills-heading" className="text-5xl md:text-6xl font-extrabold mb-4 animate-gradient">Technical Skills</h2>
          <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto leading-relaxed">
            Hover over each skill to see more details
          </p>
        </div>

        <div className="space-y-8">
          {skillGroups.map((group) => (
            <article
              key={group.title}
              className="glass rounded-2xl overflow-hidden hover:border-[var(--color-accent)]/20 transition-colors duration-300"
            >
              <div className="px-6 py-5 md:px-8 md:py-6">
                <h3 className="text-xl font-bold text-[var(--color-text)] mb-6 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                    <i className={`${group.icon} text-lg text-[var(--color-accent)]`} />
                  </span>
                  {group.title}
                </h3>
                <div className="grid gap-6 sm:grid-cols-2">
                  {group.items.map((skill) => (
                    <div
                      key={skill.name}
                      className="skill-item group relative glass rounded-xl px-4 py-4 hover:border-[var(--color-accent)]/20 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                            <i className={`${skill.icon} text-lg text-[var(--color-blue)]`} />
                          </span>
                          <span className="text-[var(--color-text)] font-semibold truncate">{skill.name}</span>
                        </div>
                        <span className="text-[var(--color-accent)] font-semibold tabular-nums flex-shrink-0">
                          {skill.percent}%
                        </span>
                      </div>
                      <div className="skill-bar h-2.5 rounded-full overflow-hidden">
                        <div
                          className="skill-progress bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-blue)] h-full rounded-full"
                          data-progress={skill.percent}
                        />
                      </div>
                      <div className="absolute left-0 right-0 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)]/95 backdrop-blur-sm p-3 shadow-xl">
                          <p className="text-sm font-semibold text-[var(--color-text)]">{skill.level}</p>
                          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{skill.details}</p>
                        </div>
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
