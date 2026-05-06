import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(fileURLToPath(new URL('./src', import.meta.url))),
      '@components': path.resolve(fileURLToPath(new URL('./src/components', import.meta.url))),
      '@pages': path.resolve(fileURLToPath(new URL('./src/pages', import.meta.url))),
      '@hooks': path.resolve(fileURLToPath(new URL('./src/hooks', import.meta.url))),
      '@services': path.resolve(fileURLToPath(new URL('./src/services', import.meta.url))),
      '@store': path.resolve(fileURLToPath(new URL('./src/store', import.meta.url))),
      '@theme': path.resolve(fileURLToPath(new URL('./src/theme', import.meta.url))),
      '@types': path.resolve(fileURLToPath(new URL('./src/types', import.meta.url))),
      '@utils': path.resolve(fileURLToPath(new URL('./src/utils', import.meta.url))),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          query: ['@tanstack/react-query', 'axios', 'zustand'],
        },
      },
    },
  },
  esbuild: {
    // Strip console.* and debugger statements from production bundles so
    // we don't leak email/path info or noise the browser console.
    drop: ['console', 'debugger'],
  },
})
