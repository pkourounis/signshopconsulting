import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Builds the whole app into ONE self-contained index.html (all JS/CSS inlined),
// so it can be hosted as a claude.ai Artifact with no external requests.
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  build: { outDir: 'dist-single', assetsInlineLimit: 100000000 },
})
