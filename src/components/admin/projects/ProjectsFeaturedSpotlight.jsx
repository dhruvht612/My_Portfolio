import { motion } from 'framer-motion'
import { Code2, ExternalLink, Pencil, Star } from 'lucide-react'
import ProjectSparkline from './ProjectSparkline'
import ProjectStatusBadge from './ProjectStatusBadge'
import ProjectTechStack from './ProjectTechStack'
import { parseProjectBadge } from './projectBadge'
import { projectMetrics } from './projectInsights'

export default function ProjectsFeaturedSpotlight({ project, onEdit }) {
  if (!project) return null

  const metrics = projectMetrics(project)
  const badge = parseProjectBadge(project.badge)

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="proj-spotlight relative overflow-hidden rounded-2xl border border-amber-400/20"
    >
      <div className="proj-spotlight-glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative grid gap-0 md:grid-cols-[1.1fr_1fr]">
        <div className="relative min-h-[200px] overflow-hidden md:min-h-[240px]">
          {project.image_url ? (
            <img src={project.image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-sky-500/20 to-violet-600/20">
              <i className={`${project.icon_class || 'fas fa-code'} text-6xl text-sky-300/40`} aria-hidden />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-200">
            <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
            Featured
          </span>
        </div>
        <div className="flex flex-col justify-between gap-4 p-4 md:p-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <ProjectStatusBadge row={project} size="lg" />
              {badge.label ? (
                <span className={`proj-badge-label inline-flex items-center bg-gradient-to-r ${badge.gradient}`}>
                  <i className={`${badge.icon} mr-1`} aria-hidden />
                  {badge.label}
                </span>
              ) : null}
            </div>
            <h3 className="mt-3 text-xl font-bold text-white md:text-2xl">{project.title}</h3>
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-400">{project.description}</p>
            <div className="mt-3">
              <ProjectTechStack stack={project.tech_stack} max={8} />
            </div>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-3 border-t border-white/[0.06] pt-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Engagement trend</p>
              <ProjectSparkline row={project} className="mt-1" />
              <p className="mt-1 text-xs text-slate-500">
                <span className="font-semibold text-sky-300">{metrics.views}</span> modeled views · rank #
                {metrics.rank}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => onEdit(project)} className="proj-action-btn">
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
              {project.live_url ? (
                <a href={project.live_url} target="_blank" rel="noreferrer" className="proj-action-btn proj-action-primary">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Live
                </a>
              ) : null}
              {project.code_url ? (
                <a href={project.code_url} target="_blank" rel="noreferrer" className="proj-action-btn">
                  <Code2 className="h-3.5 w-3.5" />
                  GitHub
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
