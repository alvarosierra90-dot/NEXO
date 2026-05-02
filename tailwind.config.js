/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4fa',
          100: '#dde6f1',
          200: '#b5c8df',
          300: '#7d9ac0',
          400: '#4d72a3',
          500: '#2b5286',
          600: '#1d3d6e',
          700: '#142d56',
          800: '#0c2042',
          900: '#061533',
          950: '#030b21',
        },
        gold: {
          50: '#fffbe8',
          100: '#fff5c4',
          200: '#ffe98a',
          300: '#ffdb47',
          400: '#ffcc1a',
          500: '#f5b800',
          600: '#d49600',
          700: '#a86d00',
          800: '#7a4d00',
          900: '#5c3a00',
        },
        sand: {
          50: '#fbf8f1',
          100: '#f5efde',
          200: '#ebe0c0',
          300: '#d8c490',
          400: '#bfa365',
          500: '#a48648',
        },
      },
      fontFamily: {
        display: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'system-ui', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
    },
  },
  plugins: [],
};
