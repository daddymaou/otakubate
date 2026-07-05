import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#06060f',
          card: 'rgba(255,255,255,0.04)',
          hover: 'rgba(255,255,255,0.07)',
        },
        accent: {
          DEFAULT: '#F4C430',
          hover: '#FFD700',
          muted: 'rgba(244,196,48,0.12)',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.08)',
          hover: 'rgba(255,255,255,0.15)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        'float-delayed': 'float 4s ease-in-out 2s infinite',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        'spin-slow': 'spin-slow 20s linear infinite',
        twinkle: 'twinkle 2s ease-in-out infinite',
      },
      backdropBlur: {
        xs: '2px',
        '4xl': '80px',
      },
      boxShadow: {
        'gold': '0 0 30px rgba(244,196,48,0.3), 0 0 60px rgba(244,196,48,0.1)',
        'gold-sm': '0 0 15px rgba(244,196,48,0.25)',
        'purple': '0 0 30px rgba(124,58,237,0.3)',
        'glass': '0 8px 32px rgba(0,0,0,0.4)',
        'glass-lg': '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
      },
    },
  },
  plugins: [],
}

export default config
