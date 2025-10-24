import React from "react";
import PlansLineChart from "./charts/PlansLineChart";
import UsersAreaChart from "./charts/UsersAreaChart";
import MessagesBarChart from "./charts/MessagesBarChart";

export default function GrowthChart({ data }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <PlansLineChart data={data} />
      <UsersAreaChart data={data} />
      <MessagesBarChart data={data} />
    </div>
  );
}
