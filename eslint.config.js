import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    /* Only `jsx-uses-vars` is taken from eslint-plugin-react, not its recommended set.
       Without it nothing marks an identifier used solely inside JSX as used, so
       `no-unused-vars` reported 94 false positives for `motion` alone (used as
       <motion.div>) and the components worked around it by aliasing to a capitalised
       name that varsIgnorePattern happened to skip. */
    plugins: { react },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'react/jsx-uses-vars': 'error',
      /* argsIgnorePattern is separate from varsIgnorePattern and does not inherit it —
         without it, capitalised parameters such as a destructured `Icon` component
         prop were reported even though the same name as a variable was skipped. */
      'no-unused-vars': [
        'error',
        { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_|^[A-Z]' },
      ],
    },
  },
  /* Context modules deliberately export a provider alongside its consumer hook.
     react-refresh only wants components exported from a module, which would mean
     splitting every context in two for a fast-refresh nicety. Kept visible as a
     warning rather than restructuring working code. */
  {
    files: ['src/context/**/*.{js,jsx}', 'src/hooks/**/*.{js,jsx}', 'src/components/ui/**/*.{js,jsx}'],
    rules: { 'react-refresh/only-export-components': 'warn' },
  },
  /* Pre-existing findings in working code, kept visible rather than silenced.
     `purity` flags Date.now()/Math.random() read during render (elapsed-time labels
     and an animation delay); `set-state-in-effect` flags deliberate state machines —
     the Landing typing effect, prop->state sync in useActiveSection, and the async
     Supabase session bootstrap in useAuth. Each needs a considered refactor, not a
     lint-driven one, so CI pins the warning count instead (see `npm run lint:ci`):
     the existing ones cannot multiply and new code cannot add more. */
  {
    files: ['src/**/*.{js,jsx}'],
    rules: {
      'react-hooks/purity': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  /* Node-run files: build config, lint config, and the Supabase seed/verify scripts. */
  {
    files: ['*.config.js', 'src/scripts/**/*.{js,mjs,cjs}'],
    languageOptions: { globals: globals.node },
  },
  /* Vitest supplies describe/it/expect as globals (see `test.globals` in vite.config.js). */
  {
    files: ['**/*.{test,spec}.{js,jsx}', 'src/test/**/*.{js,jsx}'],
    languageOptions: { globals: { ...globals.node, ...globals.vitest } },
  },
])
