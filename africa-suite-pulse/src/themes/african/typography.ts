/**
 * Typographie Africaine Authentique
 * Système typographique adapté au contexte culturel africain
 */

// Polices recommandées pour le thème africain
export const africanFonts = {
  // Police principale pour les titres - Élégance moderne
  heading: {
    family: ['Playfair Display', 'Georgia', 'serif'],
    weights: [400, 500, 600, 700, 800, 900],
    fallback: 'serif'
  },

  // Police pour le corps de texte - Lisibilité optimale
  body: {
    family: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    weights: [300, 400, 500, 600, 700],
    fallback: 'sans-serif'
  },

  // Police d'accent - Touche artisanale africaine
  accent: {
    family: ['Kalam', 'Comic Sans MS', 'cursive'],
    weights: [300, 400, 700],
    fallback: 'cursive'
  },

  // Police monospace pour le code
  mono: {
    family: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'monospace'],
    weights: [400, 500, 600, 700],
    fallback: 'monospace'
  }
}

// Échelle typographique harmonieuse
export const africanTypography = {
  // Tailles de police (rem)
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem',  // 72px
    '8xl': '6rem',    // 96px
    '9xl': '8rem'     // 128px
  },

  // Hauteurs de ligne
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2'
  },

  // Espacement des lettres
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em'
  },

  // Poids des polices
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900'
  }
}

// Styles typographiques prédéfinis pour le thème africain
export const africanTextStyles = {
  // Titres principaux
  'heading-hero': {
    fontFamily: africanFonts.heading.family.join(', '),
    fontSize: africanTypography.fontSize['6xl'],
    fontWeight: africanTypography.fontWeight.bold,
    lineHeight: africanTypography.lineHeight.tight,
    letterSpacing: africanTypography.letterSpacing.tight,
    color: 'var(--african-primary-700)'
  },

  'heading-1': {
    fontFamily: africanFonts.heading.family.join(', '),
    fontSize: africanTypography.fontSize['4xl'],
    fontWeight: africanTypography.fontWeight.bold,
    lineHeight: africanTypography.lineHeight.tight,
    letterSpacing: africanTypography.letterSpacing.tight,
    color: 'var(--african-primary-600)'
  },

  'heading-2': {
    fontFamily: africanFonts.heading.family.join(', '),
    fontSize: africanTypography.fontSize['3xl'],
    fontWeight: africanTypography.fontWeight.semibold,
    lineHeight: africanTypography.lineHeight.snug,
    letterSpacing: africanTypography.letterSpacing.normal,
    color: 'var(--african-primary-600)'
  },

  'heading-3': {
    fontFamily: africanFonts.heading.family.join(', '),
    fontSize: africanTypography.fontSize['2xl'],
    fontWeight: africanTypography.fontWeight.semibold,
    lineHeight: africanTypography.lineHeight.snug,
    letterSpacing: africanTypography.letterSpacing.normal,
    color: 'var(--african-primary-500)'
  },

  'heading-4': {
    fontFamily: africanFonts.heading.family.join(', '),
    fontSize: africanTypography.fontSize.xl,
    fontWeight: africanTypography.fontWeight.medium,
    lineHeight: africanTypography.lineHeight.normal,
    letterSpacing: africanTypography.letterSpacing.normal,
    color: 'var(--african-primary-500)'
  },

  // Corps de texte
  'body-large': {
    fontFamily: africanFonts.body.family.join(', '),
    fontSize: africanTypography.fontSize.lg,
    fontWeight: africanTypography.fontWeight.normal,
    lineHeight: africanTypography.lineHeight.relaxed,
    letterSpacing: africanTypography.letterSpacing.normal,
    color: 'var(--african-neutral-700)'
  },

  'body-normal': {
    fontFamily: africanFonts.body.family.join(', '),
    fontSize: africanTypography.fontSize.base,
    fontWeight: africanTypography.fontWeight.normal,
    lineHeight: africanTypography.lineHeight.normal,
    letterSpacing: africanTypography.letterSpacing.normal,
    color: 'var(--african-neutral-700)'
  },

  'body-small': {
    fontFamily: africanFonts.body.family.join(', '),
    fontSize: africanTypography.fontSize.sm,
    fontWeight: africanTypography.fontWeight.normal,
    lineHeight: africanTypography.lineHeight.normal,
    letterSpacing: africanTypography.letterSpacing.normal,
    color: 'var(--african-neutral-600)'
  },

  // Texte d'accent (style artisanal)
  'accent-large': {
    fontFamily: africanFonts.accent.family.join(', '),
    fontSize: africanTypography.fontSize.xl,
    fontWeight: africanTypography.fontWeight.normal,
    lineHeight: africanTypography.lineHeight.relaxed,
    letterSpacing: africanTypography.letterSpacing.wide,
    color: 'var(--african-secondary-500)'
  },

  'accent-normal': {
    fontFamily: africanFonts.accent.family.join(', '),
    fontSize: africanTypography.fontSize.base,
    fontWeight: africanTypography.fontWeight.normal,
    lineHeight: africanTypography.lineHeight.relaxed,
    letterSpacing: africanTypography.letterSpacing.wide,
    color: 'var(--african-secondary-500)'
  },

  // Labels et captions
  'label-large': {
    fontFamily: africanFonts.body.family.join(', '),
    fontSize: africanTypography.fontSize.sm,
    fontWeight: africanTypography.fontWeight.medium,
    lineHeight: africanTypography.lineHeight.normal,
    letterSpacing: africanTypography.letterSpacing.wide,
    color: 'var(--african-neutral-600)',
    textTransform: 'uppercase'
  },

  'label-small': {
    fontFamily: africanFonts.body.family.join(', '),
    fontSize: africanTypography.fontSize.xs,
    fontWeight: africanTypography.fontWeight.medium,
    lineHeight: africanTypography.lineHeight.normal,
    letterSpacing: africanTypography.letterSpacing.wider,
    color: 'var(--african-neutral-500)',
    textTransform: 'uppercase'
  },

  'caption': {
    fontFamily: africanFonts.body.family.join(', '),
    fontSize: africanTypography.fontSize.xs,
    fontWeight: africanTypography.fontWeight.normal,
    lineHeight: africanTypography.lineHeight.normal,
    letterSpacing: africanTypography.letterSpacing.normal,
    color: 'var(--african-neutral-500)'
  }
}

