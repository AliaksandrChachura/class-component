import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export default class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.group('🚨 ErrorBoundary caught an error');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();

    this.setState({
      errorInfo,
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState((prevState) => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleReportIssue = () => {
    const { error, errorInfo } = this.state;
    const errorData = {
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };

    const subject = encodeURIComponent('Error Report');
    const body = encodeURIComponent(
      `Error Details:\n\n${JSON.stringify(errorData, null, 2)}`
    );
    window.open(`mailto:support@example.com?subject=${subject}&body=${body}`);
  };

  renderErrorDetails() {
    const { error, errorInfo } = this.state;

    if (process.env.NODE_ENV !== 'development') {
      return null;
    }

    return (
      <details className="error-details">
        <summary>Error Details (Development Mode)</summary>
        <div className="error-info">
          <h4>Error Message:</h4>
          <pre>{error?.message}</pre>

          <h4>Stack Trace:</h4>
          <pre>{error?.stack}</pre>

          {errorInfo && (
            <>
              <h4>Component Stack:</h4>
              <pre>{errorInfo.componentStack}</pre>
            </>
          )}
        </div>
      </details>
    );
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const canRetry = this.state.retryCount < this.maxRetries;

      return (
        <div className="error-boundary" role="alert" aria-live="assertive">
          <div className="error-container">
            <div className="error-icon">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h2 className="error-title">Oops! Something went wrong</h2>

            <p className="error-message">
              We&apos;re sorry, but something unexpected happened. The error has
              been logged and we&apos;re looking into it.
            </p>

            {this.state.retryCount > 0 && (
              <p className="retry-info">
                Retry attempt {this.state.retryCount} of {this.maxRetries}
              </p>
            )}

            <div className="error-actions">
              {canRetry && (
                <button
                  className="btn btn-primary"
                  onClick={this.handleRetry}
                  aria-label="Try again"
                >
                  <span>Try Again</span>
                </button>
              )}

              <button
                className="btn btn-secondary"
                onClick={this.handleReload}
                aria-label="Reload the page"
              >
                <span>Reload Page</span>
              </button>

              <button
                className="btn btn-outline"
                onClick={this.handleReportIssue}
                aria-label="Report this issue"
              >
                <span>Report Issue</span>
              </button>
            </div>

            {this.renderErrorDetails()}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
