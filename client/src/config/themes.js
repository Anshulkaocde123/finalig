// Theme Configuration - Multiple Professional Options

export const themes = {
  // Current Professional Theme (Corporate)
  corporate: {
    name: 'Corporate',
    colors: {
      primary: '#0066CC',
      primaryHover: '#0052A3',
      secondary: '#DC3545',
      secondaryHover: '#B02A37',
      accent: '#10B981',
      accentHover: '#059669',
      neutral: '#374151',
      neutralLight: '#6B7280',
      background: '#FFFFFF',
      surface: '#F9FAFB',
      text: {
        primary: '#111827',
        secondary: '#6B7280',
        tertiary: '#9CA3AF',
      },
      border: '#E5E7EB',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    },
    radius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
    },
  },

  // Modern Tech Theme (Gradient-based)
  modern: {
    name: 'Modern',
    colors: {
      primary: '#6366F1', // Indigo
      primaryHover: '#4F46E5',
      secondary: '#EC4899', // Pink
      secondaryHover: '#DB2777',
      accent: '#14B8A6', // Teal
      accentHover: '#0D9488',
      neutral: '#475569',
      neutralLight: '#64748B',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      text: {
        primary: '#0F172A',
        secondary: '#475569',
        tertiary: '#94A3B8',
      },
      border: '#E2E8F0',
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#06B6D4',
    },
    shadows: {
      sm: '0 1px 3px 0 rgba(99, 102, 241, 0.1)',
      md: '0 4px 6px -1px rgba(99, 102, 241, 0.15)',
      lg: '0 10px 15px -3px rgba(99, 102, 241, 0.2)',
      xl: '0 20px 25px -5px rgba(99, 102, 241, 0.25)',
    },
    radius: {
      sm: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.5rem',
    },
  },

  // Minimalist Theme (Clean & Subtle)
  minimal: {
    name: 'Minimal',
    colors: {
      primary: '#000000',
      primaryHover: '#1F2937',
      secondary: '#6B7280',
      secondaryHover: '#4B5563',
      accent: '#059669',
      accentHover: '#047857',
      neutral: '#6B7280',
      neutralLight: '#9CA3AF',
      background: '#FFFFFF',
      surface: '#FAFAFA',
      text: {
        primary: '#000000',
        secondary: '#6B7280',
        tertiary: '#9CA3AF',
      },
      border: '#F3F4F6',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#DC2626',
      info: '#2563EB',
    },
    shadows: {
      sm: 'none',
      md: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      lg: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      xl: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
    },
    radius: {
      sm: '0.25rem',
      md: '0.25rem',
      lg: '0.5rem',
      xl: '0.5rem',
    },
  },

  // Sports Theme (Energetic)
  sports: {
    name: 'Sports',
    colors: {
      primary: '#0EA5E9', // Sky blue
      primaryHover: '#0284C7',
      secondary: '#F97316', // Orange
      secondaryHover: '#EA580C',
      accent: '#84CC16', // Lime
      accentHover: '#65A30D',
      neutral: '#52525B',
      neutralLight: '#71717A',
      background: '#FFFFFF',
      surface: '#FAFAFA',
      text: {
        primary: '#18181B',
        secondary: '#52525B',
        tertiary: '#A1A1AA',
      },
      border: '#E4E4E7',
      success: '#22C55E',
      warning: '#EAB308',
      error: '#EF4444',
      info: '#3B82F6',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(14, 165, 233, 0.1)',
      md: '0 4px 6px -1px rgba(14, 165, 233, 0.15)',
      lg: '0 10px 15px -3px rgba(14, 165, 233, 0.2)',
      xl: '0 20px 25px -5px rgba(14, 165, 233, 0.25)',
    },
    radius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
    },
  },

  // Dark Mode Theme
  dark: {
    name: 'Dark',
    colors: {
      primary: '#3B82F6',
      primaryHover: '#2563EB',
      secondary: '#EF4444',
      secondaryHover: '#DC2626',
      accent: '#10B981',
      accentHover: '#059669',
      neutral: '#D1D5DB',
      neutralLight: '#9CA3AF',
      background: '#111827',
      surface: '#1F2937',
      text: {
        primary: '#F9FAFB',
        secondary: '#D1D5DB',
        tertiary: '#9CA3AF',
      },
      border: '#374151',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
    },
    radius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
    },
  },
};

// Sport-specific color schemes
export const sportColors = {
  CRICKET: {
    team1: '#2563EB', // Blue
    team2: '#DC2626', // Red
    accent: '#10B981',
  },
  FOOTBALL: {
    team1: '#059669', // Green
    team2: '#DC2626', // Red
    accent: '#F59E0B',
  },
  BADMINTON: {
    team1: '#0EA5E9', // Sky
    team2: '#EC4899', // Pink
    accent: '#84CC16',
  },
  BASKETBALL: {
    team1: '#F97316', // Orange
    team2: '#6366F1', // Indigo
    accent: '#14B8A6',
  },
  VOLLEYBALL: {
    team1: '#8B5CF6', // Violet
    team2: '#F59E0B', // Amber
    accent: '#10B981',
  },
  TABLE_TENNIS: {
    team1: '#EF4444', // Red
    team2: '#000000', // Black
    accent: '#3B82F6',
  },
};

// Typography System
export const typography = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '900',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
};

// Animation Presets (Optimized)
export const animations = {
  // Use CSS transitions instead of Framer Motion where possible
  transitions: {
    fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  // Only use Framer Motion for complex animations
  framerVariants: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slideUp: {
      initial: { y: 20, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: -20, opacity: 0 },
    },
    scale: {
      initial: { scale: 0.95, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.95, opacity: 0 },
    },
  },
};

// Spacing System
export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
};

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Default theme
export const defaultTheme = themes.corporate;

// Helper function to apply theme
export const applyTheme = (themeName = 'corporate') => {
  const theme = themes[themeName] || themes.corporate;
  const root = document.documentElement;

  // Apply CSS variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    if (typeof value === 'object') {
      Object.entries(value).forEach(([subKey, subValue]) => {
        root.style.setProperty(`--color-${key}-${subKey}`, subValue);
      });
    } else {
      root.style.setProperty(`--color-${key}`, value);
    }
  });

  return theme;
};

export default themes;
