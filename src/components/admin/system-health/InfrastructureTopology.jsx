import { AnimatePresence, motion as Motion } from 'framer-motion'
import { Database, Globe, HardDrive, KeyRound, Layers, PlugZap, Server } from 'lucide-react'
import { useCallback, useId, useMemo, useState } from 'react'

const NODE_DEFS = {
  frontend: {
    label: 'Frontend',
    sub: 'Edge / Origin',
    x: 88,
    y: 172,
    Icon: Globe,
    accent: 'from-cyan-400/80 to-sky-500/60',
  },
  api: {
    label: 'API',
    sub: 'Service layer',
    x: 280,
    y: 172,
    Icon: Server,
    accent: 'from-fuchsia-400/75 to-violet-500/55',
  },
  auth: {
    label: 'Auth',
    sub: 'GoTrue',
    x: 520,
    y: 64,
    Icon: KeyRound,
    accent: 'from-emerald-400/80 to-teal-500/55',
  },
  database: {
    label: 'Database',
    sub: 'Postgres',
    x: 520,
    y: 172,
    Icon: Database,
    accent: 'from-sky-400/80 to-blue-600/55',
  },
  storage: {
    label: 'Storage',
    sub: 'Objects',
    x: 520,
    y: 280,
    Icon: HardDrive,
    accent: 'from-violet-400/75 to-indigo-500/55',
  },
  external: {
    label: 'External',
    sub: 'Integrations',
    x: 360,
    y: 28,
    Icon: PlugZap,
    accent: 'from-amber-300/80 to-orange-500/55',
  },
}

/** @typedef {'frontend'|'api'|'auth'|'database'|'storage'|'external'} TopologyKey */

function statusColor(status) {
  if (status === 'operational') return 'rgba(52,211,153,0.95)'
  if (status === 'degraded') return 'rgba(251,191,36,0.95)'
  if (status === 'down') return 'rgba(248,113,113,0.95)'
  if (status === 'not_configured') return 'rgba(100,116,139,0.75)'
  return 'rgba(148,163,184,0.8)'
}

function EdgePath({ d, stroke, dash, dim }) {
  const gid = useId()
  return (
    <g opacity={dim ? 0.35 : 1}>
      <path d={d} fill="none" stroke="rgba(15,23,42,0.85)" strokeWidth={5} strokeLinecap="round" />
      <path
        d={d}
        fill="none"
        stroke={`url(#${gid})`}
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray={dash ? '6 12' : '0'}
        className={dash ? 'obs-edge-dash' : undefined}
      />
      <defs>
        <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.2} />
          <stop offset="50%" stopColor={stroke} stopOpacity={1} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0.2} />
        </linearGradient>
      </defs>
    </g>
  )
}

function Packet({ pathD, stroke, durSec = 4 }) {
  return (
    <circle r={3.5} fill={stroke} filter="url(#obs-glow-soft)">
      <animateMotion dur={`${durSec}s`} repeatCount="indefinite" rotate="auto" path={pathD} />
    </circle>
  )
}

/**
 * @param {{
 *   results: Record<string, { status: string }>
 *   apiConfigured: boolean
 *   pulseKey: number — timestamp (ms) of last ingest window
 * }} props
 */
