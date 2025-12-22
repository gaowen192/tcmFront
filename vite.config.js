import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths for assets
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Real API server address
        //target: 'http://95.40.33.105:8080', // Real API server address
        changeOrigin: true,
        secure: false,
        // Forward requests to the real API server
      },
    },
  },
})
