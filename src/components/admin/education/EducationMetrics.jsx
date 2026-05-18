import { motion } from 'framer-motion'
import { Award, BookOpen, Layers, Target, Zap } from 'lucide-react'
import DashboardAnimatedNumber from '../dashboard/DashboardAnimatedNumber'
import {
  creditsEarned,
  learningMomentum,
  portfolioAlignment,
  semestersCompleted,
  specializationStrength,
} from './educationInsights'

const METRICS = [
  { key: 'credits', icon: BookOpen, label: 'Credits modeled', fn: creditsEarned },
  { key: 'semesters', icon: Layers, label: 'Semesters', fn: semestersCompleted },
  { key: 'momentum', icon: Zap, label: 'Momentum', fn: learningMomentum, suffix: '%', extra: (v, a) => learningMomentum(v, a) },
  { key: 'spec', icon: Target, label: 'Specialization', fn: (_, f) => specializationStrength(f), fromFocus: true },
  { key: 'align', icon: Award, label: 'Portfolio fit', fn: (_, f, h) => portfolioAlignment(f, h), fromAll: true },
]

export default function EducationMetrics({ values }) {
  const pct = values?.progress_percent ?? 0
  const focus = values?.focus_areas ?? []
  const highlights = values?.highlights ?? []
  const active = values?.is_active ?? true

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
      {METRICS.map(({ key, icon: Icon, label, fn, suffix = '', fromFocus, fromAll }, i) => {
        let val = fn(pct, focus, highlights)
        if (key === 'momentum') val = learningMomentum(pct, active)
        if (fromFocus) val = specializationStrength(focus)
        if (fromAll) val = portfolioAlignment(focus, highlights)

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -2 }}
            className="edu-metric-card"
          >
            <Icon className="h-3.5 w-3.5 text-sky-400/80" aria-hidden />
            <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">{label}</p>
            <p className="mt-0.5 text-lg font-semibold text-slate-100">
              <DashboardAnimatedNumber value={val} />
              {suffix}
            </p>
          </motion.div>
        )
      })}
    </div>
  )
}
