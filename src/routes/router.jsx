import React, { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute.jsx";
import { PATHS } from "./paths";
import { FullScreenLoading } from "./Loading.jsx";

console.log("[Router] Initializing router...");
console.log("[Router] PATHS:", PATHS);

const Dashboard = lazy(() => import("../modules/dashboard/Dashboard.jsx"));
const UsersList = lazy(() => import("../modules/users/UsersList.jsx"));
const UserDetail = lazy(() => import("../modules/users/UserDetail.jsx"));
const PlansList = lazy(() => import("../modules/plans/PlansList.jsx"));
const SettingsPage = lazy(() => import("../modules/settings/SettingsPage.jsx"));
const Login = lazy(() => import("../modules/auth/Login.jsx"));
const ChatPage = lazy(() => import("../modules/chat/ChatPage.jsx"));
const NotificationsPage = lazy(() =>
  import("../modules/notifications/NotificationsPage.jsx")
);

const router = createBrowserRouter([
  {
    path: PATHS.AUTH_LOGIN,
    element: (
      <Suspense fallback={<FullScreenLoading />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: PATHS.ROOT,
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<FullScreenLoading />}>
            <Dashboard />
          </Suspense>
        ),
      },

      {
        path: PATHS.USERS.slice(1),
        element: (
          <Suspense fallback={<FullScreenLoading />}>
            <UsersList />
          </Suspense>
        ),
      },

      {
        path: PATHS.USER_DETAIL.slice(1),
        element: (
          <Suspense fallback={<FullScreenLoading />}>
            <UserDetail />
          </Suspense>
        ),
      },

      {
        path: PATHS.PLANS.slice(1),
        element: (
          <Suspense fallback={<FullScreenLoading />}>
            <PlansList />
          </Suspense>
        ),
      },
      {
        path: PATHS.CHAT.slice(1),
        element: (
          <Suspense fallback={<FullScreenLoading />}>
            <ChatPage />
          </Suspense>
        ),
      },
      {
        path: PATHS.NOTIFICATIONS.slice(1),
        element: (
          <Suspense fallback={<FullScreenLoading />}>
            <NotificationsPage />
          </Suspense>
        ),
      },
      {
        path: PATHS.SETTINGS.slice(1),
        element: (
          <Suspense fallback={<FullScreenLoading />}>
            <SettingsPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <div className="card p-8">Not Found</div>,
  },
]);

console.log("[Router] Router created successfully");

export default router;
