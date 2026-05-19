import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Globe, Link2, Mail, Share2, UserRound } from 'lucide-react'

function useTypingPreview(strings, enabled) {
  const [display, setDisplay] = useState('')
  const [idx, setIdx] = useState(0)
  const [char, setChar] = useState(0)
  const [del, setDel] = useState(false)

  useEffect(() => {
    if (!enabled || !strings.length) {
      setDisplay('')
      return undefined
    }
    const current = strings[idx % strings.length] || ''
    const t = setTimeout(
      () => {
        if (!del && char < current.length) setChar((c) => c + 1)
        else if (!del && char === current.length) setDel(true)
        else if (del && char > 0) setChar((c) => c - 1)
        else if (del && char === 0) {
          setDel(false)
          setIdx((i) => (i + 1) % strings.length)
        }
      },
      del ? 35 : 70,
    )
    setDisplay(current.slice(0, char))
    return () => clearTimeout(t)
  }, [char, del, idx, strings, enabled])

  return display
}

const LINK_ICONS = {
  github: Globe,
  linkedin: Link2,
  instagram: Share2,
  email: Mail,
}

export default function ProfilePreview({ values }) {
  const roles = (values?.typed_roles || []).filter(Boolean)
  const typed = useTypingPreview(roles, roles.length > 0)
  const story = (values?.bio_story || []).filter(Boolean)
  const links = values?.social_links || {}
  const linkKeys = Object.keys(LINK_ICONS).filter((k) => String(links[k] || '').trim())

  return (
    <section id="profile-live-preview" className="idf-glass-card overflow-hidden p-0">
      <header className="border-b border-white/[0.06] px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300/90">Simulation</p>
        <h3 className="text-sm font-semibold text-slate-100">Public profile preview</h3>
      </header>
      <motion.div
        layout
        className="idf-preview-stage relative p-4 md:p-5"
      >
        <div className="idf-preview-glow pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative space-y-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-500/15">
              <UserRound className="h-6 w-6 text-violet-200" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-white">{values?.full_name?.trim() || 'Your name'}</p>
              <p className="mt-0.5 font-mono text-sm text-cyan-300/90">
                {typed || roles[0] || 'Hero role preview'}
                <span className="animate-pulse text-cyan-400">|</span>
              </p>
            </div>
          </motion.div>

          {roles.length ? (
            <div className="flex flex-wrap gap-1.5">
              {roles.map((r, i) => (
                <motion.span
                  key={r + i}
                  layout
                  className="idf-preview-role-pill"
                  whileHover={{ scale: 1.04 }}
                >
                  {r}
                </motion.span>
              ))}
            </div>
          ) : null}

          {story[0] ? (
            <motion.p layout className="text-xs leading-relaxed text-slate-400 line-clamp-4">
              {story[0]}
            </motion.p>
          ) : (
            <p className="text-xs italic text-slate-600">Bio narrative will appear on the About journey…</p>
          )}

          <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3">
            {linkKeys.map((k) => {
              const Icon = LINK_ICONS[k]
              return (
                <span key={k} className="idf-preview-link-icon">
                  <Icon className="h-3.5 w-3.5" />
                </span>
              )
            })}
            {values?.resume_url ? (
              <span className="text-[10px] text-emerald-300/80">Resume linked</span>
            ) : null}
            {(values?.footer_badges || []).filter(Boolean).length ? (
              <span className="text-[10px] text-slate-500">
                {(values.footer_badges || []).filter(Boolean).length} badge(s)
              </span>
            ) : null}
          </div>
        </div>
      </motion.div>
      <footer className="flex items-center justify-between border-t border-white/[0.06] px-4 py-2.5 text-[10px] text-slate-500">
        <span>Updates in realtime</span>
        <a href="/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-violet-300/80 hover:text-violet-200">
          Open site
          <ExternalLink className="h-3 w-3" />
        </a>
      </footer>
    </section>
  )
}
