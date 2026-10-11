import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Permite execução estática local e publicação no GitHub Pages
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/\/node_modules\/(?:react|react-dom|scheduler)\//.test(id) || id.includes('commonjsHelpers')) return 'vendor-react';
          if (/\/node_modules\/(?:chart.js|react-chartjs-2)\//.test(id)) return 'vendor-charts';
          if (id.includes('/node_modules/lucide-react/')) return 'vendor-icons';
        }
      }
    }
  }
})
