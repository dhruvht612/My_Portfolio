import { useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Bold, Code, Heading2, Italic, Link2, List, ListOrdered, Maximize2, Minimize2 } from 'lucide-react'

function wrapValue(value, start, end, before, after = before) {
  const sel = value.slice(start, end)
  return value.slice(0, start) + before + sel + after + value.slice(end)
}

export default function MarkdownEditor({ value = '', onChange, disabled }) {
  const taRef = useRef(null)
  const [fullscreen, setFullscreen] = useState(false)

  const mutate = (mutator) => {
    const el = taRef.current
    if (!el || disabled) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const next = mutator(value, start, end)
    onChange?.(next)
    requestAnimationFrame(() => {
      el.focus()
      const pos = next.length
      el.setSelectionRange(pos, pos)
    })
  }

  const toolbar = (
    <div className="mb-2 flex flex-wrap gap-1 border-b border-[var(--color-border)] pb-2">
      <button
        type="button"
        disabled={disabled}
        title="Bold"
        onClick={() => mutate((v, s, e) => wrapValue(v, s, e, '**', '**'))}
        className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text)] disabled:opacity-40"
      >
        <Bold className="h-4 w-4" />
      </button>
      <button
        type="button"
        disabled={disabled}
        title="Italic"
        onClick={() => mutate((v, s, e) => wrapValue(v, s, e, '_', '_'))}
        className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text)] disabled:opacity-40"
      >
        <Italic className="h-4 w-4" />
      </button>
      <button
        type="button"
        disabled={disabled}
        title="Heading 2"
        onClick={() => mutate((v, s, e) => wrapValue(v, s, e, '## ', ''))}
        className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text)] disabled:opacity-40"
      >
        <Heading2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        disabled={disabled}
        title="Link"
        onClick={() => mutate((v, s, e) => wrapValue(v, s, e, '[', '](url)'))}
        className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text)] disabled:opacity-40"
      >
        <Link2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        disabled={disabled}
        title="Inline code"
        onClick={() => mutate((v, s, e) => wrapValue(v, s, e, '`', '`'))}
        className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text)] disabled:opacity-40"
      >
        <Code className="h-4 w-4" />
      </button>
      <button
        type="button"
        disabled={disabled}
        title="Bullet list"
        onClick={() => mutate((v, s, e) => wrapValue(v, s, e, '- ', ''))}
        className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text)] disabled:opacity-40"
      >
        <List className="h-4 w-4" />
      </button>
      <button
        type="button"
        disabled={disabled}
        title="Numbered list"
        onClick={() => mutate((v, s, e) => wrapValue(v, s, e, '1. ', ''))}
        className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text)] disabled:opacity-40"
      >
        <ListOrdered className="h-4 w-4" />
      </button>
      <button
        type="button"
        disabled={disabled}
        title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        onClick={() => setFullscreen((f) => !f)}
        className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text)] disabled:opacity-40"
      >
        {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </button>
    </div>
  )

  return (
    <div className={fullscreen ? 'fixed inset-0 z-[120] flex flex-col bg-[var(--color-bg)] p-4' : 'flex flex-col gap-3'}>
      {toolbar}
      <div className="grid min-h-[280px] flex-1 gap-3 lg:grid-cols-2">
        <textarea
          ref={taRef}
          disabled={disabled}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="min-h-[260px] w-full resize-y rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/70 p-3 font-mono text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          placeholder="Write markdown…"
        />
        <div className="markdown-preview min-h-[260px] overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/80 p-4 text-sm text-[var(--color-text-muted)] [&_a]:text-[var(--color-accent)] [&_code]:rounded [&_code]:bg-[var(--color-bg-card)] [&_code]:px-1 [&_h1]:text-[var(--color-text)] [&_h2]:text-[var(--color-text)] [&_h3]:text-[var(--color-text)] [&_li]:my-1 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{value || '*Nothing to preview*'}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
