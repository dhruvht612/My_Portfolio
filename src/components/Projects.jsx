import SpaceBackground from './SpaceBackground'

function Projects({ projectStats, filters, projectFilter, onFilterChange, projects }) {
  return (
    <section id="projects" className="py-20 px-6 bg-[var(--color-bg)] relative overflow-hidden" aria-labelledby="projects-heading">
      <SpaceBackground />
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-bg-elevated)]/50 to-[var(--color-bg-elevated)] pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-accent)]/5 to-transparent pointer-events-none" aria-hidden="true" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-1 w-12 bg-gradient-to-r from-transparent to-[var(--color-accent)] rounded-full" />
            <i className="fas fa-project-diagram text-4xl text-[var(--color-accent)] animate-pulse" />
            <div className="h-1 w-12 bg-gradient-to-l from-transparent to-[var(--color-blue)] rounded-full" />
          </div>
          <h2 id="projects-heading" className="text-5xl md:text-6xl font-extrabold mb-4 animate-gradient">
            Featured Projects
          </h2>
          <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto leading-relaxed">
            Explore my collection of innovative projects spanning web development, algorithms, robotics, and electronics.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
          {projectStats.map((stat) => (
            <div
              key={stat.label}
              className={`bg-gradient-to-br ${stat.gradient} backdrop-blur-sm p-4 rounded-xl border border-white/10 text-center hover:scale-105 transition-transform duration-300`}
            >
              <div className={`text-3xl font-bold mb-1 ${stat.accent}`}>{stat.value}</div>
              <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-center gap-3 mb-12" role="group" aria-label="Project filter options">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={`filter-btn px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-bg)] cursor-pointer ${
                projectFilter === filter.id
                  ? 'text-white bg-[var(--color-orange)] shadow-lg focus:ring-[var(--color-orange)]'
                  : 'text-[var(--color-text)] bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'
              }`}
              data-filter={filter.id}
              aria-pressed={projectFilter === filter.id}
              onClick={() => onFilterChange(filter.id)}
            >
              <i className={`${filter.icon} mr-2`} aria-hidden="true" />
              {filter.label}
            </button>
          ))}
        </div>
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="project-card group relative bg-gradient-to-br from-[var(--color-bg)] to-[var(--color-bg-elevated)] border border-[var(--color-blue)]/20 rounded-2xl overflow-hidden shadow-xl transition-all duration-500 hover:border-[var(--color-blue)] hover:shadow-[0_0_30px_rgba(65,105,225,0.3)] hover:scale-[1.03] hover:-translate-y-2"
            data-category={project.categories?.join(' ')}
          >
            {project.badge && (
              <div className="absolute top-3 right-3 z-10">
                <span className={`bg-gradient-to-r ${project.badge.gradient} text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1`}>
                  <i className={`${project.badge.icon} mr-1`} />
                  {project.badge.label}
                </span>
              </div>
            )}
            <div className="relative h-40 bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-blue)]/20 flex items-center justify-center overflow-hidden">
              <div className="text-6xl text-[var(--color-accent)] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                <i className={project.iconClass} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] to-transparent opacity-60" />
            </div>
            <div className="p-6 flex flex-col h-full">
              <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-blue)] bg-clip-text text-transparent transition-all duration-300">
                {project.title}
              </h3>
              <p className="text-[var(--color-text)] mb-4 text-sm leading-relaxed">{project.description}</p>
              <div className="flex gap-2 flex-wrap mb-4 pt-4 border-t border-[var(--color-border)]">
                {project.disabled ? (
                  <>
                    <button disabled className="flex-1 bg-[var(--color-bg-card)]/50 text-[var(--color-text-muted)] px-4 py-2.5 rounded-lg text-xs font-bold cursor-not-allowed opacity-60">
                      <i className="fas fa-clock mr-2" />
                      In Development
                    </button>
                    <button disabled className="flex-1 bg-[var(--color-bg-elevated)]/50 text-[var(--color-text-muted)] px-4 py-2.5 rounded-lg text-xs font-bold cursor-not-allowed border border-[var(--color-border)] opacity-60">
                      <i className="fab fa-github mr-2" />
                      Coming Soon
                    </button>
                  </>
                ) : (
                  <>
                    <a
                      href={project.links?.live || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 min-w-[140px] bg-[var(--color-orange)] hover:bg-[var(--color-orange-hover)] text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 text-center shadow-lg hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] transform hover:scale-105"
                    >
                      <i className="fas fa-external-link-alt mr-2" />
                      Live Demo
                    </a>
                    <a
                      href={project.links?.code || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 min-w-[140px] bg-[var(--color-bg-card)]/50 hover:bg-[var(--color-accent)]/20 text-[var(--color-text)] px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 text-center border border-[var(--color-accent)]/30 hover:border-[var(--color-accent)]"
                    >
                      <i className="fab fa-github mr-2" />
                      GitHub
                    </a>
                  </>
                )}
              </div>
              {project.features && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-[var(--color-text-muted)] mb-2 uppercase tracking-wide">Key Features</h4>
                  <ul className="space-y-1 text-sm text-[var(--color-text-muted)]">
                    {project.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <i className="fas fa-check-circle text-[var(--color-blue)] mr-2 mt-1 text-xs" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {project.tech?.map((tech) => (
                  <span key={tech} className="bg-[var(--color-accent)]/20 text-[var(--color-accent)] px-3 py-1 rounded-full text-xs font-semibold border border-[var(--color-accent)]/30">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>
    </section>
  )
}

export default Projects
