/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Minimalist 3-Color Scheme
        // Primary: Slate (Text & Structure)
        // Accent: Blue (Interactive elements)
        // Neutral: White/Slate backgrounds
        
        'primary': {
          DEFAULT: '#1E293B',  // Slate 800 - Main text, headings
          light: '#334155',    // Slate 700 - Secondary text
          dark: '#0F172A',     // Slate 900 - Darkest
        },
        'accent': {
          DEFAULT: '#3B82F6',  // Blue 500 - Buttons, links, active
          hover: '#2563EB',    // Blue 600 - Hover state
          light: '#60A5FA',    // Blue 400 - Dark mode accent
          subtle: '#DBEAFE',   // Blue 100 - Subtle backgrounds
        },
        'neutral': {
          DEFAULT: '#F8FAFC',  // Slate 50 - Main background
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',      // Border color
          300: '#CBD5E1',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',      // Dark mode background
        },
      },
      backgroundColor: {
        'app': '#F8FAFC',
        'app-dark': '#0F172A',
        'card': '#FFFFFF',
        'card-dark': '#1E293B',
      },
      textColor: {
        'heading': '#0F172A',
        'body': '#1E293B',
        'muted': '#64748B',
        'heading-dark': '#F8FAFC',
        'body-dark': '#E2E8F0',
        'muted-dark': '#94A3B8',
      },
      borderColor: {
        'default': '#E2E8F0',
        'default-dark': '#334155',
      },
      borderRadius: {
        'card': '12px',
        'button': '8px',
        'input': '8px',
      },
    },
  },
  plugins: [
    require('daisyui')
  ],
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#3B82F6",
          "secondary": "#1E293B",
          "accent": "#3B82F6",
          "neutral": "#1E293B",
          "base-100": "#FFFFFF",
          "base-200": "#F8FAFC",
          "base-300": "#E2E8F0",
          "info": "#3B82F6",
          "success": "#22C55E",
          "warning": "#F59E0B",
          "error": "#EF4444",
        },
        dark: {
          "primary": "#60A5FA",
          "secondary": "#F8FAFC",
          "accent": "#60A5FA",
          "neutral": "#F8FAFC",
          "base-100": "#0F172A",
          "base-200": "#1E293B",
          "base-300": "#334155",
          "info": "#60A5FA",
          "success": "#4ADE80",
          "warning": "#FBBF24",
          "error": "#F87171",
        },
      },
    ],
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
    logs: false,
  },
}
