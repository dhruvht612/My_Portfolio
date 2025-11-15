import { MEDIA } from '../constants/media'

function Education({ focusAreas, highlightCards }) {
  return (
    <section id="education" className="py-20 px-6 bg-[#0f172a] text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-72 h-72 bg-[#14b8a6] rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#22d3ee] rounded-full blur-3xl" />
      </div>
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-1 w-12 bg-gradient-to-r from-transparent to-[#14b8a6] rounded-full" />
            <i className="fas fa-graduation-cap text-5xl text-[#14b8a6] animate-pulse" />
            <div className="h-1 w-12 bg-gradient-to-l from-transparent to-[#22d3ee] rounded-full" />
          </div>
          <h2 className="text-5xl md:text-6xl font-extrabold mb-4 animate-gradient">Education</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">Building expertise through academic excellence and hands-on learning.</p>
        </div>
        <div className="group relative bg-gradient-to-br from-gray-800 to-gray-900 p-8 md:p-12 rounded-3xl shadow-2xl border border-blue-500/20 hover:border-blue-400/50 hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] transition-all duration-500 hover:scale-[1.01] mb-12">
          <div className="absolute -top-4 left-8">
            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Currently Enrolled
            </span>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-teal-500/20 rounded-2xl blur-xl" />
              <img
                src={MEDIA.ontarioTech}
                alt="Ontario Tech University Logo"
                className="relative w-32 h-32 rounded-2xl object-contain border-2 border-blue-500/30 bg-white p-3 shadow-2xl group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Ontario Tech University</h3>
                <p className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Bachelor of Science in Computer Science</p>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <i className="fas fa-map-marker-alt text-blue-400" />
                  Oshawa, Ontario, Canada
                </span>
                <span className="flex items-center gap-2">
                  <i className="fas fa-calendar-alt text-teal-400" />
                  Sep 2024 - Apr 2028
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Academic Progress</span>
                  <span className="text-blue-400 font-semibold">Year 2 of 4</span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-full animate-pulse" style={{ width: '50%' }} />
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Building a strong foundation in software development, data structures, and computational problem-solving. Gaining hands-on experience through coding projects,
                hackathons, and collaborative coursework focused on real-world applications.
              </p>
              <div className="pt-4">
                <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Key Focus Areas</h4>
                <div className="flex flex-wrap gap-2">
                  {focusAreas.map((focus) => (
                    <span
                      key={focus}
                      className="bg-blue-500/10 text-blue-200 px-4 py-2 rounded-full text-sm font-semibold border border-blue-500/30 hover:bg-blue-500/20 transition-colors cursor-default"
                    >
                      {focus}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {highlightCards.map((card) => (
            <div
              key={card.title}
              className={`bg-gradient-to-br ${card.accent} p-6 rounded-2xl border border-white/10 hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 hover:scale-105`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                  <i className={`${card.icon} text-2xl text-white`} />
                </div>
                <h3 className="text-lg font-bold text-white">{card.title}</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-200">
                {card.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2">
                    <i className="fas fa-check-circle text-blue-300 mt-1 flex-shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Education

