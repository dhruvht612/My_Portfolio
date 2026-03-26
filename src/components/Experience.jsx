import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  Compass,
  Handshake,
  MapPin,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import SpaceBackground from './SpaceBackground'
const QUICK_HIGHLIGHTS = [
  { label: 'Leadership Roles', value: '3+', icon: BriefcaseBusiness },
  { label: 'Events Organized', value: '10+', icon: CalendarDays },
  { label: 'Students Impacted', value: '500+', icon: Users },
  { label: 'Current Position', value: 'Director @ CCubed', icon: Compass },
]

const IMPACT_MAP = {
  'Director of Outreach': {
    bullets: [
      'Scaled outreach campaigns across 15+ universities, expanding partner touchpoints nationally.',
      'Improved participation in collaborative programs by ~25% through targeted campus engagement.',
      'Built partnerships with startups, accelerators, and investors to unlock student opportunities.',
      'Represented CCubed at events and panels, increasing organizational visibility in the tech ecosystem.',
      'Contributed to strategic planning, aligning outreach with long-term growth goals.',
    ],
    badges: ['Leadership', 'Outreach', 'Partnerships', 'Strategy'],
    metrics: ['15+ universities', '+25% participation', 'Startup/Investor partnerships'],
    icon: Handshake,
  },
  'Vice President of Events': {
    bullets: [
      'Led end-to-end planning for technical events, increasing session consistency and attendee satisfaction.',
      'Coordinated cross-functional volunteers to deliver workshops and networking experiences on schedule.',
      'Optimized event promotion with targeted outreach, driving stronger turnout across student cohorts.',
    ],
    badges: ['Leadership', 'Events', 'Community'],
    metrics: ['9+ months leadership', 'Multi-event delivery'],
    icon: TrendingUp,
  },
  'Director of External Relations': {
    bullets: [
      'Designed partner outreach workflows that improved sponsor and stakeholder response quality.',
      'Served as primary liaison for external communications, translating organizational goals into partnerships.',
      'Tracked partnership outcomes to guide future collaboration strategy and event planning.',
    ],
    badges: ['Outreach', 'Leadership', 'Partnerships'],
    metrics: ['Primary external liaison'],
    icon: Handshake,
  },
  'Outreach Coordinator': {
    bullets: [
      'Coordinated communications between students, institutions, and external stakeholders at national scale.',
      'Supported virtual and in-person outreach activations to improve visibility of programs and opportunities.',
      'Consolidated outreach feedback and reporting to help teams prioritize high-impact initiatives.',
    ],
    badges: ['Outreach', 'Community'],
    metrics: ['National stakeholder coordination'],
    icon: Users,
  },
  'Vice President of Technology': {
    bullets: [
      'Led website delivery for OT Media Pass, improving usability and digital event-readiness.',
      'Aligned technical execution with executive priorities to support media operations across events.',
      'Improved structure and performance to create a stronger audience experience.',
    ],
    badges: ['Tech', 'Leadership', 'Product'],
    metrics: ['Website modernization', 'Performance uplift'],
    icon: BriefcaseBusiness,
  },
}

