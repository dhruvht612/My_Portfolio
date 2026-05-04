import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const onVercel = process.env.VERCEL === '1'
  if (onVercel && mode === 'production') {
    const url = (env.VITE_SUPABASE_URL || '').trim()
    const key = (env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim()
    if (!url || !key) {
      throw new Error(
        '[vite] Missing Supabase env on Vercel: add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY ' +
          '(or VITE_SUPABASE_PUBLISHABLE_KEY) under Project → Settings → Environment Variables for Production, then redeploy.'
      )
    }
  }

  return {
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
  }
})
