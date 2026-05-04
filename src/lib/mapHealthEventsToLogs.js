/**
 * Map System Health hook events to InteractiveLogsTable rows.
 * @param {{ id: string, at: string, severity: string, message: string }[]} events
 */
export function mapHealthEventsToLogs(events) {
  if (!events?.length) return []
  return events.map((e) => {
    const sev = e.severity || 'info'
    const level = sev === 'critical' ? 'error' : sev === 'warning' ? 'warning' : 'info'
    const status = sev === 'critical' ? 'ERR' : sev === 'warning' ? 'WRN' : 'OK'
    return {
      id: e.id,
      timestamp: e.at,
      level,
      service: 'health-monitor',
      message: e.message != null ? String(e.message) : '',
      duration: '—',
      status,
      tags: ['health', sev],
    }
  })
}
