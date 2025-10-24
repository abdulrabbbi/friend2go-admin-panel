import React from "react";
import {
  MdDashboard,
  MdPeople,
  MdEventNote,
  MdChat,
  MdSettings,
  MdLogout,
} from "react-icons/md";
import { NavLink } from "react-router-dom";
import BrandLogo from "./components/BrandLogo";

const NAV = [
  { icon: MdDashboard, label: "Dashboard", path: "/" },
  { icon: MdPeople, label: "Users", path: "/users" },
  { icon: MdEventNote, label: "Plan", path: "/plans" },
  { icon: MdChat, label: "Chat", path: "/chat" },
  { icon: MdSettings, label: "Settings", path: "/settings" },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const linkBase =
    "group relative flex items-center gap-3 px-3 py-2 rounded-xl transition nav-item";

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        role="navigation"
        aria-label="Main sidebar"
        className={`fixed lg:static inset-y-0 left-0 z-40 w-[var(--sidebar-w)] bg-bg-soft/60 backdrop-blur-xl border-r border-border transform transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 flex flex-col`}
      >
        <div className="h-16 px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Reserved space where logo used to be */}
            <BrandLogo
              name="Admin"
              to="/"
              size="md"
            />
          </div>
          <button
            className="lg:hidden text-muted"
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <div className="px-5">
          <div className="h-px bg-border" />
        </div>

        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-2">
            {NAV.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? "active" : ""}`
                  }
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto">
          <div className="px-5">
            <div className="h-px bg-border" />
          </div>
          <div className="px-3 py-4">
            <button
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted hover:bg-primary/10 transition"
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.assign("/auth/login");
              }}
            >
              <MdLogout className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
