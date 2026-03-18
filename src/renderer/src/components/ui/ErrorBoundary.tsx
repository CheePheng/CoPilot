import { Component, type ReactNode } from 'react'
import { AlertIcon } from './Icons'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex items-center justify-center h-full p-8">
          <div className="glass-panel p-6 max-w-md text-center space-y-3">
            <div className="flex justify-center">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--danger-subtle)', color: 'var(--danger)' }}
              >
                <AlertIcon size={24} />
              </div>
            </div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Something went wrong
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all"
              style={{
                background: 'var(--accent-gradient)',
                color: 'white'
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
