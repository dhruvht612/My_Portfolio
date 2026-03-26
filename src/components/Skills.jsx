import { useCallback, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Tilt from 'react-parallax-tilt'
import {
  BarChart3,
  Boxes,
  Braces,
  Code2,
  Database,
  ExternalLink,
  Layers3,
  Sparkles,
  Wrench,
  X,
} from 'lucide-react'
import SpaceBackground from './SpaceBackground'

const GROUP_IDS = ['all', 'programming', 'data', 'web', 'tools']
const GROUP_LABELS = {
  all: 'All',
  programming: 'Programming',
  data: 'Data',
  web: 'Web',
  tools: 'Tools',
}

const GROUP_ICON = {
  Programming: Braces,
  'Data & Analytics': BarChart3,
  'Web Development': Code2,
  'Databases & Tools': Wrench,
}

const SKILL_ICON = {
  React: Code2,
  JavaScript: Braces,
  'Node.js': Boxes,
  SQL: Database,
  MongoDB: Database,
  Python: Braces,
  Java: Braces,
  Git: Layers3,
  GitHub: Layers3,
  default: Sparkles,
}

const LEVEL_STYLE = {
  Expert: 'text-fuchsia-300 border-fuchsia-400/35 bg-fuchsia-500/10',
  Advanced: 'text-sky-300 border-sky-400/35 bg-sky-500/10',
  Intermediate: 'text-violet-300 border-violet-400/35 bg-violet-500/10',
}

const SKILL_TAGS = {
  React: ['Frontend', 'UI'],
  JavaScript: ['Frontend', 'Backend'],
  'Node.js': ['Backend', 'APIs'],
  'Express.js': ['Backend', 'REST'],
  Flask: ['Backend', 'Python'],
  'REST APIs': ['Integration', 'Backend'],
  SQL: ['Data', 'Backend'],
  MongoDB: ['NoSQL', 'Backend'],
  Firebase: ['Cloud', 'Backend'],
  Pandas: ['Data', 'Analytics'],
  NumPy: ['Data', 'Math'],
  Matplotlib: ['Visualization', 'Data'],
  Seaborn: ['Visualization', 'Data'],
  'Chart.js': ['Frontend', 'Data'],
  'Data Visualization': ['Storytelling', 'Analytics'],
  Git: ['Workflow', 'Collaboration'],
  GitHub: ['Collaboration', 'CI/CD'],
  Linux: ['Systems', 'CLI'],
  Vercel: ['Deployment', 'Cloud'],
}

function getGroupId(title) {
  const m = { Programming: 'programming', 'Data & Analytics': 'data', 'Web Development': 'web', 'Databases & Tools': 'tools' }
  return m[title] || title.toLowerCase().replace(/\s+/g, '-')
}

function getProjectsForSkill(projects, skillName) {
  if (!skillName) return []
  const lower = skillName.toLowerCase()
  return projects.filter((p) => p.tech?.some((s) => s.toLowerCase() === lower))
}

function ProgressBar({ value }) {
  return (
    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${value}%` }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="h-full rounded-full bg-gradient-to-r from-sky-400 via-blue-400 to-fuchsia-400 shadow-[0_0_18px_rgba(125,211,252,0.45)]"
      />
      <motion.div
        className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 0.8, ease: 'linear' }}
      />
    </div>
  )
}

function Skills({ skillGroups, projects = [] }) {
  const [activeGroup, setActiveGroup] = useState('all')
  const [selectedSkill, setSelectedSkill] = useState(null)

  const filteredGroups = useMemo(
    () => (activeGroup === 'all' ? skillGroups : skillGroups.filter((g) => getGroupId(g.title) === activeGroup)),
    [activeGroup, skillGroups]
  )

  const projectsForSkill = useMemo(
    () => getProjectsForSkill(projects, selectedSkill?.name),
    [projects, selectedSkill]
  )

  const openModal = useCallback((skill) => setSelectedSkill(skill), [])
  const closeModal = useCallback(() => setSelectedSkill(null), [])

  return (
    <section id="skills" className="relative overflow-hidden bg-[var(--color-bg)] py-24 md:py-28" aria-labelledby="skills-heading">
      <SpaceBackground />
      <div className="beyond-grid-bg pointer-events-none absolute inset-0 opacity-[0.22]" aria-hidden />
      <div className="beyond-noise pointer-events-none absolute inset-0 opacity-[0.03]" aria-hidden />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-[-12%] top-[10%] h-[28rem] w-[28rem] rounded-full bg-blue-500/18 blur-[120px]" />
        <div className="absolute right-[-8%] top-[32%] h-[24rem] w-[24rem] rounded-full bg-fuchsia-500/16 blur-[110px]" />
        <div className="absolute left-[30%] bottom-[-8%] h-[20rem] w-[20rem] rounded-full bg-purple-500/14 blur-[95px]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg)] via-transparent to-[var(--color-bg)] pointer-events-none" aria-hidden />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.12 }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } } }}
        className="relative z-10 mx-auto max-w-6xl px-5 md:px-6"
      >
        <motion.div
          variants={{ hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } }}
          className="mb-12 text-center md:mb-14"
        >
          <div className="mb-4 inline-flex items-center gap-3">
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-[var(--color-accent)] md:w-14" />
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
              Product-grade craftsmanship
            </span>
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-[var(--color-blue)] md:w-14" />
          </div>
          <h2 id="skills-heading" className="mb-4 text-4xl font-extrabold tracking-tight md:text-6xl">
            <span className="bg-gradient-to-br from-white via-[var(--color-text)] to-[var(--color-accent)] bg-clip-text text-transparent">
              Technical Skills
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-[#bcc9db] md:text-lg">
            Click any skill to explore where it ships in real projects, with stack details and links.
          </p>
        </motion.div>

        <motion.div
          variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
          className="mb-10 flex justify-center md:mb-12"
        >
          <div className="relative grid w-full max-w-2xl grid-cols-5 gap-1 rounded-2xl border border-white/10 bg-[var(--color-bg-card)]/45 p-1.5 backdrop-blur-xl">
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="absolute bottom-1.5 top-1.5 rounded-xl border border-[var(--color-accent)]/35 bg-[var(--color-accent)]/20 shadow-[0_0_28px_rgba(125,211,252,0.2)]"
              style={{ width: 'calc(20% - 0.4rem)', left: `calc(${GROUP_IDS.indexOf(activeGroup) * 20}% + 0.2rem)` }}
              aria-hidden
            />
            {GROUP_IDS.map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={activeGroup === id}
                onClick={() => setActiveGroup(id)}
                className={`relative z-10 rounded-xl px-2 py-2.5 text-xs font-semibold md:text-sm ${
                  activeGroup === id ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                {GROUP_LABELS[id]}
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeGroup}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28 }}
            className="space-y-8"
          >
            {filteredGroups.map((group) => {
              const GroupIcon = GROUP_ICON[group.title] || Sparkles
              return (
                <section key={group.title} className="rounded-2xl border border-white/10 bg-[var(--color-bg-card)]/35 p-4 backdrop-blur-xl md:p-6">
                  <div className="mb-5 flex items-center gap-3 border-b border-white/10 pb-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                      <GroupIcon className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <h3 className="text-xl font-bold text-[var(--color-text)]">{group.title}</h3>
                      <p className="text-xs text-[var(--color-text-muted)]">Hands-on, project-proven capabilities</p>
                    </div>
                  </div>

                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.08 }}
                    variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
                    className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    {group.items.map((skill) => {
                      const Icon = SKILL_ICON[skill.name] || SKILL_ICON.default
                      const tags = SKILL_TAGS[skill.name] || [getGroupId(group.title), 'Project-ready']
                      return (
                        <motion.div
                          key={skill.name}
                          variants={{ hidden: { opacity: 0, y: 20, scale: 0.98 }, visible: { opacity: 1, y: 0, scale: 1 } }}
                        >
                          <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={900} scale={1.02} transitionSpeed={350}>
                            <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[var(--color-bg)]/45 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.28)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-accent)]/40 hover:shadow-[0_20px_55px_rgba(65,105,225,0.2)]">
                              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/80 to-transparent" />
                              <div className="mb-4 flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <motion.span whileHover={{ rotate: [0, -6, 6, 0] }} transition={{ duration: 0.45 }} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-[var(--color-accent)]">
                                    <Icon className="h-5 w-5" aria-hidden />
                                  </motion.span>
                                  <div>
                                    <h4 className="text-base font-bold text-[var(--color-text)]">{skill.name}</h4>
                                    <p className="text-xs text-[var(--color-text-muted)]">{skill.details}</p>
                                  </div>
                                </div>
                                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${LEVEL_STYLE[skill.level] || LEVEL_STYLE.Advanced}`}>
                                  {skill.level}
                                </span>
                              </div>

                              <div className="mb-3 flex flex-wrap gap-1.5">
                                {tags.map((tag) => (
                                  <span key={`${skill.name}-${tag}`} className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-medium text-[var(--color-text-muted)]">
                                    {tag}
                                  </span>
                                ))}
                              </div>

                              <div className="mb-2 flex items-center justify-between text-xs">
                                <span className="text-[var(--color-text-muted)]">Skill strength</span>
                                <span className="font-semibold text-[var(--color-accent)]">{skill.percent}%</span>
                              </div>
                              <ProgressBar value={skill.percent} />

                              <button
                                type="button"
                                onClick={() => openModal(skill)}
                                className="theme-btn theme-btn-secondary mt-4 w-full justify-center py-2.5 text-sm hover:shadow-[0_0_20px_rgba(125,211,252,0.15)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]"
                              >
                                <Sparkles className="h-4 w-4 text-[var(--color-accent)]" aria-hidden />
                                Explore projects with {skill.name}
                              </button>
                            </article>
                          </Tilt>
                        </motion.div>
                      )
                    })}
                  </motion.div>
                </section>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {selectedSkill && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && closeModal()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="skills-modal-title"
          >
            <motion.div
              initial={{ opacity: 0, y: 22, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[var(--color-bg-elevated)]/90 shadow-[0_30px_90px_rgba(0,0,0,0.55)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent" />
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 md:px-6">
                <div>
                  <h3 id="skills-modal-title" className="text-xl font-bold text-[var(--color-text)] md:text-2xl">
                    {selectedSkill.name} in Real Projects
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {projectsForSkill.length} project{projectsForSkill.length === 1 ? '' : 's'} using this skill
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="theme-btn theme-btn-secondary h-10 w-10 p-0"
                  aria-label="Close modal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5 md:p-6">
                {projectsForSkill.length === 0 ? (
                  <p className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-[var(--color-text-muted)]">
                    No linked projects yet for this skill. Add one in your project data and it will appear here automatically.
                  </p>
                ) : (
                  projectsForSkill.map((project) => (
                    <article key={project.id ?? project.title} className="rounded-2xl border border-white/10 bg-[var(--color-bg)]/50 p-4 md:p-5">
                      <h4 className="text-lg font-bold text-[var(--color-text)]">{project.title}</h4>
                      <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-muted)]">{project.description}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {project.tech?.map((tech) => (
                          <span key={`${project.title}-${tech}`} className="rounded-md border border-[var(--color-accent)]/25 bg-[var(--color-accent)]/10 px-2 py-1 text-[11px] font-medium text-[var(--color-accent)]">
                            {tech}
                          </span>
                        ))}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {project.links?.code && project.links.code !== '#' && (
                          <a href={project.links.code} target="_blank" rel="noreferrer" className="theme-btn theme-btn-secondary px-3 py-2 text-xs">
                            <Code2 className="h-3.5 w-3.5" />
                            GitHub
                          </a>
                        )}
                        {project.links?.live && project.links.live !== '#' && (
                          <a href={project.links.live} target="_blank" rel="noreferrer" className="theme-btn theme-btn-primary px-3 py-2 text-xs">
                            <ExternalLink className="h-3.5 w-3.5" />
                            Live Demo
                          </a>
                        )}
                      </div>
                    </article>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default Skills
