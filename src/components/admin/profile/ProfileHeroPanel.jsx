import { motion } from 'framer-motion'
import { Fingerprint, Globe2, Sparkles, Zap } from 'lucide-react'
import {
  generateProfileInsights,
  narrativeScore,
  profileCompletion,
  visibilityState,
} from './profileInsights'

export default function ProfileHeroPanel({ values, lastSynced }) {
  const completion = profileCompletion(values)
  const narrative = narrativeScore(values)
  const visibility = visibilityState(values)
  const headline = generateProfileInsights(values)[0]
  const name = values?.full_name?.trim() || 'Identity orchestration'

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 90, damping: 18 }}
      className="idf-hero-panel relative overflow-hidden rounded-2xl border border-white/[0.08] p-4 md:p-5"
    >
      <motion.div className="idf-hero-banner pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="idf-pill">
              <Fingerprint className="h-3.5 w-3.5" aria-hidden />
              Identity OS
            </span>
            <span className={`idf-pill idf-pill-${visibility.tone}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${visibility.live ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {visibility.label}
            </span>
            <span className="idf-pill idf-pill-ai">
              <Zap className="h-3.5 w-3.5" />
              AI profile optimization active
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-white md:text-2xl">{name}</h2>
            <p className="mt-1 text-sm text-slate-400">
              Configure your public persona, narrative, and digital presence across the workspace.
            </p>
          </div>
          {headline ? (
            <motion.div
              key={headline.title}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="idf-insight-snippet flex gap-2 rounded-xl border border-violet-400/20 bg-violet-400/[0.06] px-3 py-2.5"
            >
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" aria-hidden />
              <div>
                <p className="text-xs font-medium text-violet-100">{headline.title}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{headline.body}</p>
              </div>
            </motion.div>
          ) : null}
          <motion.div className="flex flex-wrap gap-3 text-[11px] text-slate-500">
            <span>Hero narrative {values?.bio_story?.filter(Boolean).length ? 'configured' : 'pending'}</span>
            <span aria-hidden>·</span>
            <span>Workspace sync {completion >= 70 ? 'stable' : 'building'}</span>
            {lastSynced ? (
              <>
                <span aria-hidden>·</span>
                <span>Updated {lastSynced}</span>
              </>
            ) : null}
          </motion.div>
        </div>
        <div className="flex flex-wrap items-center gap-3 lg:flex-col lg:items-end">
          <div className="idf-hero-stat">
            <span className="text-[10px] uppercase tracking-wider text-slate-500">Completion</span>
            <span className="text-2xl font-semibold tabular-nums text-violet-200">{completion}%</span>
          </div>
          <div className="idf-hero-stat">
            <span className="text-[10px] uppercase tracking-wider text-slate-500">Narrative</span>
            <span className="text-2xl font-semibold tabular-nums text-cyan-200">{narrative}</span>
          </div>
          <span className="idf-pill">
            <Globe2 className="h-3.5 w-3.5" />
            Public visibility {visibility.live ? 'on' : 'draft'}
          </span>
        </div>
      </div>
    </motion.section>
  )
}
