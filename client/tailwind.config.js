/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        xp: {
          blue: '#0055EA',
          'blue-dark': '#10389C',
          'blue-light': '#2A7FFF',
          'blue-bar': 'linear-gradient(180deg, #0058EE 0%, #3593FF 4%, #288EFF 18%, #006BF6 27%, #0058EE 100%)',
          silver: '#ECE9D8',
          'silver-dark': '#D4D0C8',
          'green-btn': '#388E3C',
          'green-glow': '#4CAF50',
          'red-close': '#E81123',
          'red-hover': '#F34235',
        },
        aero: {
          glass: 'rgba(255, 255, 255, 0.72)',
          'glass-dark': 'rgba(15, 23, 42, 0.65)',
          border: 'rgba(255, 255, 255, 0.6)',
          accent: '#00A2FF'
        }
      },
      boxShadow: {
        'xp-window': '0 16px 40px -8px rgba(0, 30, 80, 0.35), 0 0 0 1px rgba(0, 40, 120, 0.4)',
        'xp-btn': 'inset 0 1px 0 rgba(255,255,255,0.7), 0 2px 4px rgba(0,0,0,0.2)',
        'xp-btn-active': 'inset 0 2px 4px rgba(0,0,0,0.3)',
        'aero-card': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
      },
      fontFamily: {
        xp: ['"Segoe UI"', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
