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
    'import.meta.env.VITE_API_URL': JSON.stringify('https://preview-5pug.onrender.com/api')
  },
  resolve: {
    alias: {
      '@': path.resolve('./src')
    }
  }
})