function Experience({ experienceByOrg = [] }) {
  const [expanded, setExpanded] = useState({})
  const allRoles = useMemo(
    () => experienceByOrg.flatMap((org) => org.roles.map((role) => ({ ...role, org: org.org, orgSub: org.orgSub }))),
    [experienceByOrg]
  )
  const featuredRole = allRoles.find((r) => r.title === 'Director of Outreach')
  const timelineRoles = allRoles.filter((r) => r.title !== 'Director of Outreach')

  const toggleExpanded = (key) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))

  if (!Array.isArray(experienceByOrg) || experienceByOrg.length === 0) {
    return (
      <section
        id="experience"
        className="py-20 px-6 bg-[var(--color-bg)] text-[var(--color-text)] relative overflow-hidden"
        aria-labelledby="experience-heading"
      >
        <SpaceBackground />
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-bg-elevated)]/50 to-[var(--color-bg-elevated)] pointer-events-none" aria-hidden="true" />
        <div className="max-w-5xl mx-auto relative z-10 text-center py-16">
          <h2 id="experience-heading" className="text-5xl md:text-6xl font-extrabold mb-4">Leadership &amp; Impact</h2>
          <p className="text-[var(--color-text-muted)]">No experience entries to show yet.</p>
        </div>
      </section>
    )
  }

  return (
    <section
      id="experience"
      className="py-24 px-6 bg-[var(--color-bg)] text-[var(--color-text)] relative overflow-hidden"
      aria-labelledby="experience-heading"
    >
      <SpaceBackground />
      <div className="beyond-grid-bg pointer-events-none absolute inset-0 opacity-[0.2]" aria-hidden="true" />
      <div className="beyond-noise pointer-events-none absolute inset-0 opacity-[0.03]" aria-hidden="true" />
      <div className="absolute -left-20 top-20 w-80 h-80 rounded-full bg-blue-500/20 blur-[120px] pointer-events-none" aria-hidden="true" />
      <div className="absolute right-[-8%] top-1/3 w-96 h-96 rounded-full bg-purple-500/16 blur-[130px] pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-bg-elevated)]/50 to-[var(--color-bg-elevated)] pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-accent)]/5 to-transparent pointer-events-none" aria-hidden="true" />
      <motion.div
        className="max-w-6xl mx-auto relative z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } } }}
      >
        <motion.div className="text-center mb-12" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-1 w-12 bg-gradient-to-r from-transparent to-[var(--color-accent)] rounded-full" />
            <BriefcaseBusiness className="h-10 w-10 text-[var(--color-accent)]" aria-hidden="true" />
            <div className="h-1 w-12 bg-gradient-to-l from-transparent to-[var(--color-blue)] rounded-full" />
          </div>
          <h2 id="experience-heading" className="text-5xl md:text-6xl font-extrabold mb-4 animate-gradient">
            Leadership &amp; Impact
          </h2>
          <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto leading-relaxed">
            Leading student communities and building partnerships across Canada&apos;s tech ecosystem.
          </p>
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {QUICK_HIGHLIGHTS.map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-[var(--color-bg-card)]/45 backdrop-blur-md p-4 text-center hover:-translate-y-0.5 hover:border-[var(--color-accent)]/40 transition-all">
              <item.icon className="h-4 w-4 text-[var(--color-accent)] mx-auto mb-2" />
              <p className="text-lg font-extrabold text-[var(--color-text)]">{item.value}</p>
              <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">{item.label}</p>
            </div>
          ))}
        </motion.div>

        {featuredRole && (
          <motion.article
            variants={{ hidden: { opacity: 0, y: 20, scale: 0.99 }, visible: { opacity: 1, y: 0, scale: 1 } }}
            className="relative mb-10 rounded-2xl overflow-hidden border border-[var(--color-accent)]/35 bg-[var(--color-bg-card)]/55 backdrop-blur-xl p-6 md:p-8 shadow-[0_0_40px_rgba(125,211,252,0.18)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/10 via-transparent to-purple-500/10 pointer-events-none" aria-hidden="true" />
            <div className="relative">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-accent)]/35 bg-[var(--color-accent)]/15 px-3 py-1 text-xs font-semibold text-[var(--color-accent)]">
                  <Sparkles className="h-3.5 w-3.5" /> Featured Role
                </span>
                <span className="inline-flex rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-xs text-[var(--color-text-muted)]">
                  {featuredRole.org}
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-[var(--color-text)] mb-1">{featuredRole.title}</h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-4">{featuredRole.dateRange} · {featuredRole.location}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {(IMPACT_MAP[featuredRole.title]?.metrics || []).map((metric) => (
                  <span key={metric} className="inline-flex items-center gap-1 rounded-full border border-blue-400/35 bg-blue-500/12 px-3 py-1 text-xs font-semibold text-blue-200">
                    <TrendingUp className="h-3.5 w-3.5" /> {metric}
                  </span>
                ))}
              </div>
              <ul className="space-y-2.5 text-sm text-[var(--color-text-muted)]">
                {(IMPACT_MAP[featuredRole.title]?.bullets || []).map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2">
                    <BadgeCheck className="h-4 w-4 text-[var(--color-accent)] mt-0.5 shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.article>
        )}

        <div className="relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-gradient-to-b from-[var(--color-accent)]/20 via-[var(--color-blue)]/65 to-[var(--color-accent)]/20 rounded-full" aria-hidden="true" />
          <div className="space-y-6">
            {timelineRoles.map((role, index) => {
              const details = IMPACT_MAP[role.title]
              const roleBullets = details?.bullets || role.bullets || (role.description ? [role.description] : [])
              const badges = details?.badges || ['Leadership']
              const chips = details?.metrics || []
              const Icon = details?.icon || BriefcaseBusiness
              const key = `${role.org}|${role.title}`
              const isExpanded = !!expanded[key]
              const isCurrent = /present/i.test(role.dateRange || '')

              return (
                <motion.article
                  key={key}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.12 }}
                  transition={{ duration: 0.4, delay: index * 0.04 }}
                  className={`relative rounded-2xl border bg-[var(--color-bg-card)]/45 backdrop-blur-md p-5 md:p-6 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(125,211,252,0.12)] ${
                    isCurrent ? 'border-[var(--color-accent)]/45' : 'border-white/10'
                  }`}
                  style={{ marginLeft: index % 2 === 0 ? '2rem' : undefined, marginRight: index % 2 !== 0 ? '2rem' : undefined }}
                >
                  <motion.div
                    className={`absolute left-0 md:left-1/2 top-8 -translate-x-1/2 h-3.5 w-3.5 rounded-full border-2 bg-[var(--color-bg)] ${
                      isCurrent ? 'border-[var(--color-accent)] shadow-[0_0_20px_rgba(125,211,252,0.8)]' : 'border-[var(--color-blue)]'
                    }`}
                    animate={isCurrent ? { scale: [1, 1.2, 1], opacity: [0.9, 1, 0.9] } : {}}
                    transition={{ duration: 2.2, repeat: Infinity }}
                  />
                  <div className="flex items-start gap-3 mb-3">
                    <div className="h-10 w-10 rounded-xl border border-white/15 bg-white/[0.05] flex items-center justify-center text-[var(--color-accent)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-[var(--color-text)]">{role.title}</h4>
                      <p className="text-sm text-[var(--color-text-muted)]">{role.org}</p>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-[var(--color-text-muted)]">
                        <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5 text-[var(--color-accent)]" /> {role.dateRange}</span>
                        {role.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-[var(--color-accent)]" /> {role.location}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {badges.map((badge) => (
                      <span key={badge} className="inline-flex px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wide border border-purple-400/30 bg-purple-500/10 text-purple-200">{badge}</span>
                    ))}
                    {chips.map((chip) => (
                      <span key={chip} className="inline-flex px-2.5 py-1 rounded-full text-[10px] border border-blue-400/30 bg-blue-500/10 text-blue-200">{chip}</span>
                    ))}
                  </div>

                  <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                    {(isExpanded ? roleBullets : roleBullets.slice(0, 2)).map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2">
                        <BadgeCheck className="h-4 w-4 text-[var(--color-accent)] mt-0.5 shrink-0" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  {roleBullets.length > 2 && (
                    <button
                      type="button"
                      onClick={() => toggleExpanded(key)}
                      className="mt-3 theme-btn theme-btn-secondary px-3 py-2 text-xs"
                    >
                      {isExpanded ? 'Show less' : 'Show full impact'}
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </motion.article>
              )
            })}
          </div>
        </div>
      </motion.div>
    </section>
  )
}

export default Experience