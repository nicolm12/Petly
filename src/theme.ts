import { Platform } from 'react-native';

export const colors = {
  // Colores principales
  primary: '#7F3FBF',
  primaryDark: '#5E2D91',
  soft: '#CFACF2',

  // Fondos y superficies
  bg: '#F8F4FC',
  card: '#FFFFFF',

  // Textos
  text: '#352344',
  muted: '#81758D',

  // Estados y acentos
  danger: '#DC2626',
  accent: '#A673D9',
  success: '#2E8B57',

  // Colores adicionales de la paleta
  violet: '#7F3FBF',
  violetLight: '#A673D9',
  lavender: '#CFACF2',
  violetAccent: '#8243D9',
  whiteGray: '#F2F2F2',
};

// iOS usa shadow*, Android usa elevation
export const cardShadow = Platform.select({
  ios: {
    shadowColor: '#352344',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  android: {
    elevation: 4,
  },
  default: {},
});