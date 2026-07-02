import { Component } from 'react';
import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8" role="alert">
          <div className="text-center max-w-md">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mb-6">
              <FiAlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-[rgb(var(--color-text))] mb-3">Something went wrong</h1>
            <p className="text-[rgb(var(--color-text-secondary))] mb-8">
              An unexpected error occurred. Please try again.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="btn-primary"
              >
                <FiRefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <Link to="/" className="btn-outline">
                <FiHome className="w-4 h-4" />
                Go Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
