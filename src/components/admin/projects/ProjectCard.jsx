import { useCallback, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BarChart3,
  ExternalLink,
  Code2,
  Pencil,
  Star,
  Trash2,
} from 'lucide-react'
import ActionMenu from '../ActionMenu'
import ProjectExpandedPanel from './ProjectExpandedPanel'
import ProjectSparkline from './ProjectSparkline'
import ProjectStatusBadge from './ProjectStatusBadge'
import ProjectTechStack from './ProjectTechStack'
import { parseProjectBadge } from './projectBadge'
import { projectMetrics } from './projectInsights'

export default function ProjectCard({
  row,
  expanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onToggleFeatured,
  index = 0,
}) {
  const cardRef = useRef(null)
  const [hover, setHover] = useState(false)
  const metrics = projectMetrics(row)
  const badge = parseProjectBadge(row.badge)

  const onMove = useCallback((e) => {
    const el = cardRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--spot-x', `${e.clientX - r.left}px`)
    el.style.setProperty('--spot-y', `${e.clientY - r.top}px`)
  }, [])

  const menuItems = [
    { id: 'edit', label: 'Edit', onClick: () => onEdit(row) },
    ...(row.live_url
      ? [{ id: 'live', label: 'Open live site', onClick: () => window.open(row.live_url, '_blank', 'noopener') }]
      : []),
    ...(row.code_url
      ? [{ id: 'gh', label: 'View GitHub', onClick: () => window.open(row.code_url, '_blank', 'noopener') }]
      : []),
    {
      id: 'feature',
      label: row.is_featured ? 'Unfeature' : 'Feature project',
      onClick: () => onToggleFeatured?.(row),
    },
    { id: 'dup', label: 'Duplicate (edit copy)', onClick: () => onEdit({ ...row, id: null, title: `${row.title} (copy)` }) },
    { id: 'del', label: 'Delete', danger: true, onClick: () => onDelete(row) },
  ]

  return (
    <motion.article
      ref={cardRef}
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 90, damping: 18 }}
      onMouseMove={onMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`proj-card group ${expanded ? 'proj-card-expanded' : ''} ${row.is_featured ? 'proj-card-featured' : ''}`}
    >
      <div className="proj-card-spotlight pointer-events-none" aria-hidden />
      <button
        type="button"
        onClick={onToggleExpand}
        className="block w-full text-left"
        aria-expanded={expanded}
      >
        <motion.div className="relative h-36 overflow-hidden sm:h-40">
          {row.image_url ? (
            <motion.img
              src={row.image_url}
              alt=""
              className="h-full w-full object-cover"
              animate={{ scale: hover ? 1.04 : 1 }}
              transition={{ duration: 0.4 }}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-sky-500/15 to-indigo-600/20">
              <i className={`${row.icon_class || 'fas fa-code'} text-5xl text-sky-300/35`} aria-hidden />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <ProjectStatusBadge row={row} />
            {row.is_featured ? (
              <span className="proj-featured-mini">
                <Star className="h-3 w-3" />
              </span>
            ) : null}
          </div>
          {badge.label ? (
            <span className={`absolute right-3 top-3 proj-badge-label bg-gradient-to-r ${badge.gradient}`}>
              <i className={`${badge.icon} mr-1`} aria-hidden />
              {badge.label}
            </span>
          ) : null}
          <AnimatePresence>
            {hover ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-3 right-3 flex gap-1.5"
              >
                <span className="proj-quick-pill">
                  <BarChart3 className="h-3 w-3" />
                  {metrics.engagement}%
                </span>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>

        <div className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-slate-100 group-hover:text-sky-100">{row.title}</h3>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">{row.description}</p>
            </div>
            <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
              <ActionMenu items={menuItems} variant="horizontal" triggerLabel={`Actions for ${row.title}`} />
            </div>
          </div>
          <ProjectTechStack stack={row.tech_stack} max={5} compact />
          <div className="flex items-center justify-between border-t border-white/[0.05] pt-3">
            <div className="flex items-center gap-3 text-[10px] text-slate-500">
              <span>
                <span className="font-semibold text-slate-300">{metrics.views}</span> views
              </span>
              <ProjectSparkline row={row} />
            </div>
            <motion.div
              className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <button type="button" onClick={() => onEdit(row)} className="proj-icon-btn" aria-label="Edit">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              {row.live_url ? (
                <a href={row.live_url} target="_blank" rel="noreferrer" className="proj-icon-btn" aria-label="Live">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
              {row.code_url ? (
                <a href={row.code_url} target="_blank" rel="noreferrer" className="proj-icon-btn" aria-label="GitHub">
                  <Code2 className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </motion.div>
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded ? <ProjectExpandedPanel row={row} /> : null}
      </AnimatePresence>
    </motion.article>
  )
}
