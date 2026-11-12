/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Literata"', 'Georgia', 'Cambria', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        hand: ['"Caveat"', 'cursive']
      },
      colors: {
        paper: {
          50: '#faf7f1',
          100: '#f5f0e8',
          200: '#e9e1d3',
          300: '#d9cdb8'
        },
        ink: {
          900: '#1a1714',
          700: '#3a332c',
          500: '#6b5f52',
          300: '#a69789'
        },
        accent: {
          DEFAULT: '#b3543f',
          soft: '#d9a08f',
          deep: '#8a3d2d'
        }
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        }
      },
      animation: {
        'fade-up': 'fade-up 0.35s ease-out both',
        'fade-in': 'fade-in 0.25s ease-out both'
      }
    }
  },
  plugins: []
}
