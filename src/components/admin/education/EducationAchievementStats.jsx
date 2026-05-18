import { motion } from 'framer-motion'
import { Flame, Medal, Rocket, Trophy } from 'lucide-react'
import DashboardAnimatedNumber from '../dashboard/DashboardAnimatedNumber'

export default function EducationAchievementStats({ values }) {
  const highlights = (values?.highlights || []).filter((h) => h?.title?.trim())
  const focus = (values?.focus_areas || []).filter(Boolean)
  const pct = values?.progress_percent ?? 0

  const stats = [
    { icon: Flame, label: 'Academic streak', value: values?.is_active ? Math.max(3, Math.round(pct / 12)) : 0, unit: 'wks' },
    { icon: Rocket, label: 'Focus domains', value: focus.length, unit: '' },
    { icon: Medal, label: 'Milestones', value: highlights.length, unit: '' },
    { icon: Trophy, label: 'Tech focus', value: Math.min(99, 48 + focus.length * 10 + highlights.length * 5), unit: '%' },
  ]

  return (
    <div className="grid grid-cols-2 gap-2">
      {stats.map(({ icon: Icon, label, value, unit }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          whileHover={{ y: -2 }}
          className="edu-achievement-stat"
        >
          <Icon className="h-4 w-4 text-amber-300/80" />
          <p className="mt-2 text-[10px] text-slate-500">{label}</p>
          <p className="text-lg font-bold text-slate-100">
            <DashboardAnimatedNumber value={value} />
            {unit ? <span className="ml-0.5 text-xs font-normal text-slate-500">{unit}</span> : null}
          </p>
        </motion.div>
      ))}
    </div>
  )
}
