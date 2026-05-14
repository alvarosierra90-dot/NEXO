/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Editorial palette (pitch-inspired). Names kept as navy/gold/sand
        // to preserve the 754 existing class usages — only hex values shifted.
        // navy = ink / neutral darks (was deep blue)
        navy: {
          50: '#fafafa',
          100: '#f4f4f4',
          200: '#e8e8e8',
          300: '#d4d4d4',
          400: '#a8a8a8',
          500: '#7a7a7a',
          600: '#555555',
          700: '#2a2a2a',
          800: '#1a1a1a',
          900: '#0f0f0f',
          950: '#0a0a0a',
        },
        // gold = bronze (was yellow gold)
        gold: {
          50: '#faf6ee',
          100: '#f5efe5',
          200: '#ead9bc',
          300: '#d4b88a',
          400: '#c5a374',
          500: '#b08d57',
          600: '#8a6d40',
          700: '#6b5430',
          800: '#4d3c22',
          900: '#2e2415',
        },
        // sand = warm bronze-pale neutrals (was warm beige; tightened toward bronze)
        sand: {
          50: '#faf6ed',
          100: '#f5efe5',
          200: '#ead9bc',
          300: '#d4b88a',
          400: '#b08d57',
          500: '#8a6d40',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
    },
  },
  plugins: [],
};
