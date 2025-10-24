import React, { useEffect, useState } from "react";

export default function PlanDrawer({
  open,
  onClose,
  initial,
  onSubmit,
  mode = "view",
}) {
  const isEdit = mode === "edit";
  const isView = mode === "view";

  const [model, setModel] = useState({
    title: "",
    category: "",
    description: "",
    age: "",
    status: "",
    location: "",
    maxMembers: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    planPhoto: "",
    planCreatorID: "",
  });

  useEffect(() => {
    if (initial) setModel(initial);
  }, [initial]);

  if (!open) return null;

  // --- formatting helpers for date/time fields ---
  function toDateInput(val) {
    if (!val) return "";
    if (typeof val === "string") {
      const m = val.match(/^(\d{4}-\d{2}-\d{2})/);
      if (m) return m[1];
    }
    try {
      const d = new Date(val);
      // Format as YYYY-MM-DD in local-safe way
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  }

  function toTimeInput(val) {
    if (!val) return "";
    if (typeof val === "string") {
      const mIso = val.match(/T(\d{2}:\d{2})(?::\d{2,}.*)?/);
      if (mIso) return mIso[1];
      const mHhMm = val.match(/^(\d{2}:\d{2})/);
      if (mHhMm) return mHhMm[1];
    }
    try {
      const d = new Date(val);
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      return `${hh}:${mm}`;
    } catch {
      return "";
    }
  }

  function handleChange(field, val) {
    // Normalize date/time fields to clean values without ISO T
    if (field === "startDate" || field === "endDate") {
      setModel((m) => ({ ...m, [field]: val })); // val already YYYY-MM-DD
      return;
    }
    if (field === "startTime" || field === "endTime") {
      setModel((m) => ({ ...m, [field]: val })); // val already HH:MM
      return;
    }
    setModel((m) => ({ ...m, [field]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await onSubmit(model);
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full sm:w-[30rem] md:w-[34rem] lg:w-[38rem] glass p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {isEdit ? "Edit Plan" : "View Plan"}
          </h3>
          <button className="btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {model.planPhoto && (
            <div className="flex flex-col items-center w-full">
              <div className="w-full sm:w-[90%] md:w-[80%] lg:w-[70%] aspect-video relative">
                <img
                  src={model.planPhoto}
                  alt="Plan"
                  className="w-full h-52 object-cover rounded-xl border border-border/20 shadow-sm"
                />
              </div>
              <span className="text-xs text-muted mt-2">Plan Image</span>
            </div>
          )}

          {/* Title */}
          <label className="block">
            <span className="text-sm text-muted">Title</span>
            <input
              className="input mt-1 w-full"
              type="text"
              value={model.title || ""}
              readOnly={isView}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Title"
            />
          </label>

          {/* Category */}
          <label className="block">
            <span className="text-sm text-muted">Category</span>
            <input
              className="input mt-1 w-full"
              type="text"
              value={model.category || ""}
              readOnly={isView}
              onChange={(e) => handleChange("category", e.target.value)}
              placeholder="Category"
            />
          </label>

          {/* Description */}
          <label className="block">
            <span className="text-sm text-muted">Description</span>
            <textarea
              className="input mt-1 w-full min-h-[90px]"
              value={model.description || ""}
              readOnly={isView}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Description"
            />
          </label>

          {/* Location */}
          <label className="block">
            <span className="text-sm text-muted">Location</span>
            <input
              className="input mt-1 w-full"
              type="text"
              value={model.location || ""}
              readOnly={isView}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="Location"
            />
          </label>

          {/* Age + Max Members */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm text-muted">Age</span>
              <input
                className="input mt-1 w-full"
                type="text"
                value={model.age || ""}
                readOnly={isView}
                onChange={(e) => handleChange("age", e.target.value)}
                placeholder="Age"
              />
            </label>
            <label className="block">
              <span className="text-sm text-muted">Max Members</span>
              <input
                className="input mt-1 w-full"
                type="number"
                value={model.maxMembers || ""}
                readOnly={isView}
                onChange={(e) => handleChange("maxMembers", e.target.value)}
                placeholder="Max Members"
              />
            </label>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm text-muted">Start Date</span>
              <input
                className="input mt-1 w-full"
                type="date"
                value={toDateInput(model.startDate)}
                readOnly={isView}
                onChange={(e) => handleChange("startDate", e.target.value)}
                placeholder="Start Date"
              />
            </label>
            <label className="block">
              <span className="text-sm text-muted">End Date</span>
              <input
                className="input mt-1 w-full"
                type="date"
                value={toDateInput(model.endDate)}
                readOnly={isView}
                onChange={(e) => handleChange("endDate", e.target.value)}
                placeholder="End Date"
              />
            </label>
          </div>

          {/* Times */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm text-muted">Start Time</span>
              <input
                className="input mt-1 w-full"
                type="time"
                value={toTimeInput(model.startTime)}
                readOnly={isView}
                step={60}
                onChange={(e) => handleChange("startTime", e.target.value)}
                placeholder="Start Time"
              />
            </label>
            <label className="block">
              <span className="text-sm text-muted">End Time</span>
              <input
                className="input mt-1 w-full"
                type="time"
                value={toTimeInput(model.endTime)}
                readOnly={isView}
                step={60}
                onChange={(e) => handleChange("endTime", e.target.value)}
                placeholder="End Time"
              />
            </label>
          </div>

          {/* Status */}
          <label className="block">
            <span className="text-sm text-muted">Status</span>
            <input
              className="input mt-1 w-full"
              type="text"
              value={model.status || ""}
              readOnly={isView}
              onChange={(e) => handleChange("status", e.target.value)}
              placeholder="Status"
            />
          </label>

          {/* Read-only fields */}
          <div className="mt-4">
            <span className="text-sm text-muted">Plan Creator ID</span>
            <input
              className="input mt-1 w-full bg-gray-100 text-gray-500 cursor-not-allowed"
              value={model.planCreatorID || ""}
              readOnly
            />
          </div>

          {isEdit && (
            <div className="flex justify-end gap-2 pt-4">
              <button type="button" className="btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn">
                Save Changes
              </button>
            </div>
          )}
        </form>
      </aside>
    </div>
  );
}
