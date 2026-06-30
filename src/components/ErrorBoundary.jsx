import { Component } from 'react'

/**
 * Catches render-time errors in the subtree and shows a recoverable fallback
 * instead of a blank screen. Copy is in the interface's voice.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('ErrorBoundary caught:', error, info)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-ink">
        <div className="glass max-w-md w-full rounded-xl p-8 text-center space-y-4">
          <p className="eyebrow">Something broke</p>
          <h1 className="font-display text-2xl font-bold">This section failed to load</h1>
          <p className="text-ink-muted text-sm leading-relaxed">
            An unexpected error stopped this page from rendering. Reload to try again — if it
            keeps happening, the issue is on our side.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="state-layer rounded-[var(--radius)] bg-signal px-5 py-2.5 text-sm font-semibold text-[var(--md-on-primary)]"
            >
              Reload page
            </button>
            <a
              href="/home"
              className="state-layer rounded-[var(--radius)] border border-line-hi px-5 py-2.5 text-sm font-semibold text-ink"
            >
              Go home
            </a>
          </div>
        </div>
      </div>
    )
  }
}