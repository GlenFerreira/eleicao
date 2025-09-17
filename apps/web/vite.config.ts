import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3003,
    host: true
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'https://preview-5pug.onrender.com/api'),
    'import.meta.env.VITE_WEB_URL': JSON.stringify(process.env.VITE_WEB_URL || 'https://surv-rkzx.onrender.com')
  },
  resolve: {
    alias: {
      '@': path.resolve('./src')
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
  },
  publicDir: 'public'
})

