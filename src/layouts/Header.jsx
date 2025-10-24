import React, { useEffect, useRef, useState } from "react";
import {
  MdMenu,
  MdSearch,
  MdSettings,
  MdNotificationsNone,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import SearchBar from "./components/SearchBar";
import BrandLogo from "./components/BrandLogo";

export default function Header({
  title = "Admin",
  logoSrc,
  avatarSrc,
  notifications = 0,
  notificationItems = null,
  onMenuClick,
  onSettingsClick,
  onProfileClick,
  onSearch,
  getSearchSuggestions,
  dims = "",
}) {
  const [openMobileSearch, setOpenMobileSearch] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  function handleSubmit(term) {
    onSearch?.(term);
    navigate(`/search?q=${encodeURIComponent(term)}`);
  }

  async function defaultSuggestions(term) {
    const t = term.trim();
    if (!t) return [];
    return [
      {
        id: "users",
        label: `Users matching "${t}"`,
        sublabel: "Go to Users",
        onSelect: () => navigate(`/users?q=${encodeURIComponent(t)}`),
      },
      {
        id: "plans",
        label: `Plans matching "${t}"`,
        sublabel: "Go to Plans",
        onSelect: () => navigate(`/plans?q=${encodeURIComponent(t)}`),
      },
    ];
  }
  const provideSuggestions = getSearchSuggestions || defaultSuggestions;

  useEffect(() => {
    function onKey(e) {
      const isCmdK = e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey);
      if (isCmdK) {
        e.preventDefault();
        if (window.matchMedia("(max-width: 767px)").matches) {
          setOpenMobileSearch(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        } else {
          inputRef.current?.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function goSettings() {
    onSettingsClick?.();
    navigate("/settings");
  }

  return (
    <header className="sticky top-0 z-30 w-full mb-2.5 md:mb-4">
      <div className="glass h-16 w-full max-w-full flex items-center gap-3 px-3 sm:px-5 relative">
        {/* Left */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            className="lg:hidden -ml-1 p-2 rounded-md hover:bg-primary/10"
            onClick={onMenuClick}
            aria-label="Open sidebar"
          >
            <MdMenu className="h-5 w-5 text-muted" />
          </button>

          {/* 🔥 Brand (logo + name) */}
          <BrandLogo
            src={logoSrc}
            name="Admin"
            to="/"
            className={`${dims} object-contain dark:invert dark:brightness-110`}
            size="md"
          />

          <div className="hidden sm:flex items-center gap-2">
            <div className="text-sm text-muted">Welcome back,</div>
            <div className="text-sm font-semibold">{title}</div>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex items-center flex-1">
            <SearchBar
              ref={inputRef}
              placeholder="Search users, subscribers, orders, posts…"
              onSubmit={handleSubmit}
              getSuggestions={provideSuggestions}
              className="w-full max-w-6xl"
              usePortal={true} // desktop: portal for perfect layering
            />
          </div>
        </div>

        {/* Right */}
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setOpenMobileSearch((v) => !v)}
            className="p-2.5 rounded-full hover:bg-primary/10 md:hidden"
            aria-label="Search"
            aria-expanded={openMobileSearch}
          >
            <MdSearch className="h-5 w-5 text-muted" />
          </button>

          {/* Notifications */}
          <button
            type="button"
            onClick={() => navigate("/notifications")}
            className="relative p-2.5 rounded-full hover:bg-primary/10"
            aria-label="Notifications"
            title="Notifications"
          >
            <MdNotificationsNone className="h-5 w-5 text-muted" />
          </button>

          <button
            type="button"
            onClick={goSettings}
            className="p-2.5 rounded-full hover:bg-primary/10"
            aria-label="Settings"
          >
            <MdSettings className="h-5 w-5 text-muted" />
          </button>
          

          <button
            onClick={onProfileClick}
            className="shrink-0 rounded-full overflow-hidden h-9 w-9 border border-border"
          >
            <img
              src={avatarSrc || logoSrc}
              alt="User avatar"
              className="h-full w-full object-cover"
              onError={(e) => {
                if (logoSrc && e.currentTarget.src !== logoSrc)
                  e.currentTarget.src = logoSrc;
              }}
            />
          </button>
        </div>

        {/* Mobile search overlay */}
        {openMobileSearch && (
          <div className="absolute left-0 right-0 top-full sm:hidden px-3 pb-3">
            <div className="glass p-2">
              <SearchBar
                ref={inputRef}
                placeholder="Search users, subscribers, orders, posts…"
                onSubmit={handleSubmit}
                onAfterSubmit={() => setOpenMobileSearch(false)}
                getSuggestions={provideSuggestions}
                compact
                autoFocus
                usePortal={false} // mobile: keep inside overlay
              />
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  className="btn-ghost h-10"
                  onClick={() => setOpenMobileSearch(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
