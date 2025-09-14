/**
 * Thème Africain Authentique - Index Principal
 * Système de design complet inspiré de l'artisanat et de la culture africaine
 */

import { africanColors, africanThemeColors } from './colors'
import { africanPatterns, africanPatternClasses, createAfricanPattern } from './patterns'
import { africanFonts, africanTypography, africanTextStyles, googleFontsUrl } from './typography'

// Configuration principale du thème africain
export const africanTheme = {
  name: 'African Authentic',
  version: '1.0.0',
  
  // Couleurs
  colors: africanColors,
  themeColors: africanThemeColors,
  
  // Motifs
  patterns: africanPatterns,
  patternClasses: africanPatternClasses,
  
  // Typographie
  fonts: africanFonts,
  typography: africanTypography,
  textStyles: africanTextStyles,
  
  // Espacement harmonieux inspiré de l'art africain
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
    '5xl': '8rem'    // 128px
  },
  
  // Rayons de bordure inspirés de l'artisanat
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px'
  },
  
  // Ombres subtiles
  shadows: {
    sm: '0 1px 2px 0 rgba(139, 69, 19, 0.05)',
    md: '0 4px 6px -1px rgba(139, 69, 19, 0.1), 0 2px 4px -1px rgba(139, 69, 19, 0.06)',
    lg: '0 10px 15px -3px rgba(139, 69, 19, 0.1), 0 4px 6px -2px rgba(139, 69, 19, 0.05)',
    xl: '0 20px 25px -5px rgba(139, 69, 19, 0.1), 0 10px 10px -5px rgba(139, 69, 19, 0.04)',
    '2xl': '0 25px 50px -12px rgba(139, 69, 19, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(139, 69, 19, 0.06)'
  },
  
  // Transitions fluides
  transitions: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out'
  },
  
  // Points de rupture responsive
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }
}

// Composants de base du thème
export const africanComponents = {
  // Bouton africain authentique
  button: {
    base: {
      fontFamily: africanFonts.body.family.join(', '),
      fontWeight: africanTypography.fontWeight.medium,
      borderRadius: africanTheme.borderRadius.md,
      transition: africanTheme.transitions.normal,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: africanTheme.spacing.sm
    },
    
    variants: {
      primary: {
        backgroundColor: africanColors.primary[500],
        color: africanColors.neutral[50],
        border: `1px solid ${africanColors.primary[600]}`,
        '&:hover': {
          backgroundColor: africanColors.primary[600],
          transform: 'translateY(-1px)',
          boxShadow: africanTheme.shadows.md
        },
        '&:active': {
          transform: 'translateY(0)',
          backgroundColor: africanColors.primary[700]
        }
      },
      
      secondary: {
        backgroundColor: africanColors.secondary[100],
        color: africanColors.secondary[800],
        border: `1px solid ${africanColors.secondary[200]}`,
        '&:hover': {
          backgroundColor: africanColors.secondary[200],
          borderColor: africanColors.secondary[300]
        }
      },
      
      accent: {
        backgroundColor: africanColors.accent[500],
        color: africanColors.neutral[50],
        border: `1px solid ${africanColors.accent[600]}`,
        '&:hover': {
          backgroundColor: africanColors.accent[600],
          transform: 'scale(1.02)'
        }
      },
      
      outline: {
        backgroundColor: 'transparent',
        color: africanColors.primary[600],
        border: `2px solid ${africanColors.primary[500]}`,
        '&:hover': {
          backgroundColor: africanColors.primary[50],
          borderColor: africanColors.primary[600]
        }
      }
    },
    
    sizes: {
      sm: {
        padding: `${africanTheme.spacing.sm} ${africanTheme.spacing.md}`,
        fontSize: africanTypography.fontSize.sm,
        minHeight: '2rem'
      },
      md: {
        padding: `${africanTheme.spacing.md} ${africanTheme.spacing.lg}`,
        fontSize: africanTypography.fontSize.base,
        minHeight: '2.5rem'
      },
      lg: {
        padding: `${africanTheme.spacing.lg} ${africanTheme.spacing.xl}`,
        fontSize: africanTypography.fontSize.lg,
        minHeight: '3rem'
      }
    }
  },
  
  // Carte africaine avec motifs
  card: {
    base: {
      backgroundColor: africanColors.neutral[50],
      border: `1px solid ${africanColors.neutral[200]}`,
      borderRadius: africanTheme.borderRadius.lg,
      boxShadow: africanTheme.shadows.sm,
      overflow: 'hidden',
      transition: africanTheme.transitions.normal
    },
    
    variants: {
      default: {
        '&:hover': {
          boxShadow: africanTheme.shadows.md,
          transform: 'translateY(-2px)'
        }
      },
      
      pattern: {
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("${africanPatterns.bogolan.simple}")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '40px 40px',
          opacity: 0.03,
          pointerEvents: 'none'
        }
      },
      
      accent: {
        borderLeft: `4px solid ${africanColors.primary[500]}`,
        backgroundColor: africanColors.primary[25] || africanColors.primary[50]
      }
    }
  },
  
  // Input africain
  input: {
    base: {
      fontFamily: africanFonts.body.family.join(', '),
      fontSize: africanTypography.fontSize.base,
      padding: `${africanTheme.spacing.md} ${africanTheme.spacing.lg}`,
      border: `1px solid ${africanColors.neutral[300]}`,
      borderRadius: africanTheme.borderRadius.md,
      backgroundColor: africanColors.neutral[50],
      transition: africanTheme.transitions.fast,
      '&:focus': {
        outline: 'none',
        borderColor: africanColors.primary[500],
        boxShadow: `0 0 0 3px ${africanColors.primary[500]}20`,
        backgroundColor: africanColors.neutral[25] || africanColors.neutral[50]
      },
      '&::placeholder': {
        color: africanColors.neutral[400]
      }
    }
  }
}

// Utilitaires pour l'intégration
export const africanUtils = {
  // Générer les variables CSS
  generateCSSVariables(): string {
    let css = ':root {\n'
    
    // Couleurs
    Object.entries(africanColors).forEach(([colorName, colorScale]) => {
      if (typeof colorScale === 'object') {
        Object.entries(colorScale).forEach(([shade, value]) => {
          css += `  --african-${colorName}-${shade}: ${value};\n`
        })
      } else {
        css += `  --african-${colorName}: ${colorScale};\n`
      }
    })
    
    // Espacement
    Object.entries(africanTheme.spacing).forEach(([name, value]) => {
      css += `  --african-spacing-${name}: ${value};\n`
    })
    
    // Rayons de bordure
    Object.entries(africanTheme.borderRadius).forEach(([name, value]) => {
      css += `  --african-radius-${name}: ${value};\n`
    })
    
    css += '}\n'
    return css
  },
  
  // Créer un motif personnalisé
  createPattern: createAfricanPattern,
  
  // Obtenir une couleur avec opacité
  getColorWithOpacity(colorPath: string, opacity: number): string {
    const color = this.getNestedValue(africanColors, colorPath)
    if (!color) return 'transparent'
    
    // Convertir hex en rgba
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  },
  
  // Utilitaire pour accéder aux valeurs imbriquées
  getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }
}

// Export principal
export {
  africanColors,
  africanThemeColors,
  africanPatterns,
  africanPatternClasses,
  createAfricanPattern,
  africanFonts,
  africanTypography,
  africanTextStyles,
  googleFontsUrl
}

export default africanTheme

