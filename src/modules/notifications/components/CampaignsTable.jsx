import React, { useState } from "react";
import { Send, Trash2, Edit, Eye } from "lucide-react";
import DeleteConfirm from "./DeleteConfirm";
import SkeletonRow from "./SkeletonRow";

function Badge({ children, tone = "default" }) {
  const map = {
    default: "bg-white/5 text-text border-border/40",
    completed: "bg-emerald-500/10 text-emerald-400 border-emerald-400/30",
    failed: "bg-red-500/10 text-red-400 border-red-400/30",
    draft: "bg-white/5 text-muted border-border/40",
    scheduled: "bg-amber-500/10 text-amber-400 border-amber-400/30",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded border text-xs ${map[tone] || map.default}`}
    >
      {children}
    </span>
  );
}

export default function CampaignsTable({
  items = [],
  loading = false,
  onSend,
  onDelete,
  onEdit,
  onView,
}) {
  const [delOpen, setDelOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const askDelete = (c) => {
    setToDelete(c);
    setDelOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    await onDelete?.(toDelete);
    setDelOpen(false);
    setToDelete(null);
  };

  return (
    <div className="card">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left">
            <tr className="text-muted">
              <th className="px-4 py-3 font-medium w-[34%]">Title</th>
              <th className="px-4 py-3 font-medium w-[20%]">Target</th>
              <th className="px-4 py-3 font-medium w-[16%]">Status</th>
              <th className="px-4 py-3 font-medium w-[18%]">Created / Sent</th>
              <th className="px-4 py-3 font-medium text-right w-[12%]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} cols={5} />
              ))}

            {!loading &&
              items.map((c) => (
                <tr key={c._id} className="border-t border-border/60">
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium">{c.title || "—"}</div>
                    {c.text && (
                      <div className="text-xs text-muted line-clamp-2">{c.text}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">
                    {c.targetType === "all" && <Badge>All</Badge>}
                    {c.targetType === "topic" && (
                      <Badge>Topic: {c.topic || "all"}</Badge>
                    )}
                    {c.targetType === "userIds" && (
                      <Badge>{c.userIds?.length || 0} Users</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Badge
                      tone={
                        c.status === "completed"
                          ? "completed"
                          : c.status === "failed"
                          ? "failed"
                          : c.status === "scheduled"
                          ? "scheduled"
                          : "draft"
                      }
                    >
                      {c.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 align-top text-xs text-muted">
                    <div>
                      {c.createdAt ? new Date(c.createdAt).toLocaleString() : "—"}
                    </div>
                    <div>
                      {c.sentAt ? "Sent: " + new Date(c.sentAt).toLocaleString() : ""}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex justify-end gap-2">
                      <button
                        className="btn-ghost px-2 py-1.5"
                        onClick={() => onView?.(c)}
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="btn-ghost px-2 py-1.5"
                        onClick={() => onEdit?.(c)}
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="btn-ghost px-2 py-1.5"
                        onClick={() => onSend?.(c)}
                        title="Send now"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      <button
                        className="btn-ghost px-2 py-1.5 text-danger"
                        onClick={() => askDelete(c)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">
                  No notifications yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile list */}
      <div className="md:hidden divide-y divide-border/60">
        {!loading &&
          items.map((c) => (
            <div key={c._id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{c.title}</div>
                  <div className="text-xs text-muted line-clamp-2">{c.text}</div>
                  <div className="mt-2 flex gap-2">
                    <Badge>
                      {c.targetType === "all"
                        ? "All"
                        : c.targetType === "topic"
                        ? `Topic: ${c.topic || "all"}`
                        : `${c.userIds?.length || 0} Users`}
                    </Badge>
                    <Badge
                      tone={
                        c.status === "completed"
                          ? "completed"
                          : c.status === "failed"
                          ? "failed"
                          : c.status === "scheduled"
                          ? "scheduled"
                          : "draft"
                      }
                    >
                      {c.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted mt-2">
                    {c.createdAt ? new Date(c.createdAt).toLocaleString() : "—"}
                    {c.sentAt
                      ? " • Sent " + new Date(c.sentAt).toLocaleString()
                      : ""}
                  </div>
                </div>
                <div className="shrink-0 flex flex-col gap-1">
                  <button className="btn-ghost px-2 py-1.5" onClick={() => onView?.(c)}>
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="btn-ghost px-2 py-1.5" onClick={() => onEdit?.(c)}>
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="btn-ghost px-2 py-1.5" onClick={() => onSend?.(c)}>
                    <Send className="w-4 h-4" />
                  </button>
                  <button
                    className="btn-ghost px-2 py-1.5 text-danger"
                    onClick={() => askDelete(c)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        {loading && <div className="p-4 text-muted">Loading…</div>}
      </div>

      {/* Delete Confirm Modal */}
      <DeleteConfirm
        open={delOpen}
        onClose={() => setDelOpen(false)}
        onConfirm={confirmDelete}
        name={toDelete?.title || "this notification"}
        title="Delete notification"
        confirmLabel="Delete"
      />
    </div>
  );
}
