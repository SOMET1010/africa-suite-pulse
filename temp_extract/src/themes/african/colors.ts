/**
 * Palette de Couleurs Africaines Authentiques
 * Inspirée des terres, couchers de soleil et artisanat traditionnel africain
 */

export const africanColors = {
  // Couleurs Primaires - Terres Africaines
  primary: {
    50: '#FDF6E3',   // Sable Clair
    100: '#F5E6D3',  // Beige Naturel
    200: '#E8D5B7',  // Terre Claire
    300: '#D2B48C',  // Sable Doré
    400: '#CD853F',  // Terre Cuite Claire
    500: '#D2691E',  // Orange Terre Cuite (Couleur principale)
    600: '#B8621B',  // Terre Cuite Foncée
    700: '#8B4513',  // Brun Sahara
    800: '#654321',  // Brun Profond
    900: '#2C1810'   // Ébène
  },

  // Couleurs Secondaires - Or et Cuivre Africain
  secondary: {
    50: '#FFFBF0',   // Or Très Clair
    100: '#FFF2D9',  // Or Clair
    200: '#FFE4B3',  // Or Pâle
    300: '#FFD700',  // Or Classique
    400: '#DAA520',  // Or Africain
    500: '#B8860B',  // Or Foncé
    600: '#996515',  // Cuivre Clair
    700: '#7A4F0A',  // Cuivre
    800: '#5C3A08',  // Cuivre Foncé
    900: '#3D2505'   // Bronze Profond
  },

  // Couleurs d'Accent - Coucher de Soleil Africain
  accent: {
    50: '#FFF5F0',   // Orange Très Clair
    100: '#FFE6D9',  // Orange Clair
    200: '#FFCCB3',  // Orange Pâle
    300: '#FFB380',  // Orange Doux
    400: '#FF8C00',  // Orange Coucher de Soleil
    500: '#FF6B35',  // Orange Vif
    600: '#E55A2B',  // Orange Foncé
    700: '#CC4125',  // Rouge Orange
    800: '#B8341F',  // Rouge Terre
    900: '#8B1A1A'   // Rouge Profond
  },

  // Couleurs Neutres - Équilibre Moderne
  neutral: {
    50: '#FAFAF9',   // Blanc Cassé
    100: '#F5F5F4',  // Gris Très Clair
    200: '#E7E5E4',  // Gris Clair
    300: '#D6D3D1',  // Gris Moyen Clair
    400: '#A8A29E',  // Gris Moyen
    500: '#78716C',  // Gris
    600: '#57534E',  // Gris Foncé
    700: '#44403C',  // Gris Très Foncé
    800: '#292524',  // Presque Noir
    900: '#1C1917'   // Noir Charbon
  },

  // Couleurs Fonctionnelles
  success: {
    50: '#F0FDF4',   // Vert Très Clair
    100: '#DCFCE7',  // Vert Clair
    200: '#BBF7D0',  // Vert Pâle
    300: '#86EFAC',  // Vert Doux
    400: '#4ADE80',  // Vert Vif
    500: '#228B22',  // Vert Baobab (Principal)
    600: '#16A34A',  // Vert Foncé
    700: '#15803D',  // Vert Profond
    800: '#166534',  // Vert Très Foncé
    900: '#14532D'   // Vert Sombre
  },

  warning: {
    50: '#FFFBEB',   // Jaune Très Clair
    100: '#FEF3C7',  // Jaune Clair
    200: '#FDE68A',  // Jaune Pâle
    300: '#FCD34D',  // Jaune Doux
    400: '#FBBF24',  // Jaune Vif
    500: '#FF8C00',  // Orange Coucher de Soleil (Principal)
    600: '#D97706',  // Orange Foncé
    700: '#B45309',  // Orange Profond
    800: '#92400E',  // Orange Très Foncé
    900: '#78350F'   // Orange Sombre
  },

  error: {
    50: '#FEF2F2',   // Rouge Très Clair
    100: '#FEE2E2',  // Rouge Clair
    200: '#FECACA',  // Rouge Pâle
    300: '#FCA5A5',  // Rouge Doux
    400: '#F87171',  // Rouge Vif
    500: '#DC143C',  // Rouge Latérite (Principal)
    600: '#DC2626',  // Rouge Foncé
    700: '#B91C1C',  // Rouge Profond
    800: '#991B1B',  // Rouge Très Foncé
    900: '#7F1D1D'   // Rouge Sombre
  },

  // Couleurs Spéciales Africaines
  earth: {
    clay: '#B8621B',      // Argile
    sand: '#F5E6D3',      // Sable
    laterite: '#DC143C',  // Latérite
    ochre: '#CC7722',     // Ocre
    sienna: '#A0522D'     // Terre de Sienne
  },

  nature: {
    baobab: '#228B22',    // Vert Baobab
    savanna: '#DAA520',   // Jaune Savane
    sunset: '#FF8C00',    // Coucher de Soleil
    desert: '#EDC9AF',    // Désert
    forest: '#355E3B'     // Forêt
  }
}

// Export des couleurs principales pour usage facile
export const africanPrimary = africanColors.primary[500]
export const africanSecondary = africanColors.secondary[400]
export const africanAccent = africanColors.accent[400]
export const africanSuccess = africanColors.success[500]
export const africanWarning = africanColors.warning[500]
export const africanError = africanColors.error[500]

// Couleurs pour les modes sombre et clair
export const africanThemeColors = {
  light: {
    background: africanColors.neutral[50],
    foreground: africanColors.neutral[900],
    card: africanColors.neutral[100],
    cardForeground: africanColors.neutral[800],
    popover: africanColors.neutral[50],
    popoverForeground: africanColors.neutral[900],
    primary: africanColors.primary[500],
    primaryForeground: africanColors.neutral[50],
    secondary: africanColors.secondary[100],
    secondaryForeground: africanColors.secondary[800],
    muted: africanColors.neutral[100],
    mutedForeground: africanColors.neutral[500],
    accent: africanColors.accent[100],
    accentForeground: africanColors.accent[800],
    destructive: africanColors.error[500],
    destructiveForeground: africanColors.neutral[50],
    border: africanColors.neutral[200],
    input: africanColors.neutral[200],
    ring: africanColors.primary[500]
  },
  dark: {
    background: africanColors.neutral[900],
    foreground: africanColors.neutral[50],
    card: africanColors.neutral[800],
    cardForeground: africanColors.neutral[100],
    popover: africanColors.neutral[800],
    popoverForeground: africanColors.neutral[100],
    primary: africanColors.primary[400],
    primaryForeground: africanColors.neutral[900],
    secondary: africanColors.secondary[800],
    secondaryForeground: africanColors.secondary[100],
    muted: africanColors.neutral[800],
    mutedForeground: africanColors.neutral[400],
    accent: africanColors.accent[800],
    accentForeground: africanColors.accent[100],
    destructive: africanColors.error[400],
    destructiveForeground: africanColors.neutral[50],
    border: africanColors.neutral[700],
    input: africanColors.neutral[700],
    ring: africanColors.primary[400]
  }
}

