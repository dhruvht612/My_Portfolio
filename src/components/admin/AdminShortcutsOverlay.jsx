import { Keyboard } from 'lucide-react'

const SHORTCUTS = [
  { key: 'Ctrl/Cmd + K', action: 'Open command palette' },
  { key: '?', action: 'Open shortcuts overlay' },
  { key: 'Esc', action: 'Close overlays / dialogs' },
  { key: 'G then D', action: 'Go to Dashboard (planned)' },
]

export default function AdminShortcutsOverlay({ open, onClose }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="admin-panel-glass w-full max-w-lg rounded-2xl border border-white/15 p-4" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center gap-2 border-b border-white/10 pb-3">
          <Keyboard className="h-4 w-4 text-sky-300" />
          <h3 className="text-sm font-semibold text-slate-100">Keyboard shortcuts</h3>
        </div>
        <ul className="space-y-2">
          {SHORTCUTS.map((shortcut) => (
            <li key={shortcut.key} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
              <span className="text-xs text-slate-300">{shortcut.action}</span>
              <kbd className="rounded-md border border-white/15 bg-black/30 px-2 py-1 text-[11px] font-mono text-slate-400">{shortcut.key}</kbd>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
