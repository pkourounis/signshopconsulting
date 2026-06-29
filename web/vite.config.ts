import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base is '/' locally and on Netlify; the GitHub Pages workflow sets
// VITE_BASE='/signshopconsulting/' so asset URLs resolve under the repo subpath.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  build: { outDir: 'dist' },
})
