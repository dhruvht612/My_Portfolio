import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
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
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.js'],
      /* The smoke test mounts the whole app shell — providers, router, header, footer —
         under jsdom. That legitimately costs seconds, and a shared CI runner is slower
         than a dev machine, so the 5s default produced flaky timeouts rather than real
         failures. Raised deliberately; a genuinely hung test still fails, just later. */
      testTimeout: 20000,
      hookTimeout: 20000,
      /* Only source is measured. `dist` and the Node-only Supabase scripts would
         otherwise sit in the report at 0% and hide the real numbers. */
      coverage: {
        provider: 'v8',
        reporter: ['text-summary', 'lcov'],
        include: ['src/**/*.{js,jsx}'],
        exclude: ['src/scripts/**', 'src/test/**', 'src/**/*.{test,spec}.{js,jsx}', 'src/main.jsx'],
      },
    },
  }
})
