import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function format(n) {
  if (n == null) return "—";
  return Intl.NumberFormat().format(n);
}

export default function UsersAreaChart({ data = [] }) {
  return (
    <div className="w-full h-72 rounded-2xl p-0 overflow-hidden border border-border/40">
      <div className="px-5 pt-4 pb-2">
        <h3 className="text-sm text-muted">Users — Growth</h3>
      </div>
      <div className="px-2 pb-3">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data} margin={{ left: 8, right: 16 }}>
            <defs>
              <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} stroke="#2b2f3a" />
            <XAxis dataKey="label" stroke="#8a8f98" fontSize={12} />
            <YAxis stroke="#8a8f98" fontSize={12} />
            <Tooltip
              contentStyle={{
                background: "#0b0f14",
                border: "1px solid #333",
                borderRadius: 8,
                color: "#fff",
              }}
              formatter={(v) => [format(v), "Users"]}
              labelStyle={{ color: "#9aa3af" }}
            />
            <Area
              type="monotone"
              dataKey="users"
              stroke="#60a5fa"
              strokeWidth={2}
              fill="url(#fillUsers)"
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
