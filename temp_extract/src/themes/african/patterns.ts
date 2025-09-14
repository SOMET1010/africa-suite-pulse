/**
 * Motifs Africains Authentiques - Bogolan et Kita
 * Implémentation CSS/SVG des motifs traditionnels africains
 */

// Motifs SVG encodés en base64 pour usage CSS
export const africanPatterns = {
  // Motif Bogolan - Géométrie traditionnelle malienne
  bogolan: {
    simple: `data:image/svg+xml;base64,${btoa(`
      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="bogolan" patternUnits="userSpaceOnUse" width="40" height="40">
            <rect width="40" height="40" fill="transparent"/>
            <path d="M0 20L20 0L40 20L20 40Z" stroke="#D2691E" stroke-width="1" fill="none" opacity="0.3"/>
            <circle cx="20" cy="20" r="3" fill="#8B4513" opacity="0.4"/>
            <path d="M10 10L30 10M10 30L30 30" stroke="#DAA520" stroke-width="1" opacity="0.2"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bogolan)"/>
      </svg>
    `)}`,
    
    complex: `data:image/svg+xml;base64,${btoa(`
      <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="bogolan-complex" patternUnits="userSpaceOnUse" width="60" height="60">
            <rect width="60" height="60" fill="transparent"/>
            <path d="M0 30L30 0L60 30L30 60Z" stroke="#D2691E" stroke-width="1.5" fill="none" opacity="0.25"/>
            <path d="M15 15L45 15L45 45L15 45Z" stroke="#8B4513" stroke-width="1" fill="none" opacity="0.3"/>
            <circle cx="30" cy="30" r="5" fill="#DAA520" opacity="0.2"/>
            <path d="M0 0L15 15M45 15L60 0M60 60L45 45M15 45L0 60" stroke="#B8621B" stroke-width="1" opacity="0.2"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bogolan-complex)"/>
      </svg>
    `)}`
  },

  // Motif Kita - Géométrie traditionnelle ouest-africaine
  kita: {
    simple: `data:image/svg+xml;base64,${btoa(`
      <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="kita" patternUnits="userSpaceOnUse" width="30" height="30">
            <rect width="30" height="30" fill="transparent"/>
            <path d="M15 0L30 15L15 30L0 15Z" stroke="#D2691E" stroke-width="1" fill="none" opacity="0.3"/>
            <path d="M7.5 7.5L22.5 7.5L22.5 22.5L7.5 22.5Z" stroke="#8B4513" stroke-width="0.5" fill="none" opacity="0.2"/>
            <circle cx="15" cy="15" r="2" fill="#DAA520" opacity="0.4"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#kita)"/>
      </svg>
    `)}`,
    
    weave: `data:image/svg+xml;base64,${btoa(`
      <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="kita-weave" patternUnits="userSpaceOnUse" width="50" height="50">
            <rect width="50" height="50" fill="transparent"/>
            <path d="M0 25L25 0L50 25L25 50Z" stroke="#D2691E" stroke-width="1" fill="none" opacity="0.2"/>
            <path d="M12.5 12.5L37.5 12.5L37.5 37.5L12.5 37.5Z" stroke="#8B4513" stroke-width="1" fill="none" opacity="0.25"/>
            <path d="M0 12.5L12.5 0M37.5 0L50 12.5M50 37.5L37.5 50M12.5 50L0 37.5" stroke="#B8621B" stroke-width="0.5" opacity="0.2"/>
            <circle cx="25" cy="25" r="3" fill="#DAA520" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#kita-weave)"/>
      </svg>
    `)}`
  },

  // Motifs de bordure
  border: {
    geometric: `data:image/svg+xml;base64,${btoa(`
      <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0L20 20M20 0L0 20" stroke="#D2691E" stroke-width="1" opacity="0.4"/>
        <circle cx="10" cy="10" r="2" fill="#8B4513" opacity="0.3"/>
      </svg>
    `)}`,
    
    tribal: `data:image/svg+xml;base64,${btoa(`
      <svg width="24" height="8" viewBox="0 0 24 8" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 4L4 0L8 4L12 0L16 4L20 0L24 4L20 8L16 4L12 8L8 4L4 8Z" 
              fill="#D2691E" opacity="0.3"/>
      </svg>
    `)}`
  }
}

