import React, { useEffect, useRef } from "react";

export default function DeleteConfirm({
  open,
  onClose,
  onConfirm,
  name = "this item",
  title = "Delete notification",
  confirmLabel = "Delete",
}) {
  const boxRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    boxRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={boxRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        className="glass relative w-full max-w-md p-6 space-y-4 rounded-xl border border-border/40"
      >
        <h3 id="delete-dialog-title" className="text-lg font-semibold">
          {title}
        </h3>
        <p className="text-sm text-muted">
          This will permanently remove{" "}
          <span className="text-text font-medium">{name}</span>. This action
          cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn bg-danger/90 hover:bg-danger text-white"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
