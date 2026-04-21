import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Award,
  BookOpenCheck,
  BrainCircuit,
  ChevronDown,
  ExternalLink,
  FolderGit2,
  GraduationCap,
  Sparkles,
  Workflow,
} from 'lucide-react'

function Certifications({ certifications }) {
  const [expandedId, setExpandedId] = useState(null)
  const featuredCerts = useMemo(() => certifications.filter((c) => c.featured).slice(0, 3), [certifications])
  const additionalCerts = useMemo(
    () => certifications.filter((c) => !featuredCerts.some((f) => f.title === c.title)),
    [certifications, featuredCerts]
  )
  const groupedAdditional = useMemo(() => {
    return additionalCerts.reduce((acc, cert) => {
      const key = cert.category || 'Additional'
      if (!acc[key]) acc[key] = []
      acc[key].push(cert)
      return acc
    }, {})
  }, [additionalCerts])

  const categoryIcon = {
    AI: BrainCircuit,
    'Version Control': FolderGit2,
    'Web Development': Workflow,
    Additional: BookOpenCheck,
  }

  const issuerPill = {
    DataCamp: 'from-emerald-500/20 to-teal-500/20 border-emerald-400/30 text-emerald-200',
    Udemy: 'from-violet-500/20 to-fuchsia-500/20 border-violet-400/30 text-violet-200',
  }

  const toggleExpanded = (key) => setExpandedId((prev) => (prev === key ? null : key))

  return (
    <section
      id="certifications"
      className="section-fade-in relative z-10 min-h-screen overflow-hidden px-6 py-20 text-[var(--color-text)]"
      aria-labelledby="certifications-heading"
    >
      <motion.div
        className="max-w-6xl mx-auto relative z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.12 }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } } }}
      >
        <motion.div className="text-center mb-12" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-1 w-12 bg-gradient-to-r from-transparent to-[var(--color-accent)] rounded-full" />
            <Award className="h-10 w-10 text-[var(--color-accent)]" aria-hidden="true" />
            <div className="h-1 w-12 bg-gradient-to-l from-transparent to-[var(--color-blue)] rounded-full" />
          </div>
          <h2 id="certifications-heading" className="text-5xl md:text-6xl font-extrabold mb-4 animate-gradient">
            Licenses &amp; Certifications
          </h2>
          <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto leading-relaxed">
            Continuously learning and applying new technologies through hands-on projects.
          </p>
        </motion.div>

        <motion.section variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} className="mb-10">
          <h3 className="text-xl md:text-2xl font-bold mb-4 text-[var(--color-text)]">Featured Certifications</h3>
          <motion.div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}>
            {featuredCerts.map((cert, index) => {
              const key = `${cert.title}-${index}`
              const isExpanded = expandedId === key
              const CategoryIcon = categoryIcon[cert.category] || categoryIcon.Additional

              return (
                <motion.article
                  key={key}
                  variants={{ hidden: { opacity: 0, y: 20, scale: 0.98 }, visible: { opacity: 1, y: 0, scale: 1 } }}
                  className="group glass rounded-2xl border border-white/10 p-5 hover:-translate-y-1 hover:border-[var(--color-accent)]/45 hover:shadow-[0_0_30px_rgba(125,211,252,0.14)] transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <motion.div whileHover={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 0.45 }} className="h-11 w-11 rounded-xl border border-white/15 bg-white/[0.06] flex items-center justify-center">
                        <CategoryIcon className="h-5 w-5 text-[var(--color-accent)]" />
                      </motion.div>
                      <div>
                        <p className={`inline-flex px-2.5 py-1 rounded-full text-[11px] border ${issuerPill[cert.issuer] || 'border-white/20 text-white/80'}`}>
                          {cert.issuer}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1">Issued {cert.issued}</p>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-[var(--color-accent)] bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/25 rounded-full px-2 py-1">
                      {cert.category}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-[var(--color-text)] leading-tight">{cert.title}</h4>
                  <p className="text-sm text-[var(--color-text-muted)] mt-3"><span className="text-[var(--color-text)] font-semibold">What I learned:</span> {cert.learned}</p>
                  <p className="text-sm text-[var(--color-text-muted)] mt-2"><span className="text-[var(--color-text)] font-semibold">How I applied it:</span> {cert.applied}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(cert.tags || []).slice(0, 2).map((tag) => (
                      <span key={tag} className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-white/[0.05] border border-white/10 text-[var(--color-text-muted)]">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <button type="button" onClick={() => toggleExpanded(key)} className="theme-btn theme-btn-secondary px-3 py-2 text-xs">
                      More details
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    {cert.credentialUrl && cert.credentialUrl !== '#' && (
                      <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="theme-btn theme-btn-primary px-3 py-2 text-xs">
                        Verify
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-white/10 space-y-2 text-sm text-[var(--color-text-muted)]">
                          {cert.credentialId && <p><span className="text-[var(--color-text)] font-semibold">Credential ID:</span> {cert.credentialId}</p>}
                          {cert.appliedProject && <p><span className="text-[var(--color-text)] font-semibold">Applied in:</span> {cert.appliedProject}</p>}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              )
            })}
          </motion.div>
        </motion.section>

        <motion.section variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}>
          <h3 className="text-xl md:text-2xl font-bold mb-4 text-[var(--color-text)]">Additional Learning</h3>
          <div className="space-y-6">
            {Object.entries(groupedAdditional).map(([category, certs]) => {
              const CategoryIcon = categoryIcon[category] || categoryIcon.Additional
              return (
                <div key={category} className="rounded-2xl border border-white/10 bg-[var(--color-bg-card)]/35 backdrop-blur-md p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <CategoryIcon className="h-4 w-4 text-[var(--color-accent)]" />
                    <h4 className="font-semibold text-[var(--color-text)]">{category}</h4>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {certs.map((cert, idx) => (
                      <motion.article
                        key={`${cert.title}-additional-${idx}`}
                        whileHover={{ y: -4, scale: 1.01 }}
                        className="rounded-xl border border-white/10 bg-[var(--color-bg)]/45 p-4 transition-all hover:border-[var(--color-accent)]/35 hover:shadow-[0_0_20px_rgba(125,211,252,0.12)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-bold text-[var(--color-text)] leading-snug">{cert.title}</p>
                          <span className={`inline-flex px-2 py-1 rounded-md text-[10px] border ${issuerPill[cert.issuer] || 'border-white/20 text-white/80'}`}>{cert.issuer}</span>
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)] mt-2">{cert.learned}</p>
                        <p className="text-xs text-[var(--color-accent)] mt-2">Applied in: {cert.appliedProject || 'Portfolio workflow'}</p>
                      </motion.article>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </motion.section>

        <motion.div variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }} className="mt-10 text-center">
          <p className="text-lg font-semibold bg-gradient-to-r from-[var(--color-accent)] via-blue-300 to-purple-300 bg-clip-text text-transparent">
            Growth mindset in action: every certification feeds directly into practical, production-oriented builds.
          </p>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default Certifications
