import { Component } from "react";

// Catches render/lifecycle errors anywhere below it in the tree so a bug in
// one page shows a recoverable screen instead of a blank white page for the
// whole app. Must be a class component - React has no hook equivalent for
// getDerivedStateFromError/componentDidCatch.
class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-4 text-center dark:bg-gray-950">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Something went wrong
          </h1>
          <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
            An unexpected error occurred. Reloading the page usually fixes it.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
