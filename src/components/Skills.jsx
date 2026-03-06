import { useState, useCallback } from 'react'
import SpaceBackground from './SpaceBackground'

const GROUP_IDS = ['all', 'programming', 'data', 'web', 'tools']

const projects = [
  { title: 'Farm Flight', description: 'AI-powered smart farming dashboard', skills: ['React', 'Tailwind', 'Firebase'], github: '#' },
  { title: 'Portfolio Website', description: 'Personal portfolio built with React', skills: ['React', 'JavaScript'], github: '#' },
  { title: 'Contact Manager', description: 'Java contact manager application', skills: ['Java'], github: '#' },
  { title: 'Trail', description: 'Indoor accessibility & sensory-aware navigation', skills: ['React', 'Node.js', 'Python', 'JavaScript', 'MongoDB', 'CSS'], github: '#' },
  { title: 'Wisely', description: 'Goal-based spending tracker with Plaid & Ollama', skills: ['React', 'Node.js', 'JavaScript', 'Express', 'SQLite', 'Prisma'], github: '#' },
  { title: 'QR Code Generator', description: 'Node.js CLI for generating QR codes', skills: ['Node.js', 'JavaScript'], github: '#' },
  { title: 'Book Catalog', description: 'Book catalog system for managing your library', skills: ['JavaScript', 'HTML', 'CSS'], github: '#' },
  { title: 'Before the Appointment', description: 'Health translator for symptom communication', skills: ['React', 'JavaScript', 'CSS'], github: '#' },
  { title: 'File Compression Tool', description: 'Huffman coding compression in Java', skills: ['Java'], github: '#' },
]

function Skills({ skillGroups }) {
  const [activeGroup, setActiveGroup] = useState('all')
  const [selectedSkill, setSelectedSkill] = useState(null)

  const getGroupId = (title) => {
    const m = { 'Programming': 'programming', 'Data & Analytics': 'data', 'Web Development': 'web', 'Databases & Tools': 'tools' }
    return m[title] || title.toLowerCase().replace(/\s+/g, '-')
  }

  const filteredGroups = activeGroup === 'all'
    ? skillGroups
    : skillGroups.filter((g) => getGroupId(g.title) === activeGroup)

  const projectsForSkill = selectedSkill
    ? projects.filter((p) => p.skills.some((s) => s.toLowerCase() === selectedSkill.toLowerCase()))
    : []

  const openModal = useCallback((skillName) => {
    setSelectedSkill(skillName)
  }, [])

  const closeModal = useCallback(() => setSelectedSkill(null), [])

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
            Click a skill to see projects that use it.
          </p>
        </div>

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
                <div className="flex flex-wrap gap-3">
                  {group.items.map((skill) => (
                    <button
                      key={skill.name}
                      type="button"
                      onClick={() => openModal(skill.name)}
                      className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/60 px-4 py-3 text-[var(--color-text)] font-semibold transition-all duration-300 hover:scale-105 hover:border-[var(--color-accent)]/40 hover:shadow-[0_0_20px_rgba(65,105,225,0.15)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-blue)]/20 border border-[var(--color-blue)]/30">
                        <i className={`${skill.icon} text-sm text-[var(--color-accent)]`} aria-hidden />
                      </span>
                      {skill.name}
                    </button>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Modal overlay + content */}
      {selectedSkill != null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="relative w-full max-w-lg max-h-[85vh] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
              <h3 id="modal-title" className="text-xl font-bold text-[var(--color-text)]">
                Projects using {selectedSkill}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                aria-label="Close modal"
              >
                <i className="fas fa-times text-lg" aria-hidden />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(85vh-4.5rem)] p-6 space-y-4">
              {projectsForSkill.length === 0 ? (
                <p className="text-[var(--color-text-muted)]">No projects found for this skill.</p>
              ) : (
                projectsForSkill.map((project) => (
                  <div
                    key={project.title}
                    className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/60 p-4"
                  >
                    <h4 className="font-bold text-[var(--color-text)] mb-1">{project.title}</h4>
                    <p className="text-sm text-[var(--color-text-muted)] mb-3">{project.description}</p>
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)] hover:underline"
                    >
                      <i className="fab fa-github" aria-hidden />
                      GitHub
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Skills
