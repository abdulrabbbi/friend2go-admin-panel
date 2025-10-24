import React from "react";

export default function ViewUserModal({ open, onClose, user }) {
  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full sm:w-[26rem] md:w-[30rem] lg:w-[34rem] glass p-5 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">User Details</h3>
          <button className="btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={user.profileImage}
              alt={user.fullName}
              className="w-16 h-16 rounded-full border border-border/40 object-cover"
            />
            <div>
              <div className="font-semibold text-lg">{user.fullName}</div>
              <div className="text-sm text-muted">{user.email}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            <Info label="Auth Type" value={user.authType} />
            <Info label="Role" value={user.role} cap />
            <Info label="Status" value={user.status} cap />
            <Info
              label="Created"
              value={
                user.createdAt ? new Date(user.createdAt).toLocaleString() : "—"
              }
            />
          </div>

          {user.bio && <Block label="Bio" value={user.bio} pre />}
          {user.fcmToken && (
            <div>
              <div className="text-xs text-muted uppercase mb-1">FCM Token</div>
              <textarea
                readOnly
                className="input text-xs h-[90px] resize-none"
                value={user.fcmToken}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, cap }) {
  return (
    <div>
      <div className="text-xs text-muted uppercase">{label}</div>
      <div className="text-sm">
        {cap
          ? String(value || "")
              .toLowerCase()
              .replace(/^\w/, (c) => c.toUpperCase())
          : value || "—"}
      </div>
    </div>
  );
}

function Block({ label, value, pre }) {
  return (
    <div>
      <div className="text-xs text-muted uppercase mb-1">{label}</div>
      <p className={`text-sm ${pre ? "whitespace-pre-line" : ""}`}>{value}</p>
    </div>
  );
}
