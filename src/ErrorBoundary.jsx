import React from "react";

export default class ErrorBoundary extends React.Component {
  state = { hasError: false, err: null };

  static getDerivedStateFromError(err) {
    return { hasError: true, err };
  }

  componentDidCatch(err, info) {
    console.error("ErrorBoundary caught an error:", err, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md mx-auto text-center p-6">
            <div className="text-6xl text-red-500 mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              We're sorry, but there was an error loading the application.
              Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Refresh Page
            </button>
            {import.meta.env.DEV && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-gray-500 text-sm mb-2">
                  Error Details (Development)
                </summary>
                <pre className="text-xs text-red-600 bg-red-50 p-3 rounded overflow-auto">
                  {String(this.state.err)}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
