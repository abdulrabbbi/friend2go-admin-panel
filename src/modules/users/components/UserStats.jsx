import React, { useMemo } from "react";

// Firestore Timestamp | string | number | Date -> Date|null
function toDate(v) {
  if (!v) return null;
  if (typeof v?.toDate === "function") return v.toDate();
  if (v instanceof Date) return v;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function StatCard({ title, value, change, sub, loading }) {
  const up = typeof change === "number" ? change >= 0 : null;
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
              up
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700"
            }`}
          >
            {up ? "▲" : "▼"} {Math.abs(change)}%
          </div>
        )}
      </div>
      {sub ? <div className="mt-1 text-xs text-muted">{sub}</div> : null}
    </div>
  );
}

export default function UserStats({ users = [], loading }) {
  const periodDays = 30;

  const s = useMemo(() => {
    const now = new Date();
    const curStart = new Date(now);
    curStart.setDate(curStart.getDate() - periodDays);
    const prevStart = new Date(now);
    prevStart.setDate(prevStart.getDate() - periodDays * 2);

    let total = users.length;
    let newCur = 0,
      newPrev = 0,
      active = 0,
      suspended = 0;

    const rolesCount = new Map();

    for (const u of users) {
      // growth buckets
      const created = toDate(u.createdAt);
      if (created) {
        if (created >= curStart && created <= now) newCur++;
        else if (created >= prevStart && created < curStart) newPrev++;
      }

      // status buckets (support boolean or string)
      const st =
        typeof u.status === "boolean"
          ? u.status
            ? "active"
            : "suspended"
          : (u.status || "").toLowerCase();
      if (st === "active") active++;
      if (st === "suspended") suspended++;

      // role chips
      const role = (u.role || "unknown").toLowerCase();
      rolesCount.set(role, (rolesCount.get(role) || 0) + 1);
    }

    const changePct =
      newPrev === 0
        ? newCur > 0
          ? 100
          : 0
        : Math.round(((newCur - newPrev) / newPrev) * 100);
    const roles = Array.from(rolesCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    return { total, newCur, changePct, active, suspended, roles };
  }, [users]);

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Total Users" value={s.total} loading={loading} />
      <StatCard
        title={`New (last ${periodDays}d)`}
        value={s.newCur}
        change={s.changePct}
        loading={loading}
      />
      <StatCard
        title="Active"
        value={s.active}
        sub={s.suspended ? `${s.suspended} suspended` : undefined}
        loading={loading}
      />
      <div className="card p-4">
        <div className="text-sm text-muted">Top Roles</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {loading && <div className="text-sm">—</div>}
          {!loading && s.roles.length === 0 && (
            <div className="text-sm">No roles</div>
          )}
          {!loading &&
            s.roles.map(([role, count]) => (
              <span
                key={role}
                className="text-xs px-2 py-1 rounded-full border border-border/50"
              >
                {role} · {count}
              </span>
            ))}
        </div>
      </div>
    </div>
  );
}
