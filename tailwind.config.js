/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ahly: {
          red: '#C8102E',
          darkRed: '#8B0000',
          gold: '#D4AF37',
          dark: '#0f0f1a',
          card: '#1a1a2e',
          cardHover: '#252540',
          border: '#2a2a4a',
          text: '#e0e0f0',
          muted: '#8888aa',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-red': 'pulseRed 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        float: 'float 4s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
        'glow-red': 'glowRed 2s ease-in-out infinite alternate',
        shimmer: 'shimmer 2s infinite linear',
        'score-flash': 'scoreFlash 0.6s ease-out',
        'bar-grow': 'barGrow 1s ease-out forwards',
        'live-pulse': 'livePulse 1.5s ease-in-out infinite',
        'slide-right': 'slideRight 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'heart-pulse': 'heartPulse 1.5s ease-in-out infinite',
        'shimmer-text': 'shimmerText 3s ease-in-out infinite',
      },
      keyframes: {
        pulseRed: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(200, 16, 46, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(200, 16, 46, 0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(200, 16, 46, 0.2), 0 0 20px rgba(200, 16, 46, 0.1)' },
          '100%': { boxShadow: '0 0 10px rgba(200, 16, 46, 0.4), 0 0 40px rgba(200, 16, 46, 0.2)' },
        },
        glowRed: {
          '0%': { textShadow: '0 0 5px rgba(200, 16, 46, 0.3)' },
          '100%': { textShadow: '0 0 15px rgba(200, 16, 46, 0.6), 0 0 30px rgba(200, 16, 46, 0.3)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        scoreFlash: {
          '0%': { transform: 'scale(1.4)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        barGrow: {
          '0%': { width: '0%' },
        },
        livePulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        heartPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.25)', opacity: '0.8' },
        },
        shimmerText: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
    },
  },
  plugins: [],
};
