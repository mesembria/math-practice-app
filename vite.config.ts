import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// Determine if we should use the subpath in the build
const basePath = process.env.BASE_PATH || '';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  base: basePath, // This will prefix all asset URLs
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  },  
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    exclude: [...configDefaults.exclude, 'e2e/*'],
    css: true
  }
})