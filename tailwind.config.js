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
        'float-slow': 'float 20s ease-in-out infinite',
        'float-slower': 'float 28s ease-in-out infinite',
        'float-reverse': 'float 24s ease-in-out infinite reverse',
        twinkle: 'twinkle 3s ease-in-out infinite',
        'shooting-star': 'shooting-star 2s ease-out forwards',
        'hero-reveal': 'hero-reveal 0.5s ease-out forwards',
      },
      keyframes: {
        'hero-reveal': {
          '0%': { transform: 'translateY(14px)' },
          '100%': { transform: 'translateY(0)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(5%, -8%) scale(1.05)' },
          '50%': { transform: 'translate(-5%, 5%) scale(0.95)' },
          '75%': { transform: 'translate(8%, 3%) scale(1.02)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.25' },
          '50%': { opacity: '0.9' },
        },
        'shooting-star': {
          '0%': { transform: 'translate(-100px, -100px) rotate(-45deg) scale(0); opacity: 0' },
          '5%': { opacity: '1' },
          '90%': { opacity: '0.9' },
          '100%': { transform: 'translate(120vw, 120vh) rotate(-45deg) scale(1); opacity: 0' },
        },
      },
    },
  },
  plugins: [],
}
