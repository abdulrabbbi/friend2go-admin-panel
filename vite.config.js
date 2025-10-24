import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        // Completely suppress "use client" directive warnings
        if (
          warning.code === "MODULE_LEVEL_DIRECTIVE" ||
          (warning.message &&
            (warning.message.includes(
              "Module level directives cause errors when bundled"
            ) ||
              warning.message.includes('"use client"') ||
              warning.message.includes("use client")))
        ) {
          // Don't log these warnings at all
          return;
        }

        // Log all other warnings normally
        defaultHandler(warning);
      },
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
          "vendor-router": ["react-router-dom"],
          "vendor-ui": ["react-hot-toast", "lucide-react", "react-icons"],
          "vendor-charts": ["recharts"],
          "vendor-firebase": ["firebase"],
        },
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
  },
});
