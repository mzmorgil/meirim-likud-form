import { defineConfig } from "vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    sourcemap: true, // Source map generation must be turned on
    chunkSizeWarningLimit: 10000, // Increa§se chunk size warning limit
  },
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    mode !== 'development' && sentryVitePlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: "55b30fd4159e",
      project: "meirim-likud-form",
      telemetry: false
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
