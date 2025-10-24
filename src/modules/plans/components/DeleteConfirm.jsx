import React, { useEffect, useRef } from "react";

export default function DeleteConfirm({ open, onClose, onConfirm, name = "this plan" }) {
  const boxRef = useRef(null);
  useEffect(() => {
    if (open && boxRef.current) boxRef.current.focus();
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        ref={boxRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        className="glass relative w-full max-w-md p-6 space-y-4"
      >
        <h3 id="delete-dialog-title" className="text-lg font-semibold">Delete plan</h3>
        <p className="text-sm text-muted">
          This will permanently remove <span className="text-text font-medium">{name}</span>. This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

