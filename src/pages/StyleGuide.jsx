import { useTheme } from '../context/ThemeContext'

/**
 * Dev-only living design system. Renders the Orbital tokens + primitives in all
 * states so we can eyeball the system as we migrate. Route: /styleguide (DEV only).
 */
const SWATCHES = [
  ['void', '--void'],
  ['void-2', '--void-2'],
  ['surface', '--surface'],
  ['surface-hi', '--surface-hi'],
  ['signal', '--signal'],
  ['signal-2', '--signal-2'],
  ['ember', '--ember'],
  ['ink', '--ink'],
  ['ink-muted', '--ink-muted'],
  ['line-hi', '--line-hi'],
  ['ok', '--ok'],
  ['warn', '--warn'],
  ['err', '--err'],
]

const TYPE = [
  ['Display / step-4', 'var(--step-4)', 'var(--font-display)', 700],
  ['Display / step-3', 'var(--step-3)', 'var(--font-display)', 700],
  ['Heading / step-2', 'var(--step-2)', 'var(--font-display)', 600],
  ['Subhead / step-1', 'var(--step-1)', 'var(--font-display)', 500],
  ['Body / step-0', 'var(--step-0)', 'var(--font-sans)', 400],
  ['Caption / step--1', 'var(--step--1)', 'var(--font-mono)', 400],
]

function Section({ title, children }) {
  return (
    <section className="space-y-4">
      <p className="eyebrow">{title}</p>
      {children}
    </section>
  )
}

export default function StyleGuide() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-void text-ink px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-14">
        <header className="flex items-center justify-between">
          <div>
            <p className="eyebrow">Orbital</p>
            <h1 className="font-display text-4xl font-bold">Design System</h1>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="state-layer rounded-[var(--radius)] border border-line-hi px-4 py-2 text-sm font-semibold"
          >
            Theme: {theme}
          </button>
        </header>

        <Section title="Color">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {SWATCHES.map(([name, varName]) => (
              <div key={name} className="rounded-lg border border-line overflow-hidden">
                <div className="h-16" style={{ background: `var(${varName})` }} />
                <div className="p-2 text-xs">
                  <div className="font-medium">{name}</div>
                  <div className="text-ink-faint font-mono">{varName}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Typography">
          <div className="space-y-3">
            {TYPE.map(([label, size, family, weight]) => (
              <div key={label} className="border-b border-line pb-3">
                <div className="text-ink-faint font-mono text-xs mb-1">{label}</div>
                <div style={{ fontSize: size, fontFamily: family, fontWeight: weight, letterSpacing: '-0.02em' }}>
                  The quick brown fox
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Buttons">
          <div className="flex flex-wrap gap-3">
            <button className="state-layer rounded-[var(--radius)] bg-signal px-5 py-2.5 text-sm font-semibold text-[var(--md-on-primary)]">
              Primary
            </button>
            <button className="state-layer rounded-[var(--radius)] bg-ember px-5 py-2.5 text-sm font-semibold text-white">
              Ember CTA
            </button>
            <button className="state-layer rounded-[var(--radius)] border border-line-hi px-5 py-2.5 text-sm font-semibold text-ink">
              Secondary
            </button>
            <button className="rounded-[var(--radius)] px-5 py-2.5 text-sm font-semibold text-ink-faint" disabled>
              Disabled
            </button>
          </div>
        </Section>

        <Section title="Surfaces">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-surface border border-line p-5">
              <h3 className="font-display font-semibold mb-1">Surface card</h3>
              <p className="text-ink-muted text-sm">Flat card on --surface.</p>
            </div>
            <div className="glass rounded-xl p-5">
              <h3 className="font-display font-semibold mb-1">Glass</h3>
              <p className="text-ink-muted text-sm">Token-based glass panel.</p>
            </div>
            <div className="glass-strong rounded-xl p-5">
              <h3 className="font-display font-semibold mb-1">Glass strong</h3>
              <p className="text-ink-muted text-sm">Heavier blur + border.</p>
            </div>
          </div>
        </Section>

        <Section title="State badges">
          <div className="flex flex-wrap gap-3 text-sm font-medium">
            <span className="rounded-full px-3 py-1" style={{ background: 'color-mix(in srgb, var(--ok) 18%, transparent)', color: 'var(--ok)' }}>Success</span>
            <span className="rounded-full px-3 py-1" style={{ background: 'color-mix(in srgb, var(--warn) 18%, transparent)', color: 'var(--warn)' }}>Warning</span>
            <span className="rounded-full px-3 py-1" style={{ background: 'color-mix(in srgb, var(--err) 18%, transparent)', color: 'var(--err)' }}>Error</span>
            <span className="rounded-full px-3 py-1" style={{ background: 'var(--signal-glow)', color: 'var(--signal)' }}>Signal</span>
          </div>
        </Section>
      </div>
    </div>
  )
}