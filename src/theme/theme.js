export const theme = {
  colors: {
    primary: '#20365B',
    primaryLight: '#2d4a7c',
    accent: '#FFC759',
    accentDark: '#F6C056',
    success: '#4ade80',
    warning: '#facc15',
    surface: '#FFFFFF',
    background: '#F9FAFB', // Light gray background often used in mobile
    textPrimary: '#0E0E0E',
    textSecondary: '#6b7280',
    border: '#E5E7EB',
    error: '#ef4444',
  },
  typography: {
    fontFamily: {
      regular: 'Inter_400Regular',
      medium: 'Inter_500Medium',
      semiBold: 'Inter_600SemiBold',
      bold: 'Inter_700Bold',
      heading: 'SpaceGrotesk_700Bold', // Default for Space Grotesk
      mono: 'JetBrainsMono_400Regular',
    },
    sizes: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      heading: 28,
    }
  },
  radii: {
    sm: 12, // Small badges
    md: 16, // Inputs, buttons
    lg: 24, // Cards
    xl: 40, // Large cards/modals
    full: 9999, // Pill shaped
  },
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
  },
  shadows: {
    soft: {
      boxShadow: '0px 1px 3px #000',
    },
    floating: {
      boxShadow: '0px 4px 6px #000',
    },
    elevated: {
      boxShadow: '0px 10px 15px #000',
    },
    brandGlow: {
      boxShadow: '0px 8px 12px #FFC759',
    }
  }
};
