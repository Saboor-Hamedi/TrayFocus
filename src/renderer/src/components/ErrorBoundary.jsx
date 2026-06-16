import React from 'react';
import { AlertTriangle, ChevronDown, ChevronRight, Copy, RotateCw, X } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      info: null, 
      showStack: false, 
      copied: false 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    console.error('[App] Crash:', error, info?.componentStack);
  }

  copyError = () => {
    const text = [
      `Error: ${this.state.error?.message || 'Unknown'}`,
      '',
      'Stack trace:',
      this.state.error?.stack || 'No stack trace available',
      '',
      'Component stack:',
      this.state.info?.componentStack || 'No component stack available',
    ].join('\n');
    navigator.clipboard.writeText(text).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    }).catch(() => {});
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, info: null, showStack: false });
    if (this.props.onReset) this.props.onReset();
  };

  render() {
    if (this.state.hasError) {
      const { error, info, showStack, copied } = this.state;
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150" />

          {/* Modal */}
          <div className="relative w-full max-w-lg bg-zinc-900/95 border border-zinc-800 rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-400" strokeWidth={2} />
                </div>
                <div>
                  <h1 className="text-sm font-semibold text-white">Application Error</h1>
                  <p className="text-xs text-zinc-400">Something went wrong</p>
                </div>
              </div>
              <button
                onClick={this.handleReset}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Error Message */}
              <div className="mb-4 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                <p className="text-sm text-red-400 font-medium">
                  {error?.message || 'An unexpected error occurred'}
                </p>
              </div>

              {/* Stack Trace */}
              {(error?.stack || info?.componentStack) && (
                <div className="mb-4">
                  <button
                    onClick={() => this.setState({ showStack: !showStack })}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors mb-2"
                  >
                    {showStack ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    {showStack ? 'Hide' : 'View'} Stack Trace
                  </button>
                  
                  {showStack && (
                    <div className="rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {error?.name || 'Error'}
                          {info?.componentStack && (
                            <span className="ml-2 text-zinc-600">
                              — {info.componentStack.split('\n')[0]?.trim().replace(/^\s*in\s*/, '')}
                            </span>
                          )}
                        </span>
                        <button
                          onClick={this.copyError}
                          className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-white transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <pre className="p-3 text-[10px] leading-relaxed text-red-300/70 font-mono overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap break-all select-text cursor-text">
                        {error?.stack || 'No stack trace'}
                        {info?.componentStack && (
                          <>
                            {'\n\nComponent stack:'}
                            {info.componentStack}
                          </>
                        )}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
                <button
                  onClick={this.handleReset}
                  className="px-4 py-1.5 text-xs font-medium rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-1.5 text-xs font-medium rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors flex items-center gap-1.5"
                >
                  <RotateCw className="w-3 h-3" />
                  Reload App
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}