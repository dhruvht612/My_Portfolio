import { motion } from 'framer-motion'
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts'
import { focusRadarData, SUGGESTED_FOCUS } from './educationInsights'

export default function EducationFocusViz({ focusAreas = [], onToggle }) {
  const tags = focusAreas.filter(Boolean)
  const data = focusRadarData(tags)
  const readonly = !onToggle

  return (
    <section className="edu-glass-card p-4">
      <header className="mb-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300/90">Expertise map</p>
        <h3 className="text-sm font-semibold text-slate-100">Focus areas</h3>
      </header>
      <div className="h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
            <PolarGrid stroke="rgba(148,163,184,0.15)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(148,163,184,0.75)', fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Focus"
              dataKey="score"
              stroke="#38bdf8"
              fill="url(#eduRadarFill)"
              fillOpacity={0.45}
              strokeWidth={2}
            />
            <defs>
              <linearGradient id="eduRadarFill" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.35} />
              </linearGradient>
            </defs>
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {SUGGESTED_FOCUS.map((tag) => {
          const on = tags.includes(tag)
          if (readonly) {
            return on ? (
              <span key={tag} className="edu-focus-chip">
                {tag}
              </span>
            ) : null
          }
          return (
            <motion.button
              key={tag}
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (on) onToggle(tags.filter((t) => t !== tag))
                else onToggle([...tags, tag])
              }}
              className={`edu-focus-chip cursor-pointer transition-all ${on ? 'edu-focus-chip-active' : 'opacity-60 hover:opacity-100'}`}
            >
              {tag}
            </motion.button>
          )
        })}
      </div>
      {!readonly && tags.length > 0 ? (
        <p className="mt-2 text-[10px] text-slate-500">Tap chips to toggle · custom areas in the form below</p>
      ) : null}
    </section>
  )
}
