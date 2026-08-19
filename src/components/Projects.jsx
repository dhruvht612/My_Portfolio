import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Tilt from 'react-parallax-tilt'
import { Code2, ExternalLink, Search, Sparkles, Star, X } from 'lucide-react'
import { trackProjectClick } from '../hooks/usePageView'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { DUR, EASE, VIEWPORT, reveal } from '../lib/motion'
import AnimatedSection from './AnimatedSection'
import HolographicCard from './ui/holographic-card'

const TECH_ICONS = {
  React: 'fab fa-react',
  'Node.js': 'fab fa-node-js',
  JavaScript: 'fab fa-js',
  CSS: 'fab fa-css3-alt',
  HTML: 'fab fa-html5',
  Python: 'fab fa-python',
  Java: 'fab fa-java',
  Express: 'fas fa-server',
  SQLite: 'fas fa-database',
  Prisma: 'fas fa-database',
  MongoDB: 'fas fa-database',
  Vite: 'fas fa-bolt',
  'Tailwind CSS': 'fas fa-palette',
  'React Router': 'fas fa-route',
  Recharts: 'fas fa-chart-line',
  Axios: 'fas fa-cloud',
  Inquirer: 'fas fa-question-circle',
  'qr-image': 'fas fa-qrcode',
  fs: 'fas fa-folder',
  Ollama: 'fas fa-robot',
  Plaid: 'fas fa-university',
  Figma: 'fab fa-figma',
  ElevenLabs: 'fas fa-volume-up',
  Gemini: 'fas fa-wand-magic-sparkles',
  Snowflake: 'fas fa-snowflake',
  'Huffman Coding': 'fas fa-compress-alt',
  'Data Structures': 'fas fa-sitemap',
  OOP: 'fas fa-cubes',
  'Framer Motion': 'fas fa-film',
  'TanStack Query': 'fas fa-circle-nodes',
  Zustand: 'fas fa-cubes-stacked',
  Clerk: 'fas fa-user-shield',
  Sonner: 'fas fa-bell',
  'Socket.io': 'fas fa-plug',
  'Howler.js': 'fas fa-volume-high',
}

/* Icon per derived project type. Keys mirror getImpactTags()'s vocabulary. */
const TYPE_ICONS = {
  AI: 'fas fa-brain',
  'Full-Stack': 'fas fa-layer-group',
  Accessibility: 'fas fa-universal-access',
  'Data-Driven': 'fas fa-database',
  'Real-World Integrations': 'fas fa-plug',
  'Product Build': 'fas fa-cube',
}

/* Cards show a capped stack; the full list stays in the modal. */
const MAX_TECH_PILLS = 4

/* Deliberately quieter than the impact tags so the hierarchy holds. Token-driven
   so the light theme works without a second rule. */
const TECH_PILL =
  'inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-elevated)]/50 px-2 py-1 text-[10px] font-medium tracking-wide text-[var(--color-text-muted)] transition-colors duration-200 group-hover:text-[var(--color-text)]'

/* Shared card-action affordances. The press uses the independent `scale`
   property (not `transform`) so it composes with .theme-btn-primary:hover's
   translateY instead of replacing it. */
const ACTION_BASE =
  'flex-1 min-w-[140px] px-4 py-2.5 text-xs text-center active:[scale:0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]'

/* Dashed border + muted ink + not-allowed cursor: reads as unavailable at a
   glance. Rendered as a real disabled <button>, so it is never a focus stop. */
const ACTION_DISABLED =
  'flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-card)]/40 px-4 py-2.5 text-xs font-bold text-[var(--color-text-muted)] opacity-70 cursor-not-allowed select-none'

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]'

function getTechIcon(tech) {
  return TECH_ICONS[tech] || 'fas fa-code'
}

function highlightText(text, query) {
  if (!query?.trim()) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'ig')
  const parts = String(text).split(regex)
  return parts.map((part, idx) =>
    idx % 2 === 1 ? (
      <mark key={`${part}-${idx}`} className="rounded bg-[var(--color-accent)]/30 px-0.5 text-[var(--color-text)]">
        {part}
      </mark>
    ) : (
      <span key={`${part}-${idx}`}>{part}</span>
    )
  )
}

