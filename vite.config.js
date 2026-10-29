import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' يجعل المشروع يعمل على GitHub Pages داخل أي مسار فرعي (اسم المستودع)
export default defineConfig({
  plugins: [react()],
  base: './',
})
