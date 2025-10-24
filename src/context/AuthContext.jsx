import React, { useEffect, useState } from "react";
import { auth, onAuthStateChanged, signOut } from "../lib/firebase";
import { AuthContext } from "./AuthContextCreator";

// Re-export AuthContext so other modules can import from ./AuthContext
export { AuthContext };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe;

    // Check if auth is available
    if (!auth) {
      console.error("[AuthContext] Firebase auth is not initialized");
      setError(new Error("Firebase authentication is not available"));
      setLoading(false);
      return;
    }

    try {
      console.log("[AuthContext] Setting up auth state listener...");
      unsubscribe = onAuthStateChanged(
        auth,
        (u) => {
          console.log(
            "[AuthContext] Auth state changed:",
            u ? "User logged in" : "User logged out"
          );
          setUser(u);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error("[AuthContext] Auth state change error:", err);
          setError(err);
          setLoading(false);
        }
      );
      console.log("[AuthContext] Auth state listener set up successfully");
    } catch (err) {
      console.error("[AuthContext] Auth initialization error:", err);
      setError(err);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        console.log("[AuthContext] Cleaning up auth state listener");
        unsubscribe();
      }
    };
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      sessionStorage.clear();
    } catch (err) {
      console.error("Logout error:", err);
      setError(err);
    }
  };

  // Show loading screen while initializing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error if authentication failed to initialize
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="max-w-md mx-auto text-center p-6">
          <div className="text-6xl text-red-500 mb-4">🔥</div>
          <h2 className="text-2xl font-bold text-red-800 mb-4">
            Authentication Error
          </h2>
          <p className="text-red-600 mb-6">
            Unable to initialize authentication. Please check your internet
            connection and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}
