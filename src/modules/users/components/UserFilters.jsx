import React from "react";

export default function UserFilters({
  q,
  role,
  status,
  onChangeQuery,
  onChangeRole,
  onChangeStatus,
  roles = ["admin", "owner", "fan"],
}) {
  return (
    <div className="card p-4">
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-end">
        <label className="block sm:col-span-2">
          <span className="text-sm text-muted">Search</span>
          <input
            className="input mt-1 w-full"
            placeholder="Search by name or email…"
            value={q}
            onChange={(e) => onChangeQuery(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-sm text-muted">Role</span>
          <select
            className="input mt-1 w-full"
            value={role}
            onChange={(e) => onChangeRole(e.target.value)}
          >
            <option value="">All</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm text-muted">Status</span>
          <select
            className="input mt-1 w-full"
            value={status}
            onChange={(e) => onChangeStatus(e.target.value)}
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </label>
      </div>
    </div>
  );
}
