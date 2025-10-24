import React from "react";
import SkeletonRow from "./SkeletonRow";

function PlanBadge({ plan }) {
  const map = {
    free: "bg-primary/20 text-primary border border-primary/30",
    premium: "bg-success/20 text-success border border-success/30",
    pro: "bg-warning/20 text-warning border border-warning/30",
  };
  return <span className={`badge ${map[plan] || ""}`}>{plan}</span>;
}

function StatusBadge({ status }) {
  const map = {
    active: "bg-success/20 text-success border border-success/30",
    unsubscribed: "bg-danger/20 text-danger border border-danger/30",
    bounced: "bg-danger/20 text-danger border border-danger/30",
  };
  return <span className={`badge ${map[status] || ""}`}>{status}</span>;
}

export default function SubscribersTable({
  loading,
  items,
  page,
  total,
  limit,
  onPrev,
  onNext,
  onEdit,
  onDelete,
}) {
  const hasPrev = page > 1;
  const hasNext = page * limit < total;

  return (
    <div className="card">
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left">
            <tr className="text-muted">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Tags</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}

            {!loading &&
              items.map((s) => (
                <tr key={s._id} className="border-t border-border/60">
                  <td className="px-4 py-3">
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted">
                      Subscribed {new Date(s.subscribedAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-3">{s.email}</td>
                  <td className="px-4 py-3">
                    <PlanBadge plan={s.plan} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="px-4 py-3">
                    {s.tags?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {s.tags.map((t) => (
                          <span key={t} className="badge">
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button className="btn-ghost" onClick={() => onEdit(s)}>
                        Edit
                      </button>
                      <button className="btn-ghost" onClick={() => onDelete(s)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">
                  No subscribers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile list */}
      <div className="sm:hidden">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse p-3 border-b border-border/40">
              <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
              <div className="h-3 bg-white/10 rounded w-1/2" />
            </div>
          ))}

        {!loading &&
          items.map((s) => (
            <div key={s._id} className="p-3 border-b border-border/40">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{s.name}</div>
                  <div className="text-xs text-muted truncate">{s.email}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <PlanBadge plan={s.plan} />
                    <StatusBadge status={s.status} />
                  </div>
                  <div className="text-xs text-muted mt-1">
                    {s.tags?.length ? `${s.tags.length} tags` : <span className="text-muted">—</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button className="btn-ghost" onClick={() => onEdit(s)}>Edit</button>
                  <button className="btn-ghost" onClick={() => onDelete(s)}>Delete</button>
                </div>
              </div>
            </div>
          ))}

        {!loading && items.length === 0 && (
          <div className="p-6 text-center text-muted">No subscribers found.</div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
        <div className="text-xs text-muted">
          Page <span className="text-text">{page}</span> of{" "}
          <span className="text-text">
            {Math.max(1, Math.ceil(total / (limit || 1)))}
          </span>{" "}
          — {total} total
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost" disabled={!hasPrev} onClick={onPrev}>
            Prev
          </button>
          <button className="btn-ghost" disabled={!hasNext} onClick={onNext}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
