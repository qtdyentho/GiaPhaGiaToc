import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: false,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-icons': ['lucide-react'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-xlsx': ['xlsx'], // Tách xlsx riêng — ~400KB, chỉ cần khi import dữ liệu
        },
      },
    },
    chunkSizeWarningLimit: 550,
  },
  // Strip console.log/debug từ production build
  esbuild: mode === 'production'
    ? {
        pure: ['console.log', 'console.debug'],
        drop: ['debugger'],
      }
    : {},
}));

