/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Aviatrix Brand Colors
        aviatrix: {
          black: '#000000',
          orange: '#FF6B35',
          offwhite: '#F5F5F0',
          purple: '#8B5CF6',
        },
        // Maturity Level Colors
        maturity: {
          traditional: {
            DEFAULT: '#EF4444',
            light: '#FEE2E2',
          },
          initial: {
            DEFAULT: '#F59E0B',
            light: '#FEF3C7',
          },
          advanced: {
            DEFAULT: '#10B981',
            light: '#D1FAE5',
          },
          optimal: {
            DEFAULT: '#059669',
            light: '#A7F3D0',
          },
        },
      },
      fontFamily: {
        sans: ['Epilogue', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Sora', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
