import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.WEB_PORT ? parseInt(process.env.WEB_PORT) : 3003,
    host: true
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:3001/api')
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})

