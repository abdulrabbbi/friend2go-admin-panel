import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="card p-6 text-muted">Loading…</div>;
  if (!user) return <Navigate to="/auth/login" />;
  return children;
}

