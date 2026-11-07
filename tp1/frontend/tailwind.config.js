/** Colors come from CSS variables in src/styles/index.css (single source of truth). */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: token('paper'),
        ink: token('ink'),
        muted: token('muted'),
        faint: token('faint'),
        line: token('line'),
        wash: token('wash'),
        blue: { DEFAULT: token('blue'), strong: token('blue-strong'), soft: token('blue-soft') },
        orange: { DEFAULT: token('orange'), strong: token('orange-strong'), soft: token('orange-soft') },
        good: token('good'),
        bad: { DEFAULT: token('bad'), soft: token('bad-soft') },
      },
      fontFamily: {
        sans: ['Geist', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgb(16 24 40 / 0.04), 0 4px 16px -6px rgb(16 24 40 / 0.06)',
        lift: '0 12px 32px -8px rgb(37 99 235 / 0.25), 0 4px 12px -4px rgb(16 24 40 / 0.12)',
        glow: '0 6px 20px -6px rgb(249 115 22 / 0.55)',
      },
      borderRadius: { xl2: '18px' },
    },
  },
  plugins: [],
}
