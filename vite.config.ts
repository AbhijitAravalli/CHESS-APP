import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The repository name — GitHub Pages serves a project site under
// https://<user>.github.io/<repo>/, so production assets must be prefixed
// with this path. Local dev (command === 'serve') stays at the root.
const REPO_NAME = 'CHESS-APP'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? `/${REPO_NAME}/` : '/',
  plugins: [react()],
  server: {
    port: 5174,
    open: true,
  },
}))
