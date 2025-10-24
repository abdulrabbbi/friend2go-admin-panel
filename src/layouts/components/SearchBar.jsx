import React, {
  forwardRef, useEffect, useLayoutEffect, useMemo,
  useRef, useState
} from "react";
import { createPortal } from "react-dom";
import { MdSearch } from "react-icons/md";

/**
 * Suggestion shape:
 * { id?: string, label: string, sublabel?: string, onSelect?: (s) => void }
 */
const SearchBar = forwardRef(function SearchBar(
  {
    placeholder = "Search…",
    defaultValue = "",
    value,
    onChange,
    onSubmit,               // (term: string) => void
    onAfterSubmit,          // optional (e.g. close mobile overlay)
    getSuggestions,         // async (term) => Suggestion[]
    debounceMs = 200,
    autoFocus = false,
    className = "",
    inputClassName = "",
    buttonClassName = "",
    compact = false,        // mobile styling (no right-hand button)
    usePortal = true,       // <-- important: render dropdown to body
  },
  inputRefFromParent
) {
  const internalInputRef = useRef(null);
  const inputRef = inputRefFromParent || internalInputRef;

  const [q, setQ] = useState(defaultValue);
  const term = value ?? q;

  const wrapRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [suggs, setSuggs] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  // ---- portal positioning ----
  const portalRef = useRef(null);
  const [pos, setPos] = useState({ left: 0, top: 0, width: 0, ready: false });

  function measure() {
    if (!wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    setPos({
      left: r.left,
      top: r.bottom + 6, // gap below input
      width: r.width,
      ready: true,
    });
  }

  // Measure when open or on layout changes
  useLayoutEffect(() => {
    if (!open) return;
    measure();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handlers = [
      ["resize", measure],
      ["scroll", measure, true], // capture scroll from document too
    ];
    handlers.forEach(([t, fn]) => window.addEventListener(t, fn, { passive: true }));
    return () => handlers.forEach(([t, fn]) => window.removeEventListener(t, fn));
  }, [open]);

  // ---- suggestions (debounced) ----
  useEffect(() => {
    if (!getSuggestions) {
      setSuggs([]); setOpen(false); return;
    }
    const t = setTimeout(async () => {
      const t0 = String(term || "").trim();
      if (!t0) { setSuggs([]); setOpen(false); return; }
      try {
        const res = await getSuggestions(t0);
        const items = Array.isArray(res) ? res.slice(0, 8) : [];
        setSuggs(items);
        setOpen(items.length > 0);
        setActiveIndex(items.length ? 0 : -1);
      } catch {
        setSuggs([]); setOpen(false);
      }
    }, debounceMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, getSuggestions, debounceMs]);

  // ---- outside click / ESC (includes portal node) ----
  useEffect(() => {
    function onDocDown(e) {
      if (!open) return;
      const w = wrapRef.current;
      const p = portalRef.current;
      const t = e.target;
      if (w?.contains(t) || p?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // ---- interactions ----
  function submit(e) {
    e?.preventDefault?.();
    const t0 = String(term || "").trim();
    if (!t0) return;
    onSubmit?.(t0);
    setOpen(false);
    onAfterSubmit?.();
  }

  function handleKeyDown(e) {
    if (open && suggs.length) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, suggs.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const s = suggs[activeIndex];
        if (s) return pick(s);
      }
    }
    if (e.key === "Enter") submit(e);
  }

  function pick(s) {
    try {
      if (s.onSelect) s.onSelect(s);
      else onSubmit?.(s.label);
    } finally {
      setOpen(false);
      onAfterSubmit?.();
    }
  }

  const inputPadding = compact ? "pl-10 pr-3 h-11" : "pl-12 pr-36 h-11";

  // ---- dropdown content (shared for portal or inline) ----
  const Dropdown = (
    <div
      ref={usePortal ? portalRef : undefined}
      className="glass border border-border/50 rounded-lg overflow-hidden shadow-xl"
      style={
        usePortal
          ? {
              position: "fixed",
              left: pos.left,
              top: pos.top,
              width: pos.width,
              zIndex: 1000, // above sticky header/cards
              maxHeight: "60vh",
            }
          : { zIndex: 50, maxHeight: "60vh" }
      }
      role="listbox"
      aria-label="Search suggestions"
    >
      <ul className="max-h-[60vh] overflow-auto">
        {suggs.map((s, idx) => (
          <li
            key={s.id ?? s.label ?? idx}
            className={`px-3 py-2 cursor-pointer ${
              idx === activeIndex ? "bg-primary/10" : "hover:bg-primary/5"
            }`}
            onMouseEnter={() => setActiveIndex(idx)}
            onMouseDown={(e) => e.preventDefault()} // don't blur input
            onClick={() => pick(s)}
            role="option"
            aria-selected={idx === activeIndex}
          >
            <div className="text-sm">{s.label}</div>
            {s.sublabel && <div className="text-xs text-muted">{s.sublabel}</div>}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className={`relative ${className}`} ref={wrapRef}>
      <form onSubmit={submit} className="relative">
        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
        <input
          ref={inputRef}
          autoFocus={autoFocus}
          value={value ?? q}
          onChange={(e) => {
            onChange?.(e.target.value);
            if (value === undefined) setQ(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`input ${inputPadding} ${inputClassName}`}
          onFocus={() => suggs.length && setOpen(true)}
        />
        {!compact && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <button type="submit" className={`btn h-10 px-5 ${buttonClassName}`}>Search</button>
          </div>
        )}
      </form>

      {/* Suggestions */}
      {open && suggs.length > 0 && (
        usePortal
          ? (pos.ready ? createPortal(Dropdown, document.body) : null)
          : <div className="absolute z-50 mt-1 w-full">{Dropdown}</div>
      )}
    </div>
  );
});

export default SearchBar;