// Classes CSS pour les motifs
export const africanPatternClasses = {
  // Arrière-plans avec motifs
  'african-bg-bogolan': {
    backgroundImage: `url("${africanPatterns.bogolan.simple}")`,
    backgroundRepeat: 'repeat',
    backgroundSize: '40px 40px'
  },
  
  'african-bg-bogolan-complex': {
    backgroundImage: `url("${africanPatterns.bogolan.complex}")`,
    backgroundRepeat: 'repeat',
    backgroundSize: '60px 60px'
  },
  
  'african-bg-kita': {
    backgroundImage: `url("${africanPatterns.kita.simple}")`,
    backgroundRepeat: 'repeat',
    backgroundSize: '30px 30px'
  },
  
  'african-bg-kita-weave': {
    backgroundImage: `url("${africanPatterns.kita.weave}")`,
    backgroundRepeat: 'repeat',
    backgroundSize: '50px 50px'
  },

  // Bordures avec motifs
  'african-border-geometric': {
    borderImage: `url("${africanPatterns.border.geometric}") 1`,
    borderImageRepeat: 'repeat'
  },
  
  'african-border-tribal': {
    borderImage: `url("${africanPatterns.border.tribal}") 1`,
    borderImageRepeat: 'repeat'
  },

  // Overlays subtils
  'african-overlay-light': {
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
      opacity: 0.05,
      pointerEvents: 'none'
    }
  },
  
  'african-overlay-medium': {
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `url("${africanPatterns.kita.simple}")`,
      backgroundRepeat: 'repeat',
      backgroundSize: '30px 30px',
      opacity: 0.1,
      pointerEvents: 'none'
    }
  }
}

// Fonction utilitaire pour créer des motifs personnalisés
export function createAfricanPattern(
  type: 'bogolan' | 'kita',
  size: number = 40,
  opacity: number = 0.3,
  color: string = '#D2691E'
): string {
  const patterns = {
    bogolan: `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="custom-bogolan" patternUnits="userSpaceOnUse" width="${size}" height="${size}">
            <rect width="${size}" height="${size}" fill="transparent"/>
            <path d="M0 ${size/2}L${size/2} 0L${size} ${size/2}L${size/2} ${size}Z" 
                  stroke="${color}" stroke-width="1" fill="none" opacity="${opacity}"/>
            <circle cx="${size/2}" cy="${size/2}" r="${size/8}" fill="${color}" opacity="${opacity * 0.7}"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#custom-bogolan)"/>
      </svg>
    `,
    kita: `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="custom-kita" patternUnits="userSpaceOnUse" width="${size}" height="${size}">
            <rect width="${size}" height="${size}" fill="transparent"/>
            <path d="M${size/2} 0L${size} ${size/2}L${size/2} ${size}L0 ${size/2}Z" 
                  stroke="${color}" stroke-width="1" fill="none" opacity="${opacity}"/>
            <circle cx="${size/2}" cy="${size/2}" r="${size/10}" fill="${color}" opacity="${opacity * 0.8}"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#custom-kita)"/>
      </svg>
    `
  }
  
  return `data:image/svg+xml;base64,${btoa(patterns[type])}`
}

// Export des styles CSS prêts à l'emploi
export const africanPatternStyles = `
  .african-pattern-bogolan {
    background-image: url("${africanPatterns.bogolan.simple}");
    background-repeat: repeat;
    background-size: 40px 40px;
  }
  
  .african-pattern-kita {
    background-image: url("${africanPatterns.kita.simple}");
    background-repeat: repeat;
    background-size: 30px 30px;
  }
  
  .african-border-pattern {
    border-image: url("${africanPatterns.border.geometric}") 1;
    border-image-repeat: repeat;
  }
  
  .african-overlay::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url("${africanPatterns.bogolan.simple}");
    background-repeat: repeat;
    background-size: 40px 40px;
    opacity: 0.05;
    pointer-events: none;
  }
`

