/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'Consolas', 'Monaco', 'monospace'],
      },
      colors: {
        // VS Dark (default)
        'vs-bg':       '#0c0d10',
        'vs-surface':  '#1e1e1e',
        'vs-panel':    '#252526',
        'vs-activity': '#333333',
        'vs-border':   '#2b2b2b',
        'vs-text':     '#cccccc',
        'vs-muted':    '#858585',
        'vs-accent':   '#6366f1',
        'vs-blue':     '#007acc',
        'vs-green':    '#10b981',
        'vs-red':      '#ef4444',
        'vs-yellow':   '#f59e0b',
        'vs-teal':     '#4ec9b0',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          from: { transform: 'translateX(-8px)', opacity: '0' },
          to:   { transform: 'translateX(0)',    opacity: '1' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4' },
        },
      },
      animation: {
        'fade-in':  'fade-in 0.2s ease-out both',
        'slide-in': 'slide-in 0.2s ease-out both',
        'pulse-dot':'pulse-dot 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
