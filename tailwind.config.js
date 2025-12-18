/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tcm: {
          100: '#fcfbf7',
          200: '#f6f1e3',
          300: '#e9e1cb',
          400: '#d4c6a4',
          500: '#bfa872',
          600: '#a38b52',
          700: '#826d3e',
          800: '#6a5734',
          900: '#56482c',
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    }
  }
}