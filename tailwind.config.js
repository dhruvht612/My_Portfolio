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
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        skeleton: 'var(--skeleton)',
        border: 'var(--btn-border)',
        input: 'var(--input)',
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
        ripple: 'ripple 2s ease calc(var(--i, 0) * 0.2s) infinite',
        orbit: 'orbit calc(var(--duration) * 1s) linear infinite',
      },
      boxShadow: {
        input: [
          '0px 2px 3px -1px rgba(0, 0, 0, 0.1)',
          '0px 1px 0px 0px rgba(25, 28, 33, 0.02)',
          '0px 0px 0px 1px rgba(25, 28, 33, 0.08)',
        ].join(', '),
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
        ripple: {
          '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)' },
          '50%': { transform: 'translate(-50%, -50%) scale(0.9)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateY(calc(var(--radius) * 1px)) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateY(calc(var(--radius) * 1px)) rotate(-360deg)' },
        },
      },
    },
  },
  plugins: [],
}
