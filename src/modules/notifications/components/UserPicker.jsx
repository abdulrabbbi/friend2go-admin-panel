import React, { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { listUsers } from "../../users/api/users.service"; // adjust path if needed

function useDebounced(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

export default function UserPicker({
  value = [],
  onChange,
  placeholder = "Search users by name or email…",
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const debouncedQ = useDebounced(q, 250);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  // close on outside click / ESC
  useEffect(() => {
    function onDoc(e) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await listUsers({ q: debouncedQ });
        if (!active) return;
        const selectedIds = new Set(value.map((u) => u._id));
        const filtered = (res.items || []).filter((u) => !selectedIds.has(u._id));
        setResults(filtered.slice(0, 30));
      } catch (e) {
        console.error(e);
        if (active) setResults([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [debouncedQ, value]);

  const remove = (id) => onChange?.(value.filter((u) => u._id !== id));
  const add = (u) => {
    if (value.find((x) => x._id === u._id)) return;
    onChange?.([...(value || []), u]);
    setQ("");
    inputRef.current?.focus();
  };

  const emptyState = useMemo(
    () => (debouncedQ ? `No users found for "${debouncedQ}"` : "Type to search users…"),
    [debouncedQ]
  );

  return (
    <div className="space-y-2" ref={wrapRef}>
      <div className="text-sm text-muted">Select users</div>

      {/* Selected chips */}
      {value?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((u) => (
            <span
              key={u._id}
              className="inline-flex items-center gap-2 px-2 py-1 rounded-lg border border-border/50 bg-white/5"
            >
              <img
                src={u.profileImage || ""}
                alt={u.fullName || u.email || u._id}
                className="h-6 w-6 rounded-full object-cover border border-border/40"
                onError={(e) => (e.currentTarget.style.visibility = "hidden")}
              />
              <span className="text-xs">{u.fullName || u.email || u._id}</span>
              <button
                type="button"
                className="btn-ghost p-0.5"
                onClick={() => remove(u._id)}
                title="Remove"
                aria-label="Remove user"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input + inline close */}
      <div className={`relative ${open ? "z-50" : ""}`} onFocus={() => setOpen(true)}>
        <input
          ref={inputRef}
          className="input w-full pr-9" 
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
        />

        {/* Inline close (top-right of input) */}
        {open && (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
            onClick={() => setOpen(false)}
            title="Close"
            aria-label="Close dropdown"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Dropdown */}
        {open && (
          <div className="absolute left-0 right-0 mt-1 rounded-xl border border-border/60 bg-white/95 dark:bg-neutral-900/95 shadow-xl backdrop-blur-md max-h-[60vh] overflow-auto">
            {/* Sticky header with close */}
            <div className="sticky top-0 flex items-center justify-between px-3 py-2 border-b border-border/60 bg-white/95 dark:bg-neutral-900/95">
              <span className="text-xs text-muted">
                {loading ? "Searching…" : "Results"}
              </span>
              <button
                type="button"
                className="btn-ghost p-1"
                onClick={() => setOpen(false)}
                title="Close"
                aria-label="Close dropdown"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!loading && results.length === 0 && (
              <div className="p-3 text-sm text-muted">{emptyState}</div>
            )}

            {!loading &&
              results.map((u) => (
                <button
                  key={u._id}
                  type="button"
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
                  onClick={() => add(u)}
                >
                  <img
                    src={u.profileImage || ""}
                    alt={u.fullName || u.email || u._id}
                    className="h-8 w-8 rounded-full object-cover border border-border/40"
                    onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                  />
                  <div>
                    <div className="text-sm font-medium">{u.fullName || "—"}</div>
                    <div className="text-xs text-muted">{u.email || u._id}</div>
                  </div>
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
