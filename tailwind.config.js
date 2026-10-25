/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Proxima Nova"', '"DM Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"SF Mono"', '"JetBrains Mono"', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        canvas: {
          light: '#f8fafc',
          dark: '#07090e',
          DEFAULT: '#07090e'
        },
        sidebar: {
          light: '#ffffff',
          dark: '#0b0e17',
          DEFAULT: '#0b0e17'
        },
        surface: {
          light: '#ffffff',
          DEFAULT: '#101522',
          elevated: '#151c2c',
          hover: '#1a2336',
          inset: '#05070b',
          border: '#1e2638'
        },
        priority: {
          blue: '#2684FF',
          red: '#FF5630',
          amber: '#FFAB00',
          green: '#36B37E',
          purple: '#6554C0'
        },
        accent: {
          mint: '#10B981',
          violet: '#6366F1',
          cyan: '#06B6D4',
          gold: '#FFB800',
          chrome: '#38BDF8',
          apple: '#818CF8',
          play: '#34D399'
        }
      }
    },
  },
  plugins: [],
}
