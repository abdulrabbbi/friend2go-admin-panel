import React, { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import SkeletonRow from "./SkeletonRow";

/* ------------------ Badges ------------------ */
function RoleBadge({ role }) {
  const map = {
    fan: "bg-primary/20 text-primary border border-primary/30",
    business: "bg-warning/20 text-warning border border-warning/30",
    admin: "bg-success/20 text-success border border-success/30",
  };
  return (
    <span
      className={`badge inline-flex items-center gap-1 px-2 py-0.5 text-[11px] md:text-xs rounded-full whitespace-nowrap ${
        map[role] || ""
      }`}
    >
      {role}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    active: "bg-success/20 text-success border border-success/30",
    suspended: "bg-danger/20 text-danger border border-danger/30",
  };
  return (
    <span
      className={`badge inline-flex items-center gap-1 px-2 py-0.5 text-[11px] md:text-xs rounded-full whitespace-nowrap ${
        map[status] || ""
      }`}
    >
      {status}
    </span>
  );
}

/* ------------------ Actions Menu ------------------ */
function ActionsMenu({ user, onView, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="btn-ghost p-1.5"
        onClick={() => setOpen((o) => !o)}
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-neutral-800 border border-border/40 rounded-md shadow-lg z-50">
          <button
            onClick={() => {
              setOpen(false);
              onView?.(user);
            }}
            className="block w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            View
          </button>
          <button
            onClick={() => {
              setOpen(false);
              onEdit?.(user);
            }}
            className="block w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            Edit
          </button>
          <button
            onClick={() => {
              setOpen(false);
              onDelete?.(user);
            }}
            className="block w-full text-left px-3 py-1.5 text-danger hover:bg-danger/10"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------ Table ------------------ */
export default function UserTable({
  loading,
  items,
  page,
  total,
  limit,
  onPrev,
  onNext,
  onView,
  onEdit,
  onDelete,
}) {
  const hasPrev = page > 1;
  const hasNext = page * limit < total;
  const totalPages = Math.max(1, Math.ceil(total / (limit || 1)));

  return (
    <div className="card">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left">
            <tr className="text-muted">
              <th className="px-4 py-3 font-medium w-[20%]">Profile</th>
              <th className="px-4 py-3 font-medium w-[20%]">Email</th>
              <th className="px-4 py-3 font-medium w-[12%]">Role</th>
              <th className="px-4 py-3 font-medium w-[12%]">Status</th>
              <th className="px-4 py-3 font-medium w-[20%] hidden lg:table-cell">Auth Type</th>
              <th className="px-4 py-3 font-medium text-right w-[10%]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}

            {!loading &&
              items.map((u) => (
                <tr key={u._id} className="border-t border-border/60">
                  {/* Name + Image */}
                  <td className="px-4 py-3 align-top min-w-[220px] flex items-center gap-3">
                    <img
                      src={u.profileImage}
                      alt={u.fullName}
                      className="w-9 h-9 rounded-full object-cover border border-border/40"
                    />
                    <div>
                      <div className="font-medium truncate max-w-[180px]" title={u.fullName}>
                        {u.fullName}
                      </div>
                      <div className="text-xs text-muted whitespace-nowrap">
                        Joined {new Date(u.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 align-top">
                    <div className="truncate max-w-[240px]" title={u.email}>
                      {u.email}
                    </div>
                  </td>

                  <td className="px-4 py-3 align-top">
                    <RoleBadge role={u.role || "fan"} />
                  </td>

                  <td className="px-4 py-3 align-top">
                    <StatusBadge status={u.status || ""} />
                  </td>

                  <td className="px-4 py-3 align-top hidden lg:table-cell">
                    <span className="text-xs text-muted">{u.authType || "email"}</span>
                  </td>

                  <td className="px-4 py-3 align-top text-right">
                    <ActionsMenu user={u} onView={onView} onEdit={onEdit} onDelete={onDelete} />
                  </td>
                </tr>
              ))}

            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile List */}
      <div className="md:hidden">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse p-3 border-b border-border/40">
              <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
              <div className="h-3 bg-white/10 rounded w-1/2" />
            </div>
          ))}

        {!loading &&
          items.map((u) => (
            <div key={u._id} className="p-3 border-b border-border/40">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <img
                      src={u.profileImage}
                      alt={u.fullName}
                      className="w-8 h-8 rounded-full border border-border/40"
                    />
                    <div className="font-medium truncate" title={u.fullName}>
                      {u.fullName}
                    </div>
                  </div>
                  <div className="text-xs text-muted truncate" title={u.email}>
                    {u.email}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <RoleBadge role={u.role} />
                    <StatusBadge status={u.status} />
                    <span className="text-xs text-muted">{u.authType || "email"}</span>
                  </div>

                  <div className="text-xs text-muted mt-1">
                    Joined {new Date(u.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <ActionsMenu user={u} onView={onView} onEdit={onEdit} onDelete={onDelete} />
              </div>
            </div>
          ))}

        {!loading && items.length === 0 && (
          <div className="p-6 text-center text-muted">No users found.</div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 pt-4">
        <div className="text-xs text-muted order-2 md:order-1">
          Page <span className="text-text">{page}</span> of{" "}
          <span className="text-text">{totalPages}</span> — {total} total
        </div>
        <div className="flex gap-2 order-1 md:order-2">
          <button className="btn-ghost px-3 py-1.5 text-sm" disabled={!hasPrev} onClick={onPrev}>
            Prev
          </button>
          <button className="btn-ghost px-3 py-1.5 text-sm" disabled={!hasNext} onClick={onNext}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
