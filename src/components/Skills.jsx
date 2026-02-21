import SpaceBackground from './SpaceBackground'

function Skills({ skillGroups }) {
  return (
    <section id="skills" className="py-20 px-6 bg-[var(--color-bg)] relative overflow-hidden">
      <SpaceBackground />
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-bg-elevated)]/30 to-[var(--color-bg-elevated)]" aria-hidden="true" />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold animate-gradient mb-4 flex items-center justify-center gap-3">
            <i className="fas fa-code text-[var(--color-accent)]" />
            Technical Skills
          </h2>
          <p className="text-gray-400 text-lg">Hover over each skill to see more details</p>
        </div>
        <div className="space-y-12">
          {skillGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-2xl font-bold text-[var(--color-text)] mb-6 flex items-center gap-2">
                <i className={`${group.icon} text-[var(--color-accent)]`} />
                {group.title}
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                {group.items.map((skill) => (
                  <div key={skill.name} className="skill-item group relative">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <i className={`${skill.icon} text-2xl text-[var(--color-blue)]`} />
                        <span className="text-[var(--color-text)] font-semibold">{skill.name}</span>
                      </div>
                      <span className="text-[var(--color-accent)] font-semibold">{skill.percent}%</span>
                    </div>
                    <div className="skill-bar bg-[var(--color-bg-card)] h-3 rounded-full overflow-hidden">
                      <div className="skill-progress bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-blue)] h-full rounded-full" data-progress={skill.percent} />
                    </div>
                    <div className="absolute left-0 -top-20 bg-[var(--color-bg-card)] text-[var(--color-text)] p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 w-64">
                      <p className="text-sm font-semibold mb-1">{skill.level}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{skill.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Skills

