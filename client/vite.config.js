import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'terser',
    sourcemap: false,
    chunkSizeWarningLimit: 1500, // Increased to account for three.js (1.1MB)
    cssCodeSplit: true,
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production only
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-core': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'animations': ['framer-motion'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'socket': ['socket.io-client'],
          'ui-utils': ['axios', 'react-hot-toast', 'lucide-react']
        }
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',  // was 5001
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false
      },
      '/socket.io': {
        target: 'http://localhost:5001',  // was 5001
        changeOrigin: true,
        ws: true
      }
    }
  }
})
