/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: '#0b0d10',
        card: '#0f1720',
        accent: '#7cf7f0',
        highlight: '#ffc857'
      },
      boxShadow: { glow: '0 0 20px rgba(124, 247, 240, 0.35)' }
    }
  },
  plugins: []
};