export default function InfrastructureTopology({ results, apiConfigured, pulseKey }) {
  const [selected, setSelected] = useState(/** @type {TopologyKey|null} */ (null))

  const nodeStatus = useCallback(
    (key) => {
      if (key === 'external') {
        const fe = results.frontend?.status
        return fe === 'operational' ? 'operational' : fe === 'degraded' ? 'degraded' : fe === 'down' ? 'down' : 'not_configured'
      }
      if (key === 'api' && !apiConfigured) return 'not_configured'
      return results[key]?.status || 'down'
    },
    [results, apiConfigured]
  )

  const edges = useMemo(() => {
    const fe = NODE_DEFS.frontend
    const api = NODE_DEFS.api
    const auth = NODE_DEFS.auth
    const db = NODE_DEFS.database
    const st = NODE_DEFS.storage
    const ext = NODE_DEFS.external

    const list = []
    if (apiConfigured) {
      list.push({
        id: 'fe-api',
        d: `M ${fe.x + 54} ${fe.y} L ${api.x - 54} ${api.y}`,
        from: 'frontend',
        to: 'api',
      })
      list.push({
        id: 'api-auth',
        d: `M ${api.x + 54} ${api.y - 22} Q ${api.x + 120} ${api.y - 60} ${auth.x - 54} ${auth.y}`,
        from: 'api',
        to: 'auth',
      })
      list.push({
        id: 'api-db',
        d: `M ${api.x + 54} ${api.y} L ${db.x - 54} ${db.y}`,
        from: 'api',
        to: 'database',
      })
      list.push({
        id: 'api-storage',
        d: `M ${api.x + 54} ${api.y + 22} Q ${api.x + 120} ${api.y + 72} ${st.x - 54} ${st.y}`,
        from: 'api',
        to: 'storage',
      })
    } else {
      list.push({
        id: 'fe-auth',
        d: `M ${fe.x + 54} ${fe.y - 40} Q ${fe.x + 180} ${fe.y - 90} ${auth.x - 54} ${auth.y}`,
        from: 'frontend',
        to: 'auth',
      })
      list.push({
        id: 'fe-db',
        d: `M ${fe.x + 54} ${fe.y} L ${db.x - 54} ${db.y}`,
        from: 'frontend',
        to: 'database',
      })
      list.push({
        id: 'fe-storage',
        d: `M ${fe.x + 54} ${fe.y + 42} Q ${fe.x + 200} ${fe.y + 90} ${st.x - 54} ${st.y}`,
        from: 'frontend',
        to: 'storage',
      })
    }
    list.push({
      id: 'fe-ext',
      d: `M ${fe.x} ${fe.y - 58} Q ${fe.x + 80} ${fe.y - 120} ${ext.x} ${ext.y + 36}`,
      from: 'frontend',
      to: 'external',
    })
    return list
  }, [apiConfigured])

  const sel =
    selected && NODE_DEFS[selected]
      ? {
          key: selected,
          ...NODE_DEFS[selected],
          status: nodeStatus(selected),
        }
      : null

  return (
    <div className="obs-glass-panel relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[rgba(8,11,18,0.72)] p-4 shadow-[0_0_0_1px_rgba(56,189,248,0.06),0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_-10%,rgba(56,189,248,0.12),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.03)_50%,transparent_60%)] opacity-40" />

      <div className="relative flex items-start justify-between gap-3 border-b border-white/[0.06] pb-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-400/80">Topology</p>
          <h3 className="mt-1 text-sm font-semibold text-slate-100">Live infrastructure map</h3>
          <p className="mt-0.5 text-[11px] text-slate-500">Interactive nodes · animated flow · probe-aware coloring</p>
        </div>
        <div className="hidden items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 sm:flex">
          <Layers className="h-4 w-4 text-sky-400/80" aria-hidden />
          <div className="text-right">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Last ingest</p>
            <p className="font-mono text-[11px] tabular-nums text-slate-300">
              {pulseKey ? new Date(pulseKey).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}
            </p>
          </div>
        </div>
      </div>

      <div className="relative mt-3">
        <svg viewBox="0 0 640 340" className="h-auto w-full select-none" role="img" aria-label="Infrastructure topology diagram">
          <defs>
            <filter id="obs-glow-soft" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {edges.map((e) => {
            const a = nodeStatus(e.from)
            const b = nodeStatus(e.to)
            const agg = a === 'down' || b === 'down' ? 'down' : a === 'degraded' || b === 'degraded' ? 'degraded' : 'operational'
            const stroke = statusColor(agg === 'operational' ? 'operational' : agg === 'degraded' ? 'degraded' : 'down')
            return (
              <g key={e.id}>
                <EdgePath d={e.d} stroke={stroke} dash />
                <Packet pathD={e.d} stroke={stroke} durSec={3.2 + (e.id.length % 3) * 0.35} />
              </g>
            )
          })}

          {Object.entries(NODE_DEFS).map(([key, cfg]) => {
            const k = /** @type {TopologyKey} */ (key)
            if (k === 'api' && !apiConfigured) return null
            const st = nodeStatus(k)
            const glow = statusColor(st)
            const active = selected === k
            const Icon = cfg.Icon

            return (
              <g
                key={key}
                role="button"
                tabIndex={0}
                cursor="pointer"
                onClick={() => setSelected((s) => (s === k ? null : k))}
                onKeyDown={(ev) => {
                  if (ev.key === 'Enter' || ev.key === ' ') {
                    ev.preventDefault()
                    setSelected((s) => (s === k ? null : k))
                  }
                }}
              >
                <Motion.circle
                  cx={cfg.x}
                  cy={cfg.y}
                  r={active ? 40 : 36}
                  fill="rgba(15,23,42,0.55)"
                  stroke={glow}
                  strokeWidth={active ? 2.2 : 1.35}
                  initial={false}
                  animate={{
                    opacity: st === 'down' ? 0.92 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                />
                <circle cx={cfg.x} cy={cfg.y} r={active ? 34 : 30} fill={`url(#nodeFill-${key})`} opacity={0.9} />
                <defs>
                  <radialGradient id={`nodeFill-${key}`} cx="40%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.09)" />
                    <stop offset="55%" stopColor="rgba(15,23,42,0.35)" />
                    <stop offset="100%" stopColor="rgba(2,6,23,0.65)" />
                  </radialGradient>
                </defs>
                {/* Icon approximate center */}
                <foreignObject x={cfg.x - 10} y={cfg.y - 10} width="20" height="20">
                  <div className={`flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br ${cfg.accent} p-0.5 shadow-[0_0_22px_rgba(56,189,248,0.15)]`}>
                    <Icon className="h-3.5 w-3.5 text-white/95" aria-hidden />
                  </div>
                </foreignObject>
                <text
                  x={cfg.x}
                  y={cfg.y + 52}
                  textAnchor="middle"
                  fill="rgba(226,232,240,0.92)"
                  style={{ fontSize: 11, fontWeight: 600 }}
                  className="font-sans"
                >
                  {cfg.label}
                </text>
                <text
                  x={cfg.x}
                  y={cfg.y + 66}
                  textAnchor="middle"
                  fill="rgba(148,163,184,0.75)"
                  style={{ fontSize: 9 }}
                  className="font-sans"
                >
                  {cfg.sub}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <AnimatePresence initial={false}>
        {sel ? (
          <Motion.div
            key={sel.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className="relative mt-3 rounded-xl border border-white/[0.08] bg-[rgba(2,6,23,0.55)] p-4 ring-1 ring-inset ring-sky-500/10"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-400/85">Selected node</p>
                <p className="mt-1 truncate text-sm font-semibold text-slate-100">{sel.label}</p>
              </div>
              <span
                className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ring-1"
                style={{
                  color: statusColor(sel.status),
                  borderColor: 'rgba(148,163,184,0.25)',
                  background: 'rgba(15,23,42,0.55)',
                }}
              >
                {String(sel.status).replace('_', ' ')}
              </span>
            </div>
            <p className="mt-3 text-[12px] leading-relaxed text-slate-400">
              {sel.key === 'external' && 'Mirrors outbound integration health inferred from frontend reachability probes.'}
              {sel.key === 'frontend' && 'Synthetic GET against your configured origin (`VITE_HEALTH_CHECK_ORIGIN` or current host).'}
              {sel.key === 'database' && 'Read probe on `profile` verifies Postgres availability and latency.'}
              {sel.key === 'auth' && 'Session retrieval measures GoTrue round-trip responsiveness.'}
              {sel.key === 'storage' && 'Bucket listing validates object storage responsiveness with automatic fallback buckets.'}
              {sel.key === 'api' && 'Optional REST surface via `VITE_API_URL` (tries `/health` then `/`).'}
            </p>
          </Motion.div>
        ) : (
          <p className="relative mt-3 text-center text-[11px] text-slate-600">Select a node to inspect routing context</p>
        )}
      </AnimatePresence>
    </div>
  )
}
