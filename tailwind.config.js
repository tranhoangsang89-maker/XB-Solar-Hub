/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'solar-gold': '#F59E0B',
        'solar-gold-dark': '#D97706',
        'solar-emerald': '#10B981',
        'solar-emerald-dark': '#059669',
        'slate-900': '#0F172A',
        'slate-800': '#1E293B',
        'slate-700': '#334155',
        'slate-600': '#475569',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F4C2A 100%)',
        'gold-gradient': 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        'emerald-gradient': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      },
      boxShadow: {
        'gold-glow': '0 0 30px rgba(245, 158, 11, 0.3)',
        'emerald-glow': '0 0 30px rgba(16, 185, 129, 0.3)',
      },
    },
  },
  plugins: [],
}
