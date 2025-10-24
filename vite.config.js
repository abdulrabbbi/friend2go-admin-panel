import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1000, // Increase chunk size warning limit
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress "Module level directives cause errors when bundled" warnings
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
          return;
        }
        warn(warning);
      },
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          "react-vendor": ["react", "react-dom"],
          router: ["react-router-dom"],
          "ui-vendor": ["react-hot-toast", "lucide-react", "react-icons"],
          "chart-vendor": ["recharts"],
          "firebase-vendor": ["firebase"],
        },
      },
    },
  },
});
