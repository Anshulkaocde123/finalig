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
        // VNIT Brand Colors - Professional & Institutional
        'vnit-primary': '#1a3a6b',      // Deep Blue (Institutional)
        'vnit-secondary': '#dc143c',    // Crimson Red (VNIT Theme)
        'vnit-accent': '#f5a623',       // Gold (Excellence)
        'vnit-light': '#e8f0f7',        // Light Blue
        'vnit-dark': '#0f1419',         // Almost Black
        
        // Light Mode
        'light-bg': '#ffffff',
        'light-surface': '#f8fafc',
        'light-border': '#e2e8f0',
        'light-text': '#1e293b',
        'light-text-secondary': '#64748b',
        
        // Dark Mode
        'dark-bg': '#0f1419',
        'dark-surface': '#1a1f2e',
        'dark-border': '#2d3748',
        'dark-text': '#f1f5f9',
        'dark-text-secondary': '#cbd5e1',
      },
      backgroundColor: {
        'light': '#ffffff',
        'dark': '#0f1419',
      },
      textColor: {
        'light': '#1e293b',
        'dark': '#f1f5f9',
      },
      borderColor: {
        'light': '#e2e8f0',
        'dark': '#2d3748',
      },
    },
  },
  plugins: [],
}
