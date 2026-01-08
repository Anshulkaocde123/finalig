/**
 * Professional Sports Theme Configuration
 * Clean, mature design without childish elements
 */

export const professionalTheme = {
  // Professional color palette - no bright neons
  colors: {
    // Primary brand colors
    primary: {
      main: '#0A2540',      // Deep navy blue
      light: '#1E3A5F',
      dark: '#051628'
    },
    
    // Sport accent colors
    sport: {
      green: '#00A86B',     // Professional sports green
      blue: '#0066CC',      // Clean blue
      orange: '#FF6B35',    // Muted orange (not neon)
      red: '#DC3545',       // Professional red (errors/live)
      yellow: '#FFC107'     // Warning/highlight yellow
    },
    
    // Neutral palette for backgrounds
    neutral: {
      50: '#F8F9FA',
      100: '#E9ECEF',
      200: '#DEE2E6',
      300: '#CED4DA',
      400: '#ADB5BD',
      500: '#6C757D',
      600: '#495057',
      700: '#343A40',
      800: '#212529',
      900: '#1A1D20'
    },
    
    // Dark mode
    dark: {
      bg: '#0F1419',
      surface: '#1A1F26',
      border: '#2D3748',
      text: '#E2E8F0'
    },
    
    // Status colors
    status: {
      live: '#DC3545',
      scheduled: '#6C757D',
      completed: '#28A745',
      cancelled: '#6C757D'
    },
    
    // Team color system (clean, professional)
    team: {
      a: {
        primary: '#0066CC',
        light: '#3399FF',
        gradient: 'from-blue-600 to-blue-700'
      },
      b: {
        primary: '#DC3545',
        light: '#E74C5C',
        gradient: 'from-red-600 to-red-700'
      }
    }
  },
  
  // Professional sport icons (no emojis)
  icons: {
    badminton: 'Zap',          // Lucide icon name
    cricket: 'Target',
    football: 'Circle',
    basketball: 'Disc',
    volleyball: 'Circle',
    tabletennis: 'Circle',
    chess: 'Grid3x3',
    khokho: 'Flag',
    kabaddi: 'Users',
    trophy: 'Award',
    live: 'Radio'
  },
  
  // Spacing scale (consistent)
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem'     // 48px
  },
  
  // Border radius (professional, not overly rounded)
  radius: {
    none: '0',
    sm: '0.25rem',    // 4px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px - max for professional look
    full: '9999px'    // pills/circles only
  },
  
  // Typography scale
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, -apple-system, sans-serif',
      mono: 'JetBrains Mono, monospace'
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
      '5xl': '3rem'
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800'
    }
  },
  
  // Shadow system (subtle, professional)
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  },
  
  // Animation settings (minimal, performance-focused)
  animation: {
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms'
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)'
    }
  }
};

// Sport-specific professional color schemes
export const sportThemes = {
  BADMINTON: {
    primary: '#0066CC',
    secondary: '#00A86B',
    gradient: 'from-blue-600 to-cyan-600',
    icon: 'Zap'
  },
  CRICKET: {
    primary: '#00A86B',
    secondary: '#0066CC',
    gradient: 'from-green-600 to-emerald-600',
    icon: 'Target'
  },
  FOOTBALL: {
    primary: '#00A86B',
    secondary: '#0066CC',
    gradient: 'from-emerald-600 to-green-600',
    icon: 'Circle'
  },
  BASKETBALL: {
    primary: '#FF6B35',
    secondary: '#FFC107',
    gradient: 'from-orange-600 to-amber-600',
    icon: 'Disc'
  },
  VOLLEYBALL: {
    primary: '#0066CC',
    secondary: '#00A86B',
    gradient: 'from-blue-600 to-sky-600',
    icon: 'Circle'
  },
  TABLE_TENNIS: {
    primary: '#DC3545',
    secondary: '#0066CC',
    gradient: 'from-red-600 to-rose-600',
    icon: 'Circle'
  },
  CHESS: {
    primary: '#343A40',
    secondary: '#6C757D',
    gradient: 'from-gray-700 to-gray-800',
    icon: 'Grid3x3'
  }
};

export default professionalTheme;
