import React, { useMemo } from "react";

// Safely convert Firestore Timestamp | string | number -> Date | null
function toDate(v) {
  if (!v) return null;
  if (typeof v?.toDate === "function") return v.toDate();
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function StatCard({ title, value, change, sub, loading }) {
  const isUp = typeof change === "number" ? change >= 0 : null;
  return (
    <div className="card p-4">
      <div className="text-sm text-muted">{title}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-2xl font-semibold tabular-nums">
          {loading ? "—" : value}
        </div>
        {typeof change === "number" && (
          <div
            className={`text-xs px-2 py-0.5 rounded-full ${
              isUp
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700"
            }`}
          >
            {isUp ? "▲" : "▼"} {Math.abs(change)}%
          </div>
        )}
      </div>
      {sub ? <div className="mt-1 text-xs text-muted">{sub}</div> : null}
    </div>
  );
}

export default function PlanStats({ plans = [], loading }) {
  const periodDays = 30;

  const stats = useMemo(() => {
    const now = new Date();
    const currentStart = new Date(now);
    currentStart.setDate(now.getDate() - periodDays);

    const prevStart = new Date(now);
    prevStart.setDate(now.getDate() - periodDays * 2);

    let total = plans.length;
    let currentNew = 0;
    let prevNew = 0;
    let upcoming = 0;
    let completed = 0;
    let active = 0;

    for (const p of plans) {
      // createdAt buckets (growth)
      const createdAt = toDate(p.createdAt);
      if (createdAt) {
        if (createdAt >= currentStart && createdAt <= now) currentNew++;
        else if (createdAt >= prevStart && createdAt < currentStart) prevNew++;
      }

      // time-window buckets
      const start = toDate(p.startDate);
      const end = toDate(p.endDate);

      if (start && start > now) upcoming++;
      if (end && end < now) completed++;
      if (
        p?.status === "active" ||
        (start && end && start <= now && now <= end)
      ) {
        active++;
      }
    }

    const changePct =
      prevNew === 0
        ? currentNew > 0
          ? 100
          : 0
        : Math.round(((currentNew - prevNew) / prevNew) * 100);

    return { total, currentNew, changePct, active, upcoming, completed };
  }, [plans]);

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Total Plans" value={stats.total} loading={loading} />
      <StatCard
        title={`New (last ${periodDays}d)`}
        value={stats.currentNew}
        change={stats.changePct}
        loading={loading}
      />
      <StatCard title="Active Now" value={stats.active} loading={loading} />
      <StatCard
        title="Upcoming"
        value={stats.upcoming}
        sub={stats.completed ? `${stats.completed} completed` : undefined}
        loading={loading}
      />
    </div>
  );
}
