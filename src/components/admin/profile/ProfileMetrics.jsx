import { motion } from 'framer-motion'
import { Eye, Radar, Search, Sparkles, Wifi } from 'lucide-react'
import { narrativeScore, profileCompletion, seoReadiness } from './profileInsights'

function MiniRing({ value, color }) {
  const r = 18
  const c = 2 * Math.PI * r
  const offset = c - (value / 100) * c
  return (
    <svg width="44" height="44" className="idf-ring-glow shrink-0 -rotate-90">
      <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
      <motion.circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: offset }}
        transition={{ type: 'spring', stiffness: 80, damping: 18 }}
      />
    </svg>
  )
}

export default function ProfileMetrics({ values, saveState }) {
  const completion = profileCompletion(values)
  const narrative = narrativeScore(values)
  const seo = seoReadiness(values)
  const roles = (values?.typed_roles || []).filter(Boolean).length

  const cards = [
    { label: 'Public profile', value: `${completion}%`, sub: 'Identity strength', icon: Radar, ring: completion, color: '#a78bfa' },
    { label: 'AI optimization', value: saveState === 'saved' ? 'Synced' : saveState === 'dirty' ? 'Pending' : 'Active', sub: 'Workspace state', icon: Sparkles, pulse: true },
    { label: 'SEO readiness', value: `${seo}%`, sub: 'Discoverability', icon: Search, ring: seo, color: '#22d3ee' },
    { label: 'Hero roles', value: String(roles), sub: 'Typed descriptors', icon: Eye },
    { label: 'Narrative score', value: String(narrative), sub: 'Story depth', icon: Wifi, ring: narrative, color: '#34d399' },
  ]

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-1">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 * i }}
          whileHover={{ y: -2 }}
          className="idf-metric-card"
        >
          <motion.div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{card.label}</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-100">{card.value}</p>
              <p className="text-[10px] text-slate-500">{card.sub}</p>
            </div>
            {card.ring != null ? (
              <MiniRing value={card.ring} color={card.color} />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
                <card.icon className={`h-4 w-4 text-violet-300 ${card.pulse ? 'animate-pulse' : ''}`} />
              </span>
            )}
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}
