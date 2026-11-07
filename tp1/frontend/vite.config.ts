import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // In dev, /api/... is forwarded to the FastAPI server, so the frontend always calls "/api" (like on Vercel).
  server: { port: 5173, proxy: { '/api': 'http://localhost:8000' } },
})
