/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: { 900: '#050507', 800: '#0a0a0c', 700: '#121216' },
        accent: { blue: '#22d3ee', violet: '#a855f7', pink: '#f472b6', orange: '#fb923c' },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #22d3ee 0%, #a855f7 40%, #f472b6 70%, #fb923c 100%)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-space)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
