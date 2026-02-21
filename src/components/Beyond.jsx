import SpaceBackground from './SpaceBackground'

function Beyond({ beyondStats, goals }) {
  return (
    <section id="beyond" className="py-20 px-6 bg-[var(--color-bg)] text-[var(--color-text)] relative overflow-hidden">
      <SpaceBackground />
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-bg-elevated)]/50 to-[var(--color-bg-elevated)]" aria-hidden="true" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[var(--color-accent)] rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-[var(--color-blue)] rounded-full blur-3xl" />
      </div>
      <div className="max-w-6xl mx-auto relative z-10">
        <header className="glass rounded-2xl p-8 mb-12 text-center border border-[var(--glass-border)]">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-1 w-12 bg-gradient-to-r from-transparent to-[var(--color-accent)] rounded-full" />
            <i className="fas fa-bullseye text-5xl text-[var(--color-accent)] animate-pulse" />
            <div className="h-1 w-12 bg-gradient-to-l from-transparent to-[var(--color-blue)] rounded-full" />
          </div>
          <h2 className="text-5xl md:text-6xl font-extrabold mb-4 animate-gradient">Beyond the Classroom</h2>
          <p className="text-[var(--color-text-muted)] text-lg max-w-3xl mx-auto leading-relaxed">
            Outside of academics, I actively participate in student organizations and leadership initiatives that help me grow as a communicator, collaborator, and problem solver.
          </p>
        </header>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {beyondStats.map((stat) => (
            <div
              key={stat.label}
              className={`glass bg-gradient-to-br ${stat.gradient} p-6 rounded-xl text-center hover:scale-105 transition-transform duration-300`}
            >
              <div className={`text-4xl font-bold mb-2 ${stat.accent}`}>{stat.value}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
        <div className="mb-20 grid gap-8 md:grid-cols-2">
          {goals.map((goal) => (
            <div
              key={goal.title}
              className={`glass group relative bg-gradient-to-br ${goal.accent} p-8 rounded-2xl hover:shadow-[0_0_30px_rgba(255,255,255,0.08)] transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2`}
            >
              <div className="absolute -top-4 left-8">
                <span className="bg-gradient-to-r from-[var(--color-blue)] to-[var(--color-blue)] text-[var(--color-text)] px-4 py-2 rounded-full text-sm font-bold shadow-lg">{goal.badge}</span>
              </div>
              <div className="flex items-center gap-4 mb-6 mt-2">
                <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-300">
                  <i className={`${goal.icon} text-3xl text-[var(--color-text)]`} />
                </div>
                <h3 className="text-2xl font-bold text-[var(--color-text)]">{goal.title}</h3>
              </div>
              <ul className="space-y-4">
                {goal.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-200">
                    <div className="mt-1.5 w-2 h-2 bg-white rounded-full flex-shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              {goal.progress && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex justify-between text-sm text-[var(--color-text-muted)] mb-2">
                    <span>Progress Tracker</span>
                    <span className="text-[#fb7185] font-semibold">{goal.progressLabel}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full animate-pulse" style={{ width: `${goal.progress}%` }} />
                  </div>
                </div>
              )}
              {goal.vision && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center gap-2 text-sm">
                    <i className="fas fa-star text-yellow-300" />
                    <span className="text-[var(--color-text-muted)]">
                      Vision: <span className="text-pink-200 font-semibold">{goal.vision}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Beyond

