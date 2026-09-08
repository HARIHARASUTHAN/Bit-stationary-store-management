/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Clay Canvas & Surfaces
        canvas: '#fffaf0',
        'surface-soft': '#faf5e8',
        'surface-card': '#f5f0e0',
        'surface-strong': '#ebe6d6',
        'surface-dark': '#0a1a1a',
        'surface-dark-elevated': '#1a2a2a',
        hairline: '#e5e5e5',

        // Clay Text Tokens
        ink: '#0a0a0a',
        'body-strong': '#1a1a1a',
        body: '#3a3a3a',
        muted: '#6a6a6a',
        'muted-soft': '#9a9a9a',

        // Clay 6-color Saturated Brand Palette
        'brand-pink': '#ff4d8b',
        'brand-teal': '#1a3a3a',
        'brand-lavender': '#b8a4ed',
        'brand-peach': '#ffb084',
        'brand-ochre': '#e8b94a',
        'brand-mint': '#a4d4c5',
        'brand-coral': '#ff6b5a',

        // Primary near-black CTA token
        primary: {
          DEFAULT: '#0a0a0a',
          hover: '#1a1a1a',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        'display-xl': '-2.5px',
        'display-lg': '-2px',
        'display-md': '-1px',
        'display-sm': '-0.5px',
      },
      borderRadius: {
        xs: '6px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        pill: '9999px',
      },
      boxShadow: {
        soft: '0 2px 8px 0 rgba(0, 0, 0, 0.04)',
        hover: '0 4px 16px 0 rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};
