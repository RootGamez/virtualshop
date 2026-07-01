import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
  build: {
    // Catálogo mobile-first: mantener bundles chicos, separar vendor pesado.
    rollupOptions: {
      output: {
        manualChunks: {
          motion: ['motion'],
          carousel: ['embla-carousel-react'],
        },
      },
    },
  },
});
