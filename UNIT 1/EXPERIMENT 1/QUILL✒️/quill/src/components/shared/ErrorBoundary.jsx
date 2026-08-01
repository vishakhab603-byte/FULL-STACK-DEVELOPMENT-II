import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("QUILL crashed in a subtree:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            margin: 24,
            padding: 24,
            border: "1px solid #f2c8c4",
            background: "#ffe4e1",
            borderRadius: 14,
            fontFamily: "Inter, sans-serif",
            color: "#4a1210",
          }}
        >
          <h3 style={{ fontFamily: "Fraunces, serif", marginBottom: 8 }}>
            🖋️ The Muse dropped its pen.
          </h3>
          <p style={{ marginBottom: 12 }}>
            Something in this section broke, but the rest of the app is fine. Reloading usually
            fixes it — your drafts are safe in local storage.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Reload QUILL
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
