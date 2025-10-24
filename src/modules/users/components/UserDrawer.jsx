import React, { useEffect, useState } from "react";
import { uploadUserProfileImage } from "../api/users.service";
import { getAuth } from "firebase/auth";

const ROLES = [
  { value: "fan", label: "Fan" },
  { value: "business", label: "Business" },
  { value: "admin", label: "Admin" },
];

const STATUSES = [
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
];

export default function UserDrawer({ open, onClose, initial = null, onSubmit }) {
  const isEdit = !!(initial && initial._id);
  const [model, setModel] = useState({
    fullName: "",
    email: "",
    bio: "",
    fcmToken: "",
    profileImage: "",
    authType: "email",
    role: "fan",
    status: "active",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    setModel({
      fullName: initial?.fullName || "",
      email: initial?.email || "",
      bio: initial?.bio || "",
      fcmToken: initial?.fcmToken || "",
      profileImage: initial?.profileImage || "",
      authType: initial?.authType || "email",
      role: initial?.role || "fan",
      status: initial?.status || "active",
    });
    setErrors({});
    setPreviewUrl("");
  }, [initial, open]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!open) return null;

  function validate(m) {
    const e = {};
    if (!m.fullName.trim()) e.fullName = "Name is required";
    if (!m.email.trim()) e.email = "Email is required";
    if (m.email && !/^\S+@\S+\.\S+$/.test(m.email)) e.email = "Invalid email";
    return e;
  }

  async function handleSubmit(e) {
    e?.preventDefault?.();
    const eMap = validate(model);
    setErrors(eMap);
    if (Object.keys(eMap).length) return;

    setSaving(true);
    try {
      let data = { ...model };
      // Exclude fcmToken and profileImage from being updated manually
      delete data.fcmToken;
      delete data.profileImage;
      Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);
      await onSubmit(data);
      onClose?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full sm:w-[30rem] md:w-[34rem] lg:w-[38rem] glass p-5 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {isEdit ? "Edit User Profile" : "Create User"}
          </h3>
          <button className="btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Image (view only) */}
          {(model.profileImage || previewUrl) && (
            <div className="flex flex-col items-center mb-4">
              <img
                src={previewUrl || model.profileImage}
                alt="User"
                className="w-24 h-24 rounded-full border border-border/30 object-cover mb-2"
              />
              <span className="text-xs text-muted">Profile Picture (view only)</span>
            </div>
          )}

          {/* Full Name */}
          <label className="block">
            <span className="text-sm text-muted">Full Name</span>
            <input
              className="input mt-1"
              value={model.fullName}
              onChange={(e) =>
                setModel((m) => ({ ...m, fullName: e.target.value }))
              }
              placeholder="Hussain Shah"
            />
            {errors.fullName && (
              <div className="text-danger text-xs mt-1">{errors.fullName}</div>
            )}
          </label>

          {/* Email */}
          <label className="block">
            <span className="text-sm text-muted">Email</span>
            <input
              className="input mt-1"
              value={model.email}
              onChange={(e) =>
                setModel((m) => ({ ...m, email: e.target.value }))
              }
              placeholder="user@example.com"
            />
            {errors.email && (
              <div className="text-danger text-xs mt-1">{errors.email}</div>
            )}
          </label>

          {/* Bio */}
          <label className="block">
            <span className="text-sm text-muted">Bio</span>
            <textarea
              className="input mt-1 min-h-[80px]"
              value={model.bio}
              onChange={(e) =>
                setModel((m) => ({ ...m, bio: e.target.value }))
              }
              placeholder="Short bio..."
            />
          </label>

          {/* FCM Token (read-only) */}
          <label className="block">
            <span className="text-sm text-muted">FCM Token</span>
            <input
              className="input mt-1 bg-gray-100 text-gray-500 cursor-not-allowed"
              value={model.fcmToken || ""}
              readOnly
              placeholder="Auto-generated, not editable"
            />
          </label>

          {/* Role + Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm text-muted">Role</span>
              <select
                className="input mt-1"
                value={model.role}
                onChange={(e) =>
                  setModel((m) => ({ ...m, role: e.target.value }))
                }
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm text-muted">Status</span>
              <select
                className="input mt-1"
                value={model.status}
                onChange={(e) =>
                  setModel((m) => ({ ...m, status: e.target.value }))
                }
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Close
            </button>
            <button type="submit" className="btn" disabled={saving}>
              {saving
                ? "Saving…"
                : isEdit
                ? "Save Changes"
                : "Create User"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