// Classes CSS pour la typographie africaine
export const africanTypographyClasses = {
  // Classes de base
  '.african-font-heading': {
    fontFamily: africanFonts.heading.family.join(', ')
  },
  
  '.african-font-body': {
    fontFamily: africanFonts.body.family.join(', ')
  },
  
  '.african-font-accent': {
    fontFamily: africanFonts.accent.family.join(', ')
  },
  
  '.african-font-mono': {
    fontFamily: africanFonts.mono.family.join(', ')
  },

  // Classes de styles prédéfinis
  '.african-heading-hero': africanTextStyles['heading-hero'],
  '.african-heading-1': africanTextStyles['heading-1'],
  '.african-heading-2': africanTextStyles['heading-2'],
  '.african-heading-3': africanTextStyles['heading-3'],
  '.african-heading-4': africanTextStyles['heading-4'],
  
  '.african-body-large': africanTextStyles['body-large'],
  '.african-body-normal': africanTextStyles['body-normal'],
  '.african-body-small': africanTextStyles['body-small'],
  
  '.african-accent-large': africanTextStyles['accent-large'],
  '.african-accent-normal': africanTextStyles['accent-normal'],
  
  '.african-label-large': africanTextStyles['label-large'],
  '.african-label-small': africanTextStyles['label-small'],
  '.african-caption': africanTextStyles['caption']
}

// Configuration pour Google Fonts
export const googleFontsConfig = {
  families: [
    'Playfair+Display:wght@400;500;600;700;800;900',
    'Inter:wght@300;400;500;600;700',
    'Kalam:wght@300;400;700'
  ],
  display: 'swap'
}

// URL Google Fonts
export const googleFontsUrl = `https://fonts.googleapis.com/css2?${googleFontsConfig.families.map(family => `family=${family}`).join('&')}&display=${googleFontsConfig.display}`

// Fonction utilitaire pour générer les styles CSS
export function generateAfricanTypographyCSS(): string {
  let css = `
    /* Import Google Fonts */
    @import url('${googleFontsUrl}');
    
    /* Variables CSS pour la typographie africaine */
    :root {
      --african-font-heading: ${africanFonts.heading.family.join(', ')};
      --african-font-body: ${africanFonts.body.family.join(', ')};
      --african-font-accent: ${africanFonts.accent.family.join(', ')};
      --african-font-mono: ${africanFonts.mono.family.join(', ')};
    }
    
    /* Classes typographiques africaines */
  `
  
  Object.entries(africanTypographyClasses).forEach(([className, styles]) => {
    css += `\n    ${className} {\n`
    Object.entries(styles).forEach(([property, value]) => {
      const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase()
      css += `      ${cssProperty}: ${value};\n`
    })
    css += `    }\n`
  })
  
  return css
}

