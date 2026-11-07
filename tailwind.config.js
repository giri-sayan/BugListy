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
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        canvas: {
          light: '#fafafa',
          dark: '#141415',
          DEFAULT: '#141415'
        },
        sidebar: {
          light: '#ffffff',
          dark: '#0f0f10',
          DEFAULT: '#0f0f10'
        },
        surface: {
          card: {
            light: '#ffffff',
            dark: '#19191b',
            DEFAULT: '#19191b'
          },
          raised: {
            light: '#f4f4f5',
            dark: '#232325',
            DEFAULT: '#232325'
          },
          inset: {
            light: '#f1f1f2',
            dark: '#111113',
            DEFAULT: '#111113'
          },
          border: {
            light: 'rgba(23, 23, 23, 0.08)',
            dark: 'rgba(237, 237, 237, 0.08)',
            DEFAULT: 'rgba(237, 237, 237, 0.08)'
          }
        },
        ink: {
          primary: {
            light: '#171717',
            dark: '#ededed',
            DEFAULT: '#ededed'
          },
          secondary: {
            light: '#525252',
            dark: '#a1a1a6',
            DEFAULT: '#a1a1a6'
          },
          muted: {
            light: '#737373',
            dark: '#85858b',
            DEFAULT: '#85858b'
          }
        },
        accent: {
          DEFAULT: '#10b981',
          hover: '#059669',
          subtle: 'rgba(16, 185, 129, 0.12)',
          dark: '#059669'
        },
        semantic: {
          positive: {
            light: '#16a34a',
            dark: '#4cc38a'
          },
          negative: {
            light: '#dc2626',
            dark: '#e5484d'
          },
          warning: {
            light: '#d97706',
            dark: '#f59e0b'
          },
          info: {
            light: '#2563eb',
            dark: '#3b82f6'
          }
        }
      },
      transitionTimingFunction: {
        'unslop': 'cubic-bezier(0.22, 1, 0.36, 1)',
      }
    },
  },
  plugins: [],
}
