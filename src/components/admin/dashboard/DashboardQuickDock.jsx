import { createElement } from 'react'
import { motion as Motion } from 'framer-motion'
import {
  Activity,
  BarChart3,
  Award,
  MessageSquare,
  PenLine,
  Plus,
  Radar,
  Sparkles,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const actions = [
  { to: '/admin/projects', label: 'Project', shortcut: undefined, Icon: Plus, hue: 'from-sky-400/85 to-indigo-500/70', desc: 'New build' },
  { to: '/admin/certifications', label: 'Cert', shortcut: undefined, Icon: Award, hue: 'from-violet-400/85 to-fuchsia-500/70', desc: 'Add credential' },
  { to: '/admin/blog/new', label: 'Blog', shortcut: undefined, Icon: PenLine, hue: 'from-emerald-400/85 to-teal-500/70', desc: 'Publish' },
  { to: '/admin/messages', label: 'Inbox', shortcut: undefined, Icon: MessageSquare, hue: 'from-amber-400/85 to-orange-500/70', desc: 'Messages' },
  { to: '/admin/system-health', label: 'Observe', shortcut: undefined, Icon: Radar, hue: 'from-fuchsia-400/85 to-purple-700/65', desc: 'Health mesh' },
  { to: '/admin/analytics', label: 'Signal', shortcut: undefined, Icon: BarChart3, hue: 'from-cyan-400/85 to-blue-700/65', desc: 'Analytics' },
]

function openPaletteEvent() {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('admin:command-palette'))
}

export default function DashboardQuickDock() {
  return (
    <div className="pointer-events-none fixed bottom-8 left-1/2 z-40 hidden -translate-x-1/2 md:block">
      <Motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="pointer-events-auto rounded-[22px] border border-white/[0.10] bg-[rgba(6,11,22,0.78)] px-4 py-3 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
      >
        <div className="flex items-center gap-2 lg:gap-3">
          {actions.map((action) => {
            const { to, label, hue, desc, Icon } = action
            return (
              <Motion.div key={to} whileHover={{ y: -3, scale: 1.04 }} transition={{ type: 'spring', stiffness: 420, damping: 24 }}>
                <Link
                  to={to}
                  title={desc}
                  className="flex h-[52px] w-[52px] flex-col items-center justify-center gap-1 rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.08] to-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-white/[0.04] transition hover:border-sky-400/25 hover:shadow-[0_14px_40px_rgba(56,189,248,0.12)] lg:h-auto lg:w-auto lg:flex-row lg:gap-3 lg:px-4 lg:py-3"
                >
                  <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${hue} opacity-95 shadow-inner`}>
                    {createElement(Icon, { className: 'h-[15px] w-[15px] text-white lg:h-4 lg:w-4', 'aria-hidden': true })}
                  </span>
                  <span className="hidden whitespace-nowrap text-[11px] font-semibold uppercase tracking-wide text-slate-200 lg:inline">{label}</span>
                </Link>
              </Motion.div>
            )
          })}
          <div className="mx-2 h-9 w-px shrink-0 bg-white/[0.08]" aria-hidden />
          <Motion.button
            type="button"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.97 }}
            onClick={openPaletteEvent}
            className="flex h-[52px] min-w-[120px] items-center gap-3 rounded-xl border border-sky-400/35 bg-[linear-gradient(120deg,rgba(56,189,248,0.18),rgba(167,139,250,0.12))] px-4 shadow-[0_0_42px_rgba(56,189,248,0.12)]"
          >
            <Sparkles className="h-[18px] w-[18px] text-sky-200" aria-hidden />
            <div className="text-left">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-50">Assist</p>
              <p className="flex items-center gap-1 font-mono text-[10px] text-sky-200/80">
                <Zap className="h-3 w-3" aria-hidden />
                ⌘K
              </p>
            </div>
          </Motion.button>
        </div>
        <p className="mt-2 text-center font-mono text-[9px] text-slate-600">
          <Activity className="mr-1 inline h-3 w-3 opacity-70" aria-hidden />
          kinetic dock · magnetic hover · command palette bridged
        </p>
      </Motion.div>
    </div>
  )
}
