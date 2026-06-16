import React from 'react';
import { AlertTriangle, ChevronDown, ChevronRight, Copy, RotateCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null, showStack: false, copied: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    console.error('[TrayFocus] Crash:', error, info?.componentStack);
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

  render() {
    if (this.state.hasError) {
      const { error, info, showStack, copied } = this.state;
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-zinc-950 text-white select-none p-6">
          <div className="w-full max-w-xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center mt-0.5">
                <AlertTriangle className="w-4 h-4 text-red-400" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-sm font-semibold text-red-400 mb-1">Application Error</h1>
                <p className="text-xs text-red-300/80 break-all">{error?.message || 'An unexpected error occurred'}</p>
              </div>
            </div>

            {(error?.stack || info?.componentStack) && (
              <div className="mb-4">
                <button
                  onClick={() => this.setState({ showStack: !showStack })}
                  className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/50 transition-colors mb-2"
                >
                  {showStack ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  Stack Trace
                </button>
                {showStack && (
                  <div className="rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden">
                    <div className="px-3 py-2 border-b border-zinc-800 flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {error?.name || 'Error'}
                        {info?.componentStack && ' — in ' + info.componentStack.split('\n')[0]?.trim().replace(/^\s*in\s*/, '')}
                      </span>
                      <button onClick={this.copyError} className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/50 transition-colors">
                        <Copy className="w-3 h-3" />
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre className="p-3 text-[10px] leading-relaxed text-red-300/70 font-mono overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap break-all">
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

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null, info: null, showStack: false });
                  if (this.props.onReset) this.props.onReset();
                }}
                className="px-4 py-1.5 text-xs font-medium rounded-md bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-1.5 text-xs font-medium rounded-md bg-white/5 hover:bg-white/10 text-white/50 transition-colors flex items-center gap-1.5"
              >
                <RotateCw className="w-3 h-3" />
                Reload App
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
