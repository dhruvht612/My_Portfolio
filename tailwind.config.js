/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        'royal-blue': '#4169E1',
        'royal-blue-light': '#5b7cf5',
        'theme-bg': 'var(--color-bg)',
        'theme-bg-elevated': 'var(--color-bg-elevated)',
        'theme-bg-card': 'var(--color-bg-card)',
        'theme-blue': 'var(--color-blue)',
        'theme-accent': 'var(--color-accent)',
        'theme-accent-hover': 'var(--color-accent-hover)',
        'theme-orange': 'var(--color-orange)',
        'theme-orange-hover': 'var(--color-orange-hover)',
        'theme-text': 'var(--color-text)',
        'theme-text-muted': 'var(--color-text-muted)',
      },
      animation: {
        gradient: 'gradient 8s ease infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
}
