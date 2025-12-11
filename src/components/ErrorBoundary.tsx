import React from 'react';
import { toast } from 'react-toastify';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught an error', error, errorInfo);
    toast.error(`⚠️ ${error.message}`);
  }

  render() {
    if (this.state.hasError) {
      // Optional fallback UI — app stays running
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>⚠️ Something went wrong</h2>
          <p>Please refresh the page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
