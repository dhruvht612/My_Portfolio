import { motion } from 'framer-motion'
import { BrainCircuit, GraduationCap, Sparkles, TrendingUp } from 'lucide-react'
import EducationProgressRing from './EducationProgressRing'
import { generateInsights, yearFromProgress } from './educationInsights'

export default function EducationHeroPanel({ values }) {
  const {
    institution = '',
    degree = '',
    progress_percent: pct = 0,
    focus_areas: focus = [],
    is_active: active = true,
    logo_url: logo,
  } = values || {}

  const insights = generateInsights(values)
  const headline = insights[0]
  const year = yearFromProgress(pct)
  const areas = focus.filter(Boolean).slice(0, 4)

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 90, damping: 18 }}
      className="edu-hero-panel relative overflow-hidden rounded-2xl border border-white/[0.08] p-4 md:p-5"
    >
      <motion.div className="edu-hero-banner pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="edu-pill">
              <GraduationCap className="h-3.5 w-3.5" aria-hidden />
              Student OS
            </span>
            {active ? (
              <span className="edu-pill edu-pill-live">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active enrollment
              </span>
            ) : null}
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-white md:text-2xl">
              {institution || 'Academic identity'}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {degree || 'Add your degree to power the public Education journey'}
            </p>
          </div>
          {headline ? (
            <motion.div
              key={headline.title}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="edu-insight-snippet flex gap-2 rounded-xl border border-sky-400/20 bg-sky-400/[0.06] px-3 py-2.5"
            >
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" aria-hidden />
              <div>
                <p className="text-xs font-medium text-sky-100">{headline.title}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{headline.body}</p>
              </div>
            </motion.div>
          ) : null}
          {areas.length ? (
            <div className="flex flex-wrap gap-1.5">
              {areas.map((a) => (
                <span key={a} className="edu-focus-chip text-[11px]">
                  {a}
                </span>
              ))}
            </div>
          ) : null}
          <p className="flex items-center gap-1.5 text-[11px] text-violet-300/80">
            <TrendingUp className="h-3.5 w-3.5" />
            Year {year} trajectory · {pct}% degree path modeled
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 md:items-end">
          {logo ? (
            <motion.img
              src={logo}
              alt=""
              className="h-14 w-14 rounded-xl border border-white/10 bg-white/95 object-contain p-1.5 shadow-lg"
              whileHover={{ scale: 1.04 }}
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.03] text-slate-500">
              <GraduationCap className="h-6 w-6" />
            </div>
          )}
          <EducationProgressRing percent={pct} isActive={active} />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 border-t border-white/[0.06] pt-3 text-[10px] uppercase tracking-[0.16em] text-slate-500">
        <BrainCircuit className="h-3.5 w-3.5 text-violet-400/80" />
        Academic command center · live preview
      </div>
    </motion.section>
  )
}
