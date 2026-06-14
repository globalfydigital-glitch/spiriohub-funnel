import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0d0b14',
        card: '#1a1626',
        cardborder: '#2c2640',
        gold: '#f5c451',
        violet: '#8b5cf6',
        muted: '#9b93b5',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: { fadeUp: 'fadeUp 0.35s ease-out' },
    },
  },
  plugins: [],
} satisfies Config
