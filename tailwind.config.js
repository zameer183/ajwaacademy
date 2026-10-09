const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-geist-mono)", ...defaultTheme.fontFamily.mono],
        arabic: ["var(--font-amiri)", "Scheherazade New", "serif"],
      },
      colors: {
        brand: {
          teal: '#0F766E',
          tealHover: '#115E59',
          tealLight: '#0D9488',
          tealDark: '#0B3B36',
          gold: '#C5A253',
          goldHover: '#B48F3F',
          mint: '#DDF4EC',
          softBlue: '#E8F1FA',
          bg: '#F8FAFC',
          text: '#1E293B',
          success: '#15803D',
          error: '#B91C1C',
          // Backward compatibility aliases
          navy: '#0F766E',
          blue: '#115E59',
          hover: '#115E59',
        },
      },
    },
  },
  plugins: [],
};
