import React from "react";

export default function StatCard({ icon: Icon, label, value, color, loading }) {
  return (
    <div
      className="rounded-2xl border border-border/40 bg-white/[0.03] p-5 flex flex-col items-center 
                 hover:bg-white/[0.06] transition-all shadow-md backdrop-blur-md group"
    >
      <div
        className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition`}
      >
        <Icon className="text-2xl" />
      </div>
      <div className="mt-3 text-sm text-muted">{label}</div>
      <div className="text-3xl font-semibold mt-1">
        {loading ? "…" : value.toLocaleString()}
      </div>
    </div>
  );
}
