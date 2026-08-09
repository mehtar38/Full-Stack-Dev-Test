import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: 'https://github.com/mehtar38/Full-Stack-Dev-Test',
  plugins: [react(), tailwindcss()],
})
