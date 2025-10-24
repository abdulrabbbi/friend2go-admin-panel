import React, { useEffect, useState } from "react";

const PLANS = [
  { value: "free", label: "Free" },
  { value: "premium", label: "Premium" },
  { value: "pro", label: "Pro" },
];

const STATUSES = [
  { value: "active", label: "Active" },
  { value: "unsubscribed", label: "Unsubscribed" },
  { value: "bounced", label: "Bounced" },
];

export default function SubscriberDrawer({
  open,
  onClose,
  initial = null,
  onSubmit,
}) {
  const isEdit = !!(initial && initial._id);
  const [model, setModel] = useState({
    name: "",
    email: "",
    plan: "free",
    status: "active",
    locale: "en",
    tags: [],
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setModel({
      name: initial?.name || "",
      email: initial?.email || "",
      plan: initial?.plan || "free",
      status: initial?.status || "active",
      locale: initial?.locale || "en",
      tags: Array.isArray(initial?.tags) ? initial.tags : [],
    });
    setErrors({});
  }, [initial, open]);

  if (!open) return null;

  function validate(m) {
    const e = {};
    if (!m.name.trim()) e.name = "Name is required";
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
      await onSubmit({
        ...model,
        tags: (model.tags || []).map((t) => t.trim()).filter(Boolean),
      });
      onClose?.();
    } finally {
      setSaving(false);
    }
  }

  const tagsText = (model.tags || []).join(", ");

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full sm:w-[28rem] md:w-[32rem] lg:w-[36rem] max-w-full glass p-5 overflow-y-auto rounded-none sm:rounded-l-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">
            {isEdit ? "Edit Subscriber" : "Add Subscriber"}
          </h3>
          <button className="btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-muted">Name</span>
            <input
              className="input mt-1"
              value={model.name}
              onChange={(e) =>
                setModel((m) => ({ ...m, name: e.target.value }))
              }
              placeholder="Jesse Carter"
            />
            {errors.name && (
              <div className="text-danger text-xs mt-1">{errors.name}</div>
            )}
          </label>

          <label className="block">
            <span className="text-sm text-muted">Email</span>
            <input
              className="input mt-1"
              value={model.email}
              onChange={(e) =>
                setModel((m) => ({ ...m, email: e.target.value }))
              }
              placeholder="jesse@gmail.app"
            />
            {errors.email && (
              <div className="text-danger text-xs mt-1">{errors.email}</div>
            )}
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm text-muted">Plan</span>
              <select
                className="input mt-1"
                value={model.plan}
                onChange={(e) =>
                  setModel((m) => ({ ...m, plan: e.target.value }))
                }
              >
                {PLANS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm text-muted">Locale</span>
              <input
                className="input mt-1"
                value={model.locale}
                onChange={(e) =>
                  setModel((m) => ({ ...m, locale: e.target.value }))
                }
                placeholder="en"
              />
            </label>

            <label className="block">
              <span className="text-sm text-muted">Tags (comma separated)</span>
              <input
                className="input mt-1"
                value={tagsText}
                onChange={(e) =>
                  setModel((m) => ({
                    ...m,
                    tags: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  }))
                }
                placeholder="beta, venues, partner"
              />
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={saving}>
              {saving
                ? "Saving…"
                : isEdit
                ? "Save changes"
                : "Create subscriber"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
