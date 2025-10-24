import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ballie_user") || "{}");
    } catch (_) {
      return {};
    }
  });

  useEffect(() => {
    const readUser = () => {
      try {
        const data = JSON.parse(localStorage.getItem("ballie_user") || "{}");
        setUserInfo(data || {});
      } catch (_) {
        // ignore
      }
    };

    const onStorage = (e) => {
      if (!e || e.key === null || e.key === "ballie_user") readUser();
    };
    const onUserUpdated = (e) => {
      if (e?.detail?.user) setUserInfo(e.detail.user);
      else readUser();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("ballie:user-updated", onUserUpdated);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("ballie:user-updated", onUserUpdated);
    };
  }, []);

  return (
    <div
      style={{ ["--sidebar-w"]: "16rem" }}
      className="min-h-screen grid grid-cols-1 lg:grid-cols-[var(--sidebar-w)_1fr] bg-gradient-brand"
    >
      {/* Sidebar */}
      <Sidebar isOpen={open} setIsOpen={setOpen} />

      {/* Main */}
      <main className="p-3 sm:p-4 lg:p-6">
        <Header
          title={userInfo?.displayName || "Admin"}
          avatarSrc={userInfo?.photoURL || undefined}
          notifications={3}
          onMenuClick={() => setOpen(true)}
        />

        <div className="grid gap-5">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
