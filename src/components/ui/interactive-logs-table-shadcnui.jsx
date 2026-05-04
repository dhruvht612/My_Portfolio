import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, Filter, Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export const SAMPLE_LOGS = [
  {
    id: '1',
    timestamp: '2024-11-08T14:32:45Z',
    level: 'info',
    service: 'api-gateway',
    message: 'Request processed successfully',
    duration: '245ms',
    status: '200',
    tags: ['api', 'success'],
  },
  {
    id: '2',
    timestamp: '2024-11-08T14:32:42Z',
    level: 'warning',
    service: 'cache-service',
    message: 'Cache miss ratio exceeds threshold',
    duration: '1.2s',
    status: 'warning',
    tags: ['cache', 'performance'],
  },
  {
    id: '3',
    timestamp: '2024-11-08T14:32:40Z',
    level: 'error',
    service: 'database',
    message: 'Connection timeout to replica',
    duration: '5.1s',
    status: '503',
    tags: ['db', 'error'],
  },
  {
    id: '4',
    timestamp: '2024-11-08T14:32:38Z',
    level: 'info',
    service: 'auth-service',
    message: 'User session created',
    duration: '156ms',
    status: '201',
    tags: ['auth', 'session'],
  },
  {
    id: '5',
    timestamp: '2024-11-08T14:32:35Z',
    level: 'info',
    service: 'api-gateway',
    message: 'Webhook delivered',
    duration: '432ms',
    status: '200',
    tags: ['webhook', 'integration'],
  },
  {
    id: '6',
    timestamp: '2024-11-08T14:32:32Z',
    level: 'error',
    service: 'payment-service',
    message: 'Payment gateway unavailable',
    duration: '2.3s',
    status: '502',
    tags: ['payment', 'error'],
  },
  {
    id: '7',
    timestamp: '2024-11-08T14:32:30Z',
    level: 'info',
    service: 'search-service',
    message: 'Index updated',
    duration: '876ms',
    status: '200',
    tags: ['search', 'index'],
  },
  {
    id: '8',
    timestamp: '2024-11-08T14:32:28Z',
    level: 'warning',
    service: 'api-gateway',
    message: 'Rate limit approaching',
    duration: '145ms',
    status: '429',
    tags: ['rate-limit', 'warning'],
  },
]

const levelStyles = {
  info: 'bg-sky-500/15 text-sky-300',
  warning: 'bg-amber-500/15 text-amber-300',
  error: 'bg-red-500/15 text-red-300',
}

const statusStyles = {
  '200': 'text-emerald-400',
  '201': 'text-emerald-400',
  '429': 'text-amber-400',
  '502': 'text-red-400',
  '503': 'text-red-400',
  warning: 'text-amber-400',
  OK: 'text-emerald-400',
  WRN: 'text-amber-400',
  ERR: 'text-red-400',
}

