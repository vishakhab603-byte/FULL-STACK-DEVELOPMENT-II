import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || "An unexpected temporal anomaly occurred." };
  }
  componentDidCatch(error) {
    try { window.__kairosLastError = { message: error?.message || String(error), ts: Date.now() }; } catch (e) {}
  }
  reset = () => this.setState({ hasError: false, message: "" });
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="kairos-error-shell">
        <div className="kairos-error-core" aria-hidden="true">✦</div>
        <div className="eyebrow">TEMPORAL INTEGRITY WARNING</div>
        <h1 className="serif">A moment slipped.</h1>
        <p>The interface encountered an unexpected state. Your persisted workspace has not been intentionally erased.</p>
        <div className="kairos-error-message">{this.state.message}</div>
        <div className="error-actions">
          <button className="btn primary" onClick={this.reset}>Return to KAIROS</button>
          <button className="btn" onClick={() => window.location.reload()}>Reload</button>
        </div>
      </div>
    );
  }
}

export { ErrorBoundary };
