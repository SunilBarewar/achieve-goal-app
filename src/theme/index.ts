import {Platform, TextStyle} from 'react-native';

export const colors = {
  background: '#F7F7F5',
  backgroundDark: '#121212',
  surface: '#FFFFFF',
  surfaceDark: '#1E1E1E',
  text: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textDark: '#F5F5F5',
  textSecondaryDark: '#A0A0A0',
  accent: '#2563EB',
  accentPressed: '#1D4ED8',
  border: '#E8E8E6',
  borderDark: '#2A2A2A',
  success: '#16A34A',
  warning: '#D97706',
  error: '#DC2626',
  card: '#FFFFFF',
  cardDark: '#1E1E1E',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
};

export const typography = {
  title: {
    fontSize: 28,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -0.5,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '500' as TextStyle['fontWeight'],
    letterSpacing: 0.5,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
};

export const touchTarget = 48;

export const fontFamily = Platform.select({
  android: 'sans-serif',
  default: 'System',
});
