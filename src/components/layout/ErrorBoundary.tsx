import { Component, type ReactNode } from 'react'
import { Warning, ArrowClockwise } from '@phosphor-icons/react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('App error boundary caught:', error, info.componentStack)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-6">
          <div className="text-center max-w-sm">
            <Warning className="w-12 h-12 text-[var(--color-warning)] mx-auto mb-4" />
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] mb-6">
              The app ran into an unexpected error. Try reloading the page.
            </p>
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-[var(--color-primary-text)] font-semibold rounded-[var(--radius-lg)] active:scale-95 transition-transform"
            >
              <ArrowClockwise className="w-4 h-4" />
              Reload
            </button>
            {this.state.error && (
              <p className="mt-4 text-xs text-[var(--color-text-muted)] font-mono break-all">
                {this.state.error.message}
              </p>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