function getImpactTags(project) {
  const tags = new Set()
  if (project.categories?.includes('accessibility')) tags.add('Accessibility')
  if (project.categories?.includes('react') && project.categories?.includes('node')) tags.add('Full-Stack')
  if (project.tech?.some((t) => ['Gemini', 'Ollama', 'ElevenLabs'].includes(t))) tags.add('AI')
  if (project.tech?.some((t) => ['MongoDB', 'SQLite', 'Prisma'].includes(t))) tags.add('Data-Driven')
  if (project.tech?.some((t) => ['Plaid', 'Snowflake'].includes(t))) tags.add('Real-World Integrations')
  if (tags.size === 0) tags.add('Product Build')
  return Array.from(tags).slice(0, 3)
}

/**
 * The card's type badge. Purely derived from data already present — it is the
 * first (most specific) classification getImpactTags() produces.
 */
function deriveProjectType(project) {
  return getImpactTags(project)[0] || 'Product Build'
}

/** '#' is a placeholder, not a destination — treat it as "no link". */
function resolveHref(href) {
  return href && href !== '#' ? href : null
}

function Projects({
  projectStats,
  filters,
  projectFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  onResetFilters,
  projects,
  totalProjects,
}) {
  const reduced = useReducedMotion()
  const [selectedProject, setSelectedProject] = useState(null)
  const [modalImageIndex, setModalImageIndex] = useState(0)
  const featuredProject = projects[0]
  const gridProjects = projects.slice(1)
  const featuredImages = useMemo(
    () => [featuredProject?.iconClass, 'fas fa-layer-group', 'fas fa-lightbulb'].filter(Boolean),
    [featuredProject]
  )

  /* Every entrance timing routes through the shared motion contract, so reduced
     motion collapses it to a fully-visible, zero-duration state. */
  const featuredVariants = useMemo(() => reveal(reduced, 26), [reduced])

  const gridVariants = useMemo(
    () => ({
      /* No opacity on the container on purpose: the grid itself must never be
         the thing that can get stuck invisible. It only orchestrates children. */
      hidden: {},
      visible: {
        transition: reduced
          ? { staggerChildren: 0, delayChildren: 0 }
          : { staggerChildren: 0.08, delayChildren: 0.04 },
      },
    }),
    [reduced]
  )

  const cardVariants = useMemo(() => {
    const base = reveal(reduced, 24)
    if (reduced) {
      /* base.hidden is already { opacity: 1, y: 0 } — cards are visible even if
         whileInView never fires. Exit resolves instantly so nothing lingers. */
      return { ...base, exit: { opacity: 0, transition: { duration: 0 } } }
    }
    return {
      hidden: { ...base.hidden, scale: 0.98 },
      visible: { ...base.visible, scale: 1 },
      exit: { opacity: 0, y: 12, scale: 0.98, transition: { duration: DUR.fast, ease: EASE.standard } },
    }
  }, [reduced])

  // Close modal on Escape key
  useEffect(() => {
    if (!selectedProject) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedProject(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedProject])

  const openProjectModal = (project) => {
    setSelectedProject(project)
    setModalImageIndex(0)
  }

  return (
    <section id="projects" className="section-fade-in relative z-10 min-h-screen overflow-hidden px-6 py-24" aria-labelledby="projects-heading">
      <div className="max-w-7xl mx-auto relative z-10">
        <AnimatedSection className="text-center mb-12" delayOrder={0}>
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-1 w-12 bg-gradient-to-r from-transparent to-[var(--color-accent)] rounded-full" />
            <i className="fas fa-project-diagram text-4xl text-[var(--color-accent)] animate-pulse" />
            <div className="h-1 w-12 bg-gradient-to-l from-transparent to-[var(--color-blue)] rounded-full" />
          </div>
          <h2 id="projects-heading" className="text-5xl md:text-6xl font-extrabold mb-4 animate-gradient">
            Featured Projects
          </h2>
          <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto leading-relaxed">
            Product-focused builds with real constraints, measurable impact, and polished engineering.
          </p>
        </AnimatedSection>
        <AnimatedSection className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto" delayOrder={1}>
          {projectStats.map((stat) => (
            <div
              key={stat.label}
              className={`glass-card p-4 text-center hover:scale-105 transition-transform duration-300`}
            >
              <div className={`text-3xl font-bold mb-1 ${stat.accent}`}>{stat.value}</div>
              <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </AnimatedSection>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto">
        <AnimatedSection className="mb-6 max-w-xl mx-auto" delayOrder={0}>
          <label htmlFor="project-search" className="sr-only">Search projects</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] h-4 w-4" aria-hidden="true" />
            <input
              id="project-search"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by title, tech, or feature..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-[var(--color-bg-card)]/70 border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] transition-all"
            />
          </div>
        </AnimatedSection>
        <AnimatedSection className="flex flex-wrap justify-center gap-3 mb-12 relative" role="group" aria-label="Project filter options" delayOrder={0}>
          {filters.map((filter) => (
            <motion.button
              layout={!reduced}
              key={filter.id}
              type="button"
              className={`filter-btn px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-bg)] cursor-pointer ${
                projectFilter === filter.id
                  ? 'theme-btn theme-btn-primary text-white focus:ring-[var(--color-orange)] shadow-[0_0_24px_rgba(249,115,22,0.25)]'
                  : 'text-[var(--color-text)] bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'
              }`}
              data-filter={filter.id}
              aria-pressed={projectFilter === filter.id}
              onClick={() => onFilterChange(filter.id)}
              whileTap={reduced ? undefined : { scale: 0.96 }}
            >
              <i className={`${filter.icon} mr-2`} aria-hidden="true" />
              {filter.label}
            </motion.button>
          ))}
        </AnimatedSection>
        <AnimatedSection className="flex items-center justify-between gap-4 mb-6 text-sm" delayOrder={0}>
          <p className="text-[var(--color-text-muted)]">
            Showing <span className="font-semibold text-[var(--color-text)]">{projects.length}</span> of{' '}
            <span className="font-semibold text-[var(--color-text)]">{totalProjects}</span> projects
          </p>
          {(projectFilter !== 'all' || searchQuery.trim()) && (
            <button
              type="button"
              onClick={onResetFilters}
              className={`theme-btn theme-btn-secondary px-3 py-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] active:[scale:0.97] ${FOCUS_RING}`}
            >
              Clear filters
            </button>
          )}
        </AnimatedSection>
        {projects.length === 0 && (
          <AnimatedSection className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/40 p-10 text-center mb-6" delayOrder={0}>
            <i className="fas fa-folder-open text-3xl text-[var(--color-accent)] mb-3" aria-hidden="true" />
            <h3 className="text-xl font-bold mb-2">No projects match your search</h3>
            <p className="text-[var(--color-text-muted)] mb-4">Try a different keyword or reset the active filters.</p>
            <button
              type="button"
              onClick={onResetFilters}
              className={`theme-btn theme-btn-primary px-4 py-2 active:[scale:0.97] ${FOCUS_RING}`}
            >
              Reset filters
            </button>
          </AnimatedSection>
        )}
        {featuredProject && (
          <motion.article
            layout={!reduced}
            variants={featuredVariants}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            className="mb-8 rounded-2xl border border-[var(--color-blue)]/25 bg-[var(--color-bg-card)]/45 backdrop-blur-xl overflow-hidden shadow-2xl"
          >
            <div className="grid lg:grid-cols-2">
              <div className="relative min-h-[280px] p-8 bg-gradient-to-br from-[var(--color-blue)]/20 via-[var(--color-accent)]/10 to-[var(--color-orange)]/10">
                <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wider rounded-full px-3 py-1 border border-[var(--color-accent)]/30 bg-[var(--color-bg)]/50 text-[var(--color-accent)] mb-4">
                  <Star className="h-3.5 w-3.5" /> Featured build
                </span>
                <h3 className="text-3xl font-bold mb-3 text-[var(--color-text)]">{highlightText(featuredProject.title, searchQuery)}</h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed mb-5">{highlightText(featuredProject.description, searchQuery)}</p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {getImpactTags(featuredProject).map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-md border border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-200 text-xs font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => openProjectModal(featuredProject)}
                  className={`theme-btn theme-btn-primary px-4 py-2.5 text-sm active:[scale:0.97] ${FOCUS_RING}`}
                >
                  <Sparkles className="h-4 w-4" />
                  Explore Case Study
                </button>
              </div>
              <div className="relative min-h-[280px] flex items-center justify-center bg-[var(--color-bg)]/60">
                <motion.div className="grid grid-cols-3 gap-4 p-8" whileHover={reduced ? undefined : { scale: 1.03 }}>
                  {featuredImages.map((iconClass, idx) => (
                    <motion.div
                      key={`${iconClass}-${idx}`}
                      className="h-20 w-20 rounded-2xl border border-white/10 bg-white/[0.05] flex items-center justify-center text-[var(--color-accent)]"
                      animate={reduced ? { y: 0 } : { y: [0, -6, 0] }}
                      transition={reduced ? { duration: 0 } : { duration: 3 + idx, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <i className={`${iconClass} text-2xl`} aria-hidden />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.article>
        )}

        <motion.div
          layout={!reduced}
          className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.08 }}
          variants={gridVariants}
        >
        <AnimatePresence mode="popLayout">
        {gridProjects.map((project) => {
          const projectType = deriveProjectType(project)
          const secondaryTags = getImpactTags(project).filter((tag) => tag !== projectType)
          const techList = project.tech ?? []
          const shownTech = techList.slice(0, MAX_TECH_PILLS)
          const hiddenTech = techList.slice(MAX_TECH_PILLS)
          const liveHref = resolveHref(project.links?.live)
          const codeHref = resolveHref(project.links?.code)

          return (
          <motion.div
            key={project.id}
            layout={!reduced}
            variants={cardVariants}
            /* Hover elevation lives on this wrapper, not on .project-card, so it
               cannot collide with the inline transform HolographicCard writes. */
            whileHover={reduced ? undefined : { y: -6 }}
            transition={{ duration: DUR.base, ease: EASE.emphasized }}
            className="h-full"
            data-category={project.categories?.join(' ')}
            /* Pointer convenience only — deliberately no role/tabIndex here. The
               card title below is a real button and is the keyboard path in. */
            onClick={() => openProjectModal(project)}
          >
          <Tilt
            tiltEnable={!reduced}
            tiltMaxAngleX={8}
            tiltMaxAngleY={8}
            perspective={800}
            glareEnable={!reduced}
            glareMaxOpacity={0.12}
            glareColor="rgba(125, 211, 252, 0.15)"
            glarePosition="all"
            glareBorderRadius="1rem"
            className="h-full"
          >
          <HolographicCard
            className="project-card project-card--interactive animate-in group relative bg-gradient-to-br from-[var(--color-bg)] to-[var(--color-bg-elevated)] border border-[var(--color-blue)]/20 rounded-2xl overflow-hidden shadow-xl hover:border-[var(--color-blue)] h-full cursor-pointer"
          >
            {/* Sheen reuses the --x/--y HolographicCard already writes on this
                very node, so there is no second pointermove listener. */}
            <div className="project-card__sheen" aria-hidden="true" />
            <span className="project-card__type absolute left-3 top-3 z-10">
              <i className={TYPE_ICONS[projectType] || 'fas fa-cube'} aria-hidden="true" />
              {projectType}
            </span>
            {project.badge && (
              <div className="absolute top-3 right-3 z-10">
                <span className={`bg-gradient-to-r ${project.badge.gradient} text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1`}>
                  <i className={`${project.badge.icon} mr-1`} />
                  {project.badge.label}
                </span>
              </div>
            )}
            <div className="relative h-40 bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-blue)]/20 flex items-center justify-center overflow-hidden">
              <div className="project-card-icon text-6xl text-[var(--color-accent)] transition-transform duration-500 ease-out group-hover:scale-110" style={{ transformOrigin: 'center' }}>
                <i className={project.iconClass} aria-hidden />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] to-transparent opacity-60" />
            </div>
            <div className="p-6 flex flex-col h-full">
              <h3 className="mb-3 text-xl font-bold">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    openProjectModal(project)
                  }}
                  aria-label={`${project.title} — open case study`}
                  className="project-card-title rounded-md text-left bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-blue)] bg-clip-text text-transparent transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--color-bg)]"
                >
                  {highlightText(project.title, searchQuery)}
                </button>
              </h3>
              <p className="text-[var(--color-text)] mb-4 text-sm leading-relaxed">{highlightText(project.description, searchQuery)}</p>
              {secondaryTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {secondaryTags.slice(0, 2).map((tag) => (
                    <span key={tag} className="px-2 py-1 rounded-md border border-[var(--color-accent)]/25 bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-[10px] font-semibold uppercase tracking-wide">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {project.features?.length > 0 && (
                <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Highlights</p>
                  <ul className="space-y-1 text-xs text-[var(--color-text-muted)]">
                    {project.features.slice(0, 2).map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-[var(--color-accent)] mt-0.5" />
                        <span>{highlightText(feature, searchQuery)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex gap-2 flex-wrap mb-4 pt-4 border-t border-[var(--color-border)]">
                {project.disabled ? (
                  <>
                    <button type="button" disabled className={ACTION_DISABLED}>
                      <i className="fas fa-clock" aria-hidden="true" />
                      In Development
                    </button>
                    <button type="button" disabled className={ACTION_DISABLED}>
                      <i className="fab fa-github" aria-hidden="true" />
                      Coming Soon
                    </button>
                  </>
                ) : (
                  <>
                    {liveHref ? (
                      <a
                        href={liveHref}
                        target="_blank"
                        rel="noreferrer"
                        className={`theme-btn theme-btn-primary ${ACTION_BASE}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          trackProjectClick(project.id)
                        }}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Live Demo
                      </a>
                    ) : (
                      <button type="button" disabled className={ACTION_DISABLED}>
                        <i className="fas fa-clock" aria-hidden="true" />
                        Demo Coming Soon
                      </button>
                    )}
                    {codeHref ? (
                      <a
                        href={codeHref}
                        target="_blank"
                        rel="noreferrer"
                        className={`theme-btn theme-btn-secondary border-[var(--color-accent)]/30 hover:border-[var(--color-accent)] ${ACTION_BASE}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          trackProjectClick(project.id)
                        }}
                      >
                        <Code2 className="h-3.5 w-3.5" />
                        GitHub
                      </a>
                    ) : (
                      <button type="button" disabled className={ACTION_DISABLED}>
                        <i className="fab fa-github" aria-hidden="true" />
                        Code Coming Soon
                      </button>
                    )}
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
              {shownTech.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {shownTech.map((tech) => (
                    <span key={tech} className={TECH_PILL} title={tech}>
                      <i className={getTechIcon(tech)} aria-hidden="true" style={{ fontSize: '0.7rem' }} />
                      {tech}
                    </span>
                  ))}
                  {hiddenTech.length > 0 && (
                    <span className={TECH_PILL} title={`Also uses ${hiddenTech.join(', ')}`}>
                      {`+${hiddenTech.length}`}
                    </span>
                  )}
                </div>
              )}
            </div>
          </HolographicCard>
          </Tilt>
          </motion.div>
          )
        })}
        </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <motion.div
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm p-4 md:p-6 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: reduced ? 0 : 0.2 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-[0_20px_80px_rgba(0,0,0,0.5)]"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={`${selectedProject.title} details`}
            >
              <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)]">
                <h3 className="text-xl md:text-2xl font-bold text-[var(--color-text)]">{selectedProject.title}</h3>
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  aria-label="Close project details"
                  className="theme-btn theme-btn-secondary h-10 w-10 p-0 active:[scale:0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-elevated)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-72px)] p-5 md:p-6 grid lg:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]/60 p-6 flex items-center justify-center min-h-[220px]">
                  <motion.div className="w-full h-full grid place-items-center text-[var(--color-accent)]" whileHover={reduced ? undefined : { scale: 1.02 }}>
                    <i className={`${selectedProject.iconClass} text-7xl`} aria-hidden />
                  </motion.div>
                </div>
                <div>
                  <p className="text-[var(--color-text-muted)] leading-relaxed mb-4">{selectedProject.description}</p>
                  <h4 className="font-semibold text-[var(--color-text)] mb-2">Key Features</h4>
                  <ul className="space-y-2 mb-5">
                    {(selectedProject.features || []).slice(0, 6).map((feature) => (
                      <li key={feature} className="text-sm text-[var(--color-text-muted)] flex items-start gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-[var(--color-accent)] mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {selectedProject.tech?.map((tech) => (
                      <span key={tech} className="inline-flex items-center gap-1.5 bg-[var(--color-accent)]/20 text-[var(--color-accent)] px-3 py-1.5 rounded-full text-xs font-semibold border border-[var(--color-accent)]/30">
                        <i className={getTechIcon(tech)} aria-hidden style={{ fontSize: '0.75rem' }} />
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {resolveHref(selectedProject.links?.live) && (
                      <a
                        href={selectedProject.links.live}
                        target="_blank"
                        rel="noreferrer"
                        className="theme-btn theme-btn-primary px-4 py-2.5 text-sm active:[scale:0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-elevated)]"
                        onClick={() => trackProjectClick(selectedProject.id)}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Live Demo
                      </a>
                    )}
                    {resolveHref(selectedProject.links?.code) && (
                      <a
                        href={selectedProject.links.code}
                        target="_blank"
                        rel="noreferrer"
                        className="theme-btn theme-btn-secondary px-4 py-2.5 text-sm active:[scale:0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-elevated)]"
                        onClick={() => trackProjectClick(selectedProject.id)}
                      >
                        <Code2 className="h-4 w-4" />
                        GitHub
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default Projects
