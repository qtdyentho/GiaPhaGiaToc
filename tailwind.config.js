/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ─── Semantic Heritage Palette via RGB CSS Variables ────────────────
        heritage: {
          green: 'rgb(var(--color-primary) / <alpha-value>)',
          'green-hover': 'rgb(var(--color-primary-hover) / <alpha-value>)',
          'green-light': 'rgb(var(--color-primary-hover) / <alpha-value>)',
          'green-dark': 'rgb(var(--color-primary-hover) / <alpha-value>)',
          
          navy: 'rgb(var(--color-secondary) / <alpha-value>)',
          'navy-hover': 'rgb(var(--color-secondary-hover) / <alpha-value>)',
          'navy-light': 'rgb(var(--color-secondary-hover) / <alpha-value>)',
          'navy-dark': 'rgb(var(--color-secondary-hover) / <alpha-value>)',

          gold: 'rgb(var(--color-accent) / <alpha-value>)',
          'gold-hover': 'rgb(var(--color-accent-hover) / <alpha-value>)',
          'gold-light': 'rgb(var(--color-accent-hover) / <alpha-value>)',
          'gold-dark': 'rgb(var(--color-accent-hover) / <alpha-value>)',

          bg: 'rgb(var(--color-bg-page) / <alpha-value>)',
          surface: 'rgb(var(--color-bg-surface) / <alpha-value>)',
          'surface-subtle': 'rgb(var(--color-bg-surface-subtle) / <alpha-value>)',
          border: 'rgb(var(--color-border) / <alpha-value>)',
          'border-subtle': 'rgb(var(--color-border-subtle) / <alpha-value>)',

          text: 'rgb(var(--color-text-primary) / <alpha-value>)',
          'text-secondary': 'rgb(var(--color-text-secondary) / <alpha-value>)',
          muted: 'rgb(var(--color-text-muted) / <alpha-value>)',

          danger: 'rgb(var(--color-danger) / <alpha-value>)',
          success: 'rgb(var(--color-success) / <alpha-value>)',
          warning: 'rgb(var(--color-warning) / <alpha-value>)',

          // Explicit dark mode shortcuts
          'dark-bg': '#0F172A',
          'dark-surface': '#1E293B',
          'dark-border': '#334155',
          'dark-muted': '#94A3B8',
        }
      },
      fontFamily: {
        sans: ['var(--font-ui)', '"Be Vietnam Pro"', 'sans-serif'],
        ui: ['var(--font-ui)', '"Be Vietnam Pro"', 'sans-serif'],
        heritage: ['var(--font-heritage)', '"Lora"', '"Noto Serif"', 'serif'],
        serif: ['var(--font-heritage)', '"Lora"', '"Noto Serif"', 'serif'],
        mono: ['var(--font-ui)', '"Be Vietnam Pro"', 'sans-serif'],
      },
      spacing: {
        'component-xs': 'var(--space-1)',
        'component-sm': 'var(--space-2)',
        'component-md': 'var(--space-4)',
        'component-lg': 'var(--space-6)',
        'section': 'var(--space-16)',
      },
      boxShadow: {
        'heritage': 'var(--shadow-heritage)',
        'heritage-hover': 'var(--shadow-heritage-hover)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [],
}
