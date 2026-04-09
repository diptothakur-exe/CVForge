// components/ErrorBoundary.tsx
"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex items-center justify-center min-h-[200px] p-8">
          <div className="text-center space-y-3 max-w-md">
            <p className="text-sm font-semibold text-destructive">Something went wrong</p>
            <p className="text-xs text-muted-foreground font-mono break-all">
              {this.state.error?.message ?? "Unknown error"}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-secondary transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
