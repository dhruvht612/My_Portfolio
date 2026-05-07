import { motion as Motion } from 'framer-motion'
import { ArrowUpRight, Orbit } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ADMIN_PRIMARY_CLASS } from '../AdminPrimaryButton'
import DashboardAnimatedNumber from './DashboardAnimatedNumber'

function pad2(n) {
  return String(n).padStart(2, '0')
}

export default function DashboardCommandHero({ session, headline, subtitle, kpis }) {
  const now = new Date()
  const time = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`

  return (
    <div className="relative overflow-hidden rounded-[22px] border border-white/[0.09] bg-[rgba(5,10,20,0.55)] shadow-[0_0_0_1px_rgba(56,189,248,0.05)_inset,0_40px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_72%_-8%,rgba(56,189,248,0.11),transparent_58%)]" />
      <div className="pointer-events-none absolute -left-28 top-[-40%] h-[120%] w-[55%] rotate-[-8deg] bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent blur-3xl" />

      <div className="relative flex flex-col gap-8 p-7 md:flex-row md:items-start md:justify-between md:p-8">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/22 bg-sky-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200/90">
              <Motion.span animate={{ rotate: [0, 360] }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }} aria-hidden>
                <Orbit className="h-3.5 w-3.5 text-sky-300" />
              </Motion.span>
              AI workspace · live
            </span>
            <span className="font-mono text-[11px] tabular-nums text-slate-500">{session?.user?.email || 'operator@portfolio'}</span>
          </div>

          <h1 className="mt-5 text-[1.68rem] font-bold leading-tight tracking-tight text-slate-50 sm:text-[2rem]">{headline}</h1>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">{subtitle}</p>

          {kpis ? (
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/[0.08] bg-black/25 px-4 py-3 ring-1 ring-inset ring-white/[0.04]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Traffic window</p>
                <p className="mt-2 font-mono text-2xl font-bold tracking-tight text-slate-100">
                  {kpis.visitsWeek != null ? <DashboardAnimatedNumber value={kpis.visitsWeek} /> : '—'}
                </p>
                <p className={`mt-1 text-[11px] font-medium ${kpis.visitsDelta >= 0 ? 'text-emerald-400/90' : 'text-amber-300/90'}`}>
                  {kpis.visitsDelta != null ? `${kpis.visitsDelta >= 0 ? '+' : ''}${kpis.visitsDelta}% vs prior week` : 'Awaiting signal'}
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-black/25 px-4 py-3 ring-1 ring-inset ring-white/[0.04]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Recent updates</p>
                <p className="mt-2 font-mono text-2xl font-bold tracking-tight text-slate-100">
                  {kpis.updates48h != null ? <DashboardAnimatedNumber value={kpis.updates48h} /> : '—'}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">Entity touches in the last 48 hours</p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-black/25 px-4 py-3 ring-1 ring-inset ring-white/[0.04]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Portfolio score</p>
                <p className="mt-2 font-mono text-2xl font-bold tracking-tight text-slate-100">{kpis.grade || '—'}</p>
                <p className="mt-1 text-[11px] text-slate-500">Composite completion + momentum</p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex w-full shrink-0 flex-col gap-4 md:w-[280px]">
          <div className="rounded-2xl border border-white/[0.08] bg-[rgba(2,8,23,0.55)] p-4 ring-1 ring-inset ring-sky-500/10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">System clock</p>
            <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-sky-100">{time}</p>
            <p className="mt-1 text-[11px] text-slate-500">
              {now.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
          <Link
            to="/admin/projects"
            className={`inline-flex flex-1 items-center justify-between gap-2 rounded-2xl border border-transparent px-5 py-3 font-semibold text-slate-950 shadow-[0_16px_50px_rgba(56,189,248,0.18)] transition hover:-translate-y-px ${ADMIN_PRIMARY_CLASS}`}
          >
            New project run
            <ArrowUpRight className="h-4 w-4 opacity-95" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  )
}
