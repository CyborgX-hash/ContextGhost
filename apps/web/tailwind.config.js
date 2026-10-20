/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ghost: {
          bg: '#0b0f19',
          card: '#121826',
          sidebar: '#090d16',
          surface: '#151c2e',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-subtle': 'rgba(255, 255, 255, 0.05)',
          accent: '#2563eb', // electric blue
          'accent-glow': 'rgba(37, 99, 235, 0.2)',
          blue: '#3b82f6',
          cyan: '#38bdf8',
          emerald: '#10b981',
          rose: '#f43f5e',
          amber: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'monospace']
      }
    },
  },
  plugins: [],
}
