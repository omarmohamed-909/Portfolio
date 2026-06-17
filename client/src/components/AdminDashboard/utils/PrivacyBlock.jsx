import React from "react";
import { ShieldOff } from "lucide-react";

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
    padding: "48px 24px",
    textAlign: "center",
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    background: "rgba(239, 68, 68, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    color: "#ef4444",
  },
  title: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    marginBottom: 8,
    letterSpacing: "-0.01em",
  },
  message: {
    fontSize: "0.9rem",
    color: "#94a3b8",
    maxWidth: 420,
    lineHeight: 1.6,
  },
};

const PrivacyBlock = () => {
  return (
    <div style={styles.container}>
      <div style={styles.icon}>
        <ShieldOff size={32} />
      </div>
      <h2 style={styles.title}>Access Denied</h2>
      <p style={styles.message}>
        Admin Only &mdash; Data Protected for Privacy
      </p>
    </div>
  );
};

export default PrivacyBlock;
