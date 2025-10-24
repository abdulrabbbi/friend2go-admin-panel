import React from "react";
export default class ErrorBoundary extends React.Component {
  state = { hasError: false, err: null };
  static getDerivedStateFromError(err) {
    return { hasError: true, err };
  }
  componentDidCatch(err, info) {
    console.error(err, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <h2>Something went wrong.</h2>
          <pre className="text-xs opacity-70">{String(this.state.err)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
