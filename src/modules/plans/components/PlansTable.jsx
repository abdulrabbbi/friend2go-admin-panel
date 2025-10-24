import React, { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import SkeletonRow from "./SkeletonRow";

/* ---------- Tiny thumbnail component (desktop + mobile) ---------- */
function PlanThumb({ src, alt = "Plan photo" }) {
  const [err, setErr] = useState(false);

  if (!src || err) {
    return (
      <div
        className="
          h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16
          rounded-md ring-1 ring-border/40
          bg-gradient-to-br from-white/10 via-primary/10 to-transparent
          dark:from-white/5 dark:via-primary/10
          shrink-0
        "
        aria-hidden="true"
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className="
        h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16
        rounded-md object-cover ring-1 ring-border/40 bg-white/5
        shrink-0
      "
      onError={() => setErr(true)}
    />
  );
}

function ActionsMenu({ plan, onView, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-flex justify-end w-full">
      <button className="btn-ghost p-1.5" onClick={() => setOpen((o) => !o)}>
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-neutral-800 border border-border/40 rounded-md shadow-lg z-50">
          <button
            onClick={() => { setOpen(false); onView?.(plan); }}
            className="block w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            View
          </button>
          <button
            onClick={() => { setOpen(false); onEdit?.(plan); }}
            className="block w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            Edit
          </button>
          <button
            onClick={() => { setOpen(false); onDelete?.(plan); }}
            className="block w-full text-left px-3 py-1.5 text-danger hover:bg-danger/10"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function PlansTable({
  loading = false,
  data = [],
  page = 1,
  total = 0,
  limit = 10,
  onPrev,
  onNext,
  onView,
  onEdit,
  onDelete,
}) {
  const hasPrev = page > 1;
  const hasNext = page * (limit || 1) < total;
  const totalPages = Math.max(1, Math.ceil((total || 0) / (limit || 1)));

  return (
    <div className="card">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left">
            <tr className="text-muted">
              {/* widen first col to fit thumbnail + text */}
              <th className="px-4 py-3 font-medium w-[36%]">Plan</th>
              <th className="px-4 py-3 font-medium w-[18%]">Schedule</th>
              <th className="px-4 py-3 font-medium w-[22%]">Location</th>
              <th className="px-4 py-3 font-medium w-[12%]">Status</th>
              <th className="px-4 py-3 font-medium text-right w-[12%]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}

            {!loading &&
              data.map((p) => {
                // derive schedule text if you have start/end strings
                const schedule =
                  p.startDate && p.endDate
                    ? `${new Date(p.startDate).toLocaleString()} – ${new Date(p.endDate).toLocaleString()}`
                    : p.startDate
                    ? new Date(p.startDate).toLocaleString()
                    : "—";

                return (
                  <tr key={p._id} className="border-t border-border/60 align-top">
                    {/* PLAN (thumb + text) */}
                    <td className="px-4 py-3">
                      <div className="flex gap-3 items-start min-w-0">
                        <PlanThumb src={p.planPhoto} alt={p.title} />
                        <div className="min-w-0">
                          <div className="font-medium truncate" title={p.title}>
                            {p.title || "Untitled"}
                          </div>
                          {/* secondary line(s) */}
                          <div className="text-xs text-muted capitalize">
                            {p.category || "—"}
                          </div>
                          {p.description && (
                            <div className="text-xs text-muted line-clamp-2 max-w-[520px]">
                              {p.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* SCHEDULE */}
                    <td className="px-4 py-3">{schedule}</td>

                    {/* LOCATION */}
                    <td className="px-4 py-3">
                      <div className="truncate max-w-[260px]" title={p.location}>
                        {p.location || "—"}
                      </div>
                      {/* optional secondary location line (city, etc.) */}
                      {/* <div className="text-xs text-muted">Madrid</div> */}
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-3 capitalize">
                      {p.status || "—"}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-4 py-3 text-right">
                      <ActionsMenu plan={p} onView={onView} onEdit={onEdit} onDelete={onDelete} />
                    </td>
                  </tr>
                );
              })}

            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">
                  No plans found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-3 rounded-lg border border-border/50 bg-white/5 animate-pulse h-24"
            />
          ))}

        {!loading &&
          data.map((p) => (
            <div
              key={p._id}
              className="p-4 rounded-lg border border-border/50 bg-white/5 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <PlanThumb src={p.planPhoto} alt={p.title} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-base truncate" title={p.title}>
                        {p.title || "Untitled"}
                      </h3>
                      {p.category && (
                        <p className="text-xs text-muted capitalize">{p.category}</p>
                      )}
                    </div>
                    <ActionsMenu plan={p} onView={onView} onEdit={onEdit} onDelete={onDelete} />
                  </div>

                  {p.description && (
                    <p className="text-sm text-muted line-clamp-2 mt-2">{p.description}</p>
                  )}

                  <div className="flex flex-wrap justify-between mt-3 text-xs text-muted">
                    <span>📍 {p.location || "Unknown"}</span>
                    <span className="capitalize">Status: {p.status || "—"}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

        {!loading && data.length === 0 && (
          <div className="text-center text-muted py-8">No plans found.</div>
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
