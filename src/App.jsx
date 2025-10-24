import React from "react";
import { RouterProvider } from "react-router-dom";
import router from "./routes/router.jsx";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext.jsx";
import { debug } from "./utils/debug.js";

export default function App() {
  debug.info('App component rendering...');
  
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </AuthProvider>
  );
}
