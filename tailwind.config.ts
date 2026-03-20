import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        toyota: {
          red: '#EB0A1E',
          'red-dark': '#C00015',
          black: '#111111',
          surface: '#F4F4F4',
          muted: '#888888',
          'muted-2': '#555555',
        },
      },
fontFamily: {
  sans: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
  mono: ['Courier New', 'monospace'],
},
      borderRadius: { toyota: '6px', 'toyota-lg': '10px' },
    },
  },
  plugins: [],
}
export default config
