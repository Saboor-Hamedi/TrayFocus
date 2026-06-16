import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[TrayFocus] Component error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-zinc-950 text-white select-none">
          <div className="text-center px-6">
            <h1 className="text-sm font-semibold text-red-400 mb-2">Something went wrong</h1>
            <p className="text-xs text-zinc-500 mb-4 max-w-sm">
              {this.state.error?.message || 'An unexpected error occurred. The rest of the app should still work.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                if (this.props.onReset) this.props.onReset();
              }}
              className="px-4 py-1.5 text-xs font-medium rounded-md bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function wrapWithErrorBoundary(Component, name = 'Component') {
  return function ErrorBoundaryWrapper(props) {
    return (
      <ErrorBoundary>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
