
import React from "react";

export function Spinner({ size = 24, className = "" }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-4 border-current border-t-transparent ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export default function Loading({ label = "Loading…" }) {
  return (
    <div className="card p-8 flex items-center gap-3 text-muted">
      <Spinner size={22} />
      <span className="font-medium">{label}</span>
    </div>
  );
}

// Optional: full-screen overlay loader
export function FullScreenLoading({ label = "Just a moment…" }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/5 backdrop-blur-sm">
      <Loading label={label} />
    </div>
  );
}
