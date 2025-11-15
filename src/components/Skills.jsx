function Skills({ skillGroups }) {
  return (
    <section id="skills" className="py-20 px-6 bg-[#0f172a]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold animate-gradient mb-4 flex items-center justify-center gap-3">
            <i className="fas fa-code text-[#22d3ee]" />
            Technical Skills
          </h2>
          <p className="text-gray-400 text-lg">Hover over each skill to see more details</p>
        </div>
        <div className="space-y-12">
          {skillGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <i className={`${group.icon} text-[#22d3ee]`} />
                {group.title}
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                {group.items.map((skill) => (
                  <div key={skill.name} className="skill-item group relative">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <i className={`${skill.icon} text-2xl text-[#22d3ee]`} />
                        <span className="text-white font-semibold">{skill.name}</span>
                      </div>
                      <span className="text-[#22d3ee] font-semibold">{skill.percent}%</span>
                    </div>
                    <div className="skill-bar bg-gray-700 h-3 rounded-full overflow-hidden">
                      <div className="skill-progress bg-gradient-to-r from-[#14b8a6] to-[#22d3ee] h-full rounded-full" data-progress={skill.percent} />
                    </div>
                    <div className="absolute left-0 -top-20 bg-gray-800 text-white p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 w-64">
                      <p className="text-sm font-semibold mb-1">{skill.level}</p>
                      <p className="text-xs text-gray-300">{skill.details}</p>
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

