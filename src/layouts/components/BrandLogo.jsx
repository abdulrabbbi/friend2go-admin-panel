import React from "react";
import { useNavigate } from "react-router-dom";

// If you already re-export from ../assets, pass via props instead.
// Importing directly here is fine too:
import { AppLogo as brandLogo } from "../../assets";

/**
 * BrandLogo
 * - Shows a theme-matched pill behind the logo + (optional) brand name.
 * - Click navigates home by default.
 */
export default function BrandLogo({
  src = brandLogo, // string URL for <img>. If you use SVGR, pass the component instead and render it inside.
  name = "Dashboard",
  onClick, // optional override
  to = "/", // where to go when clicked
  showName = true,
  size = "md", // "sm" | "md" | "lg"
}) {
  const navigate = useNavigate();

  const dims =
    size === "lg" ? "h-10 w-10" : size === "sm" ? "h-7 w-7" : "h-8 w-8";

  function handleClick() {
    if (onClick) onClick();
    else navigate(to);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="
        group inline-flex items-center gap-2
        rounded-xl p-1 pr-2
        ring-1 ring-border/50
        bg-gradient-to-br from-primary/20 via-primary/10 to-transparent
        dark:from-primary/25 dark:via-primary/10
        hover:ring-primary/60 hover:from-primary/30
        transition-colors
      "
      aria-label="Go to home"
    >
      <span
        className={`
          ${dims} rounded-lg overflow-hidden
          flex items-center justify-center
          bg-black/5 dark:bg-white/5
          ring-1 ring-border/40
        `}
      >
        <img
          src={src}
          alt={name}
          className={`
            ${dims} object-contain
            dark:invert
            dark:brightness-110
          `}
          draggable={false}
        />
      </span>

      {showName && (
        <span className="hidden sm:block font-semibold tracking-wide text-sm">
          {name}
        </span>
      )}
    </button>
  );
}
