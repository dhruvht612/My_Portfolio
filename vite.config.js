import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('framer-motion') || id.includes('/motion/')) return 'motion'
          if (
            id.includes('react-markdown') ||
            id.includes('remark-gfm') ||
            id.includes('micromark') ||
            id.includes('mdast') ||
            id.includes('unist')
          ) {
            return 'markdown'
          }
          if (id.includes('react-hook-form') || id.includes('@hookform/resolvers') || id.includes('/zod/')) return 'forms'
          if (id.includes('react-router')) return 'router'
          if (id.includes('react-dom') || id.includes('/react/')) return 'react-core'
        },
      },
    },
  },
})
