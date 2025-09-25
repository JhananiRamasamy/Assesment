import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite plugin not strictly necessary; keeping config minimal.
export default defineConfig({
  plugins: [react()],
})
