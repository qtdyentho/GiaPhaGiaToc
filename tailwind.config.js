/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        heritage: {
          green: '#166534',       // Primary: Living Green / Archival
          'green-light': '#1e7b41',
          'green-dark': '#114b27',
          navy: '#1E3A5F',        // Secondary: Archival Navy
          'navy-light': '#2a4d7c',
          'navy-dark': '#142740',
          gold: '#C49A3A',        // Accent: Warm Gold / Heritage
          'gold-light': '#d4b05a',
          'gold-dark': '#a68028',
          bg: '#F7F8F5',          // Warm Papyrus Tone
          surface: '#FFFFFF',
          border: '#E2E8F0',
          muted: '#64748B',
          danger: '#DC2626',
          success: '#16A34A',
          warning: '#D97706',
        }
      },
      fontFamily: {
        sans: ['var(--font-ui)', '"Be Vietnam Pro"', 'sans-serif'],
        ui: ['var(--font-ui)', '"Be Vietnam Pro"', 'sans-serif'],
        heritage: ['var(--font-heritage)', '"Noto Serif"', 'serif'],
      },
      boxShadow: {
        'heritage': '0 4px 20px -2px rgba(22, 101, 52, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'heritage-hover': '0 10px 25px -3px rgba(22, 101, 52, 0.12), 0 4px 10px -2px rgba(0, 0, 0, 0.06)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [],
}
