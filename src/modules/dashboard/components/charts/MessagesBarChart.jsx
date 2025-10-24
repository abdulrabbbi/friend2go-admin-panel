import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
} from "recharts";

function format(n) {
  if (n == null) return "—";
  return Intl.NumberFormat().format(n);
}

export default function MessagesBarChart({ data = [] }) {
  return (
    <div className="w-full h-72 rounded-2xl p-5 bg-white/[0.03] border border-border/40">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm text-muted">Messages — Volume</h3>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2b2f3a" />
          <XAxis dataKey="label" stroke="#8a8f98" fontSize={12} />
          <YAxis stroke="#8a8f98" fontSize={12} />
          <Tooltip
            contentStyle={{
              background: "#0b0f14",
              border: "1px solid #333",
              borderRadius: 8,
              color: "#fff",
            }}
            formatter={(v) => [format(v), "Messages"]}
            labelStyle={{ color: "#9aa3af" }}
          />
          <Bar
            dataKey="messages"
            fill="#f59e0b"
            radius={[6, 6, 0, 0]}
            maxBarSize={28}
          >
            <LabelList
              dataKey="messages"
              position="top"
              formatter={format}
              className="text-xs fill-current"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
