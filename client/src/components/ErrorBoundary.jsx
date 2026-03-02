import { Component } from 'react';

/**
 * React Error Boundary
 *
 * Catches rendering errors in any descendant component tree and shows
 * a user-friendly fallback UI instead of a white screen.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 *
 * Or with a custom fallback:
 *   <ErrorBoundary fallback={<MyFallback />}>
 *     <App />
 *   </ErrorBoundary>
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log to an external service in production (e.g., Sentry)
        console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            // Allow a custom fallback via props
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-base-200 p-6">
                    <div className="max-w-md w-full bg-base-100 rounded-2xl shadow-xl p-8 text-center space-y-5">
                        {/* Icon */}
                        <div className="text-5xl">⚠️</div>

                        <h2 className="text-2xl font-bold text-error">
                            Something went wrong
                        </h2>

                        <p className="text-base-content/70">
                            An unexpected error occurred. Please try refreshing the page. 
                            If the problem persists, contact the admin team.
                        </p>

                        {/* Show error in dev only */}
                        {import.meta.env.DEV && this.state.error && (
                            <details className="text-left bg-base-300 rounded-lg p-3 text-xs overflow-auto max-h-40">
                                <summary className="cursor-pointer font-medium text-sm mb-1">
                                    Error Details
                                </summary>
                                <pre className="whitespace-pre-wrap break-words">
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}

                        <div className="flex gap-3 justify-center pt-2">
                            <button
                                onClick={this.handleReset}
                                className="btn btn-primary btn-sm"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="btn btn-outline btn-sm"
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