function LogRow({ log, expanded, onToggle }) {
  const formattedTime = new Date(log.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <>
      <motion.button
        type="button"
        onClick={onToggle}
        className="w-full p-4 text-left transition-colors hover:bg-white/[0.04] active:bg-white/[0.07]"
      >
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0"
          >
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </motion.div>

          <Badge variant="secondary" className={`flex-shrink-0 capitalize ${levelStyles[log.level] || levelStyles.info}`}>
            {log.level}
          </Badge>

          <time className="w-20 flex-shrink-0 font-mono text-xs text-slate-500">{formattedTime}</time>

          <span className="min-w-max flex-shrink-0 text-sm font-medium text-slate-100">{log.service}</span>

          <p className="flex-1 truncate text-sm text-slate-400">{log.message}</p>

          <span className={`flex-shrink-0 font-mono text-sm font-semibold ${statusStyles[log.status] ?? 'text-slate-500'}`}>
            {log.status}
          </span>

          <span className="w-16 flex-shrink-0 text-right font-mono text-xs text-slate-500">{log.duration}</span>
        </div>
      </motion.button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/10 bg-slate-900/50"
          >
            <div className="space-y-4 p-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Message</p>
                <p className="rounded border border-white/10 bg-[#0b0f17] p-3 font-mono text-sm text-slate-100">{log.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Duration</p>
                  <p className="font-mono text-slate-100">{log.duration}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Timestamp</p>
                  <p className="font-mono text-xs text-slate-100">{log.timestamp}</p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {log.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function FilterPanel({ filters, onChange, logs }) {
  const levels = Array.from(new Set(logs.map((log) => log.level)))
  const services = Array.from(new Set(logs.map((log) => log.service)))
  const statuses = Array.from(new Set(logs.map((log) => log.status)))

  const toggleFilter = (category, value) => {
    const current = filters[category]
    const updated = current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value]
    onChange({ ...filters, [category]: updated })
  }

  const clearAll = () => {
    onChange({ level: [], service: [], status: [] })
  }

  const hasActiveFilters = Object.values(filters).some((group) => group.length > 0)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ delay: 0.05 }}
      className="flex h-full flex-col space-y-6 overflow-y-auto border-white/10 bg-slate-900/90 p-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="h-6 text-xs">
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Level</p>
        <div className="space-y-2">
          {levels.map((level) => {
            const selected = filters.level.includes(level)
            return (
              <motion.button
                key={level}
                type="button"
                whileHover={{ x: 2 }}
                onClick={() => toggleFilter('level', level)}
                aria-pressed={selected}
                className={`flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                  selected
                    ? 'border-sky-400/60 bg-sky-500/10 text-sky-300'
                    : 'border-white/10 text-slate-400 hover:border-sky-400/40 hover:bg-white/[0.05]'
                }`}
              >
                <span className="capitalize">{level}</span>
                {selected && <Check className="h-3.5 w-3.5" />}
              </motion.button>
            )
          })}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Service</p>
        <div className="space-y-2">
          {services.map((service) => {
            const selected = filters.service.includes(service)
            return (
              <motion.button
                key={service}
                type="button"
                whileHover={{ x: 2 }}
                onClick={() => toggleFilter('service', service)}
                aria-pressed={selected}
                className={`flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                  selected
                    ? 'border-sky-400/60 bg-sky-500/10 text-sky-300'
                    : 'border-white/10 text-slate-400 hover:border-sky-400/40 hover:bg-white/[0.05]'
                }`}
              >
                <span>{service}</span>
                {selected && <Check className="h-3.5 w-3.5" />}
              </motion.button>
            )
          })}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
        <div className="space-y-2">
          {statuses.map((status) => {
            const selected = filters.status.includes(status)
            return (
              <motion.button
                key={status}
                type="button"
                whileHover={{ x: 2 }}
                onClick={() => toggleFilter('status', status)}
                aria-pressed={selected}
                className={`flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                  selected
                    ? 'border-sky-400/60 bg-sky-500/10 text-sky-300'
                    : 'border-white/10 text-slate-400 hover:border-sky-400/40 hover:bg-white/[0.05]'
                }`}
              >
                <span>{status}</span>
                {selected && <Check className="h-3.5 w-3.5" />}
              </motion.button>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

/** When `logs` is undefined, uses SAMPLE_LOGS (demo). When `logs` is an array (possibly empty), uses that data only. */
export function InteractiveLogsTable({ logs: logsProp, embedded = false, title = 'Logs' }) {
  const sourceLogs = logsProp !== undefined ? logsProp : SAMPLE_LOGS

  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    level: [],
    service: [],
    status: [],
  })

  const filteredLogs = useMemo(() => {
    return sourceLogs.filter((log) => {
      const lowerQuery = searchQuery.toLowerCase()
      const matchSearch =
        !lowerQuery || log.message.toLowerCase().includes(lowerQuery) || log.service.toLowerCase().includes(lowerQuery)
      const matchLevel = filters.level.length === 0 || filters.level.includes(log.level)
      const matchService = filters.service.length === 0 || filters.service.includes(log.service)
      const matchStatus = filters.status.length === 0 || filters.status.includes(log.status)
      return matchSearch && matchLevel && matchService && matchStatus
    })
  }, [filters, searchQuery, sourceLogs])

  const activeFilters = filters.level.length + filters.service.length + filters.status.length

  const shellClass = embedded
    ? 'flex h-full min-h-[360px] max-h-[min(640px,62vh)] w-full flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[#0b0f17]'
    : 'flex h-screen w-full flex-col bg-[#0b0f17]'

  return (
    <div className={shellClass}>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-white/10 bg-slate-900/80 p-4 md:p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-100 md:text-2xl">{title}</h2>
              <p className="text-sm text-slate-500">
                {filteredLogs.length} of {sourceLogs.length} logs
              </p>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  placeholder="Search logs by message or service..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="h-9 pl-9 text-sm"
                />
              </div>
              <Button
                variant={showFilters ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowFilters((current) => !current)}
                className="relative shrink-0"
              >
                <Filter className="h-4 w-4" />
                {activeFilters > 0 && (
                  <Badge className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center border-0 bg-red-500 p-0 text-[10px] text-white">
                    {activeFilters}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <AnimatePresence initial={false}>
            {showFilters && (
              <motion.div
                key="filters"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="shrink-0 overflow-hidden border-r border-white/10"
              >
                <FilterPanel filters={filters} onChange={setFilters} logs={sourceLogs} />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="divide-y divide-white/10">
              <AnimatePresence mode="popLayout">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log, index) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                    >
                      <LogRow
                        log={log}
                        expanded={expandedId === log.id}
                        onToggle={() => setExpandedId((current) => (current === log.id ? null : log.id))}
                      />
                    </motion.div>
                  ))
                ) : (
                  <motion.div key="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 text-center">
                    <p className="text-slate-500">No logs match your filters.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
