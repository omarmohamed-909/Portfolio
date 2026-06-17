import React, { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "2rem",
          textAlign: "center",
          background: "#0a0f1a",
          color: "#e2e8f0",
        }}>
          <h1 style={{ fontSize: "3rem", marginBottom: "1rem", color: "#ef4444" }}>Something went wrong</h1>
          <p style={{ color: "#94a3b8", maxWidth: "500px" }}>An unexpected error occurred. Please try refreshing the page.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "1.5rem",
              padding: "0.75rem 2rem",
              background: "#00d4ff",
              border: "none",
              borderRadius: "8px",
              color: "#0a0f1a",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
