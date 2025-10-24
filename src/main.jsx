import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ErrorBoundary from "./ErrorBoundary.jsx";
import "./index.css";
import App from "./App.jsx";
import { debug } from "./utils/debug.js";

debug.info("Application starting...");

// Add error handler for uncaught errors
window.addEventListener("error", (event) => {
  debug.error("Global error caught:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  debug.error("Unhandled promise rejection:", event.reason);
});

// Check if root element exists
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error(
    "Root element not found. Make sure you have a <div id='root'></div> in your HTML."
  );
}

try {
  debug.info("Creating root and rendering app...");
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
  debug.info("App rendered successfully");
} catch (error) {
  debug.error("Failed to render app:", error);

  // Fallback rendering
  rootElement.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui;">
      <div style="text-align: center; max-width: 400px; padding: 20px;">
        <h1 style="color: #dc2626; margin-bottom: 16px;">Application Error</h1>
        <p style="color: #6b7280; margin-bottom: 20px;">
          The application failed to start. Please check the console for more details.
        </p>
        <button onclick="window.location.reload()" 
                style="background: #3b82f6; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer;">
          Reload Page
        </button>
      </div>
    </div>
  `;
}
