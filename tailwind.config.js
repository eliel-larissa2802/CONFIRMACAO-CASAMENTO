/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        olive: {
          50:  '#f4f7ee',
          100: '#e5ecd6',
          200: '#ccdaae',
          300: '#aec07d',
          400: '#8fa454',
          500: '#6b8038',
          600: '#4e6228',
          700: '#3d4e1f',
          800: '#2d3a17',
          900: '#1e2710',
        },
        gold: {
          100: '#fdf8e8',
          200: '#f9edbf',
          300: '#f2d97a',
          400: '#e8c040',
          500: '#c9960a',
          600: '#a07208',
        },
        cream: '#faf8f3',
      },
      fontFamily: {
        script: ['"Great Vibes"', 'cursive'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
