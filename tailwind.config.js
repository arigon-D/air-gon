/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        hitmarker: {
          '0%': { transform: 'translate(-50%, -50%) scale(0.5)', opacity: '1' },
          '100%': { transform: 'translate(-50%, -50%) scale(1.5)', opacity: '0' }
        }
      },
      animation: {
        'hitmarker': 'hitmarker 100ms ease-out forwards'
      }
    },
  },
  plugins: [],
} 