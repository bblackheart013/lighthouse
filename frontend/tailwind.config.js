/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
      },
      colors: {
        aqi: {
          good: '#38ef7d',
          moderate: '#fddb3a',
          unhealthy: '#ff7b54',
          veryUnhealthy: '#d63447',
          hazardous: '#4a0e0e',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
        },
        '.scrollbar-thin::-webkit-scrollbar': {
          width: '6px',
          height: '6px',
        },
        '.scrollbar-thumb-cyan-500\\/20::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(6, 182, 212, 0.2)',
          borderRadius: '3px',
        },
        '.scrollbar-track-transparent::-webkit-scrollbar-track': {
          backgroundColor: 'transparent',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}
