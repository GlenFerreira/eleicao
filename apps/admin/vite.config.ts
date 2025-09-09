import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    host: true
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:3001/api'),
    'import.meta.env.VITE_WEB_URL': JSON.stringify(process.env.VITE_WEB_URL || 'http://localhost:3003')
  },
  resolve: {
    alias: {
      '@': path.resolve('./src')
    }
  }
})
