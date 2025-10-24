import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceDot,
} from "recharts";

function format(n) {
  if (n == null) return "—";
  return Intl.NumberFormat().format(n);
}

export default function PlansLineChart({ data = [] }) {
  const last = useMemo(
    () => (data?.length ? data[data.length - 1] : null),
    [data]
  );

  return (
    <div className="w-full h-72 rounded-2xl p-5 border border-border/40 glass">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm text-muted">Plans — Trend</h3>
        {last && (
          <div className="text-xs text-muted">Latest: {format(last.plans)}</div>
        )}
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <defs>
            <linearGradient id="strokePlans" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#a8ff1a" />
              <stop offset="100%" stopColor="#7be214" />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="4 4" stroke="#2b2f3a" />
          <XAxis dataKey="label" stroke="#8a8f98" fontSize={12} />
          <YAxis stroke="#8a8f98" fontSize={12} />
          <Tooltip
            contentStyle={{
              background: "#0b0f14",
              border: "1px solid #333",
              borderRadius: 8,
              color: "#fff",
            }}
            formatter={(v) => [format(v), "Plans"]}
            labelStyle={{ color: "#9aa3af" }}
          />
          <Line
            type="monotone"
            dataKey="plans"
            stroke="url(#strokePlans)"
            strokeWidth={2.5}
            dot={{ r: 2 }}
            activeDot={{ r: 4 }}
          />
          {last && (
            <ReferenceDot
              x={last.label}
              y={last.plans}
              r={4.5}
              fill="#a8ff1a"
              stroke="#0b0f14"
              strokeWidth={2}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
