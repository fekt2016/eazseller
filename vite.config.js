import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Must match backend dev CORS allowlist for seller:
    // http://localhost:5175
    port: 5175,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React — always needed
          'vendor-react': [
            'react',
            'react-dom',
            'react-router-dom',
          ],
          // Data fetching
          'vendor-query': [
            '@tanstack/react-query',
            'axios',
          ],
          // Styling
          'vendor-styled': [
            'styled-components',
          ],
          // Animation — heavy, rarely needed at load
          'vendor-motion': [
            'framer-motion',
          ],
          // Icons — large, loaded everywhere but
          // separating allows better caching
          'react-icons': [
            'react-icons',
          ],
        },
      },
    },
  },
});
