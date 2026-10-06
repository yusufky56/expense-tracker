import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the build works on GitHub Pages under /expense-tracker/
  base: './',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 700, // recharts is most of the bundle
  },
})
