function Projects({ projectStats, filters, projectFilter, onFilterChange, projects }) {
  return (
    <section id="projects" className="py-20 px-6 bg-[#0f172a] relative overflow-hidden" aria-labelledby="projects-heading">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#14b8a6]/5 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-1 w-12 bg-gradient-to-r from-transparent to-[#14b8a6] rounded-full" />
            <i className="fas fa-project-diagram text-4xl text-[#14b8a6] animate-pulse" />
            <div className="h-1 w-12 bg-gradient-to-l from-transparent to-[#22d3ee] rounded-full" />
          </div>
          <h2 id="projects-heading" className="text-5xl md:text-6xl font-extrabold mb-4 animate-gradient">
            Featured Projects
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
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
              <div className="text-xs text-gray-400 uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-3 mb-12" role="group" aria-label="Project filter options">
        {filters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className={`filter-btn px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${
              projectFilter === filter.id
                ? 'text-white bg-gradient-to-r from-[#14b8a6] to-[#22d3ee] shadow-lg focus:ring-[#22d3ee]'
                : 'text-gray-300 bg-gray-800 border border-gray-700 hover:border-[#14b8a6] hover:text-[#14b8a6]'
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
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
        {projects.map((project) => (
          <div
            key={project.id}
            className="project-card group relative bg-gradient-to-br from-[#111827] to-[#1a1f35] border border-[#1f2937] rounded-2xl overflow-hidden shadow-xl transition-all duration-500 hover:border-[#14b8a6] hover:shadow-[0_0_30px_rgba(20,184,166,0.4)] hover:scale-[1.03] hover:-translate-y-2"
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
            <div className="relative h-40 bg-gradient-to-br from-[#14b8a6]/20 to-[#22d3ee]/20 flex items-center justify-center overflow-hidden">
              <div className="text-6xl text-[#22d3ee] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                <i className={project.iconClass} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent opacity-60" />
            </div>
            <div className="p-6 flex flex-col h-full">
              <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-[#14b8a6] to-[#22d3ee] bg-clip-text text-transparent group-hover:from-[#22d3ee] group-hover:to-[#14b8a6] transition-all duration-300">
                {project.title}
              </h3>
              <p className="text-gray-300 mb-4 text-sm leading-relaxed flex-1">{project.description}</p>
              {project.features && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Key Features</h4>
                  <ul className="space-y-1 text-sm text-gray-400">
                    {project.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <i className="fas fa-check-circle text-[#14b8a6] mr-2 mt-1 text-xs" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tech?.map((tech) => (
                  <span key={tech} className="bg-[#14b8a6]/20 text-[#14b8a6] px-3 py-1 rounded-full text-xs font-semibold border border-[#14b8a6]/30">
                    {tech}
                  </span>
                ))}
              </div>
              <div className="flex gap-2 pt-4 border-t border-gray-700/50">
                {project.disabled ? (
                  <>
                    <button disabled className="flex-1 bg-gray-600/50 text-gray-400 px-4 py-2.5 rounded-lg text-xs font-bold cursor-not-allowed opacity-60">
                      <i className="fas fa-clock mr-2" />
                      In Development
                    </button>
                    <button disabled className="flex-1 bg-gray-700/50 text-gray-400 px-4 py-2.5 rounded-lg text-xs font-bold cursor-not-allowed border border-gray-600 opacity-60">
                      <i className="fab fa-github mr-2" />
                      Coming Soon
                    </button>
                  </>
                ) : (
                  <>
                    <a
                      href={project.links?.live ?? '#'}
                      className="flex-1 bg-gradient-to-r from-[#14b8a6] to-[#22d3ee] hover:from-[#22d3ee] hover:to-[#14b8a6] text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 text-center shadow-lg hover:shadow-[0_0_20px_rgba(20,184,166,0.5)] transform hover:scale-105"
                    >
                      <i className="fas fa-external-link-alt mr-2" />
                      Live Demo
                    </a>
                    <a
                      href={project.links?.code ?? '#'}
                      className="flex-1 bg-gray-700/50 hover:bg-gray-600 text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 text-center border border-gray-600 hover:border-gray-500"
                    >
                      <i className="fab fa-github mr-2" />
                      Code
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Projects

