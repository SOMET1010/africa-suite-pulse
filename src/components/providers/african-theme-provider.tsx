/**
 * Provider de Thème Africain
 * Gestion globale du thème africain authentique
 */

import React, { createContext, useContext, useEffect, useState } from 'react'
import { africanTheme, africanUtils } from '@/themes/african'

interface AfricanThemeContextType {
  theme: typeof africanTheme
  isAfricanTheme: boolean
  toggleAfricanTheme: () => void
  patternIntensity: 'light' | 'medium' | 'strong'
  setPatternIntensity: (intensity: 'light' | 'medium' | 'strong') => void
  accentColor: 'primary' | 'secondary' | 'accent'
  setAccentColor: (color: 'primary' | 'secondary' | 'accent') => void
}

const AfricanThemeContext = createContext<AfricanThemeContextType | undefined>(undefined)

interface AfricanThemeProviderProps {
  children: React.ReactNode
  defaultEnabled?: boolean
  storageKey?: string
}

export function AfricanThemeProvider({ 
  children, 
  defaultEnabled = true,
  storageKey = 'african-theme-enabled'
}: AfricanThemeProviderProps) {
  const [isAfricanTheme, setIsAfricanTheme] = useState(defaultEnabled)
  const [patternIntensity, setPatternIntensity] = useState<'light' | 'medium' | 'strong'>('light')
  const [accentColor, setAccentColor] = useState<'primary' | 'secondary' | 'accent'>('primary')

  // Charger les préférences depuis localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored !== null) {
        setIsAfricanTheme(JSON.parse(stored))
      }
      
      const storedIntensity = localStorage.getItem(`${storageKey}-intensity`)
      if (storedIntensity) {
        setPatternIntensity(storedIntensity as 'light' | 'medium' | 'strong')
      }
      
      const storedAccent = localStorage.getItem(`${storageKey}-accent`)
      if (storedAccent) {
        setAccentColor(storedAccent as 'primary' | 'secondary' | 'accent')
      }
    } catch (error) {
      console.warn('Erreur lors du chargement des préférences de thème:', error)
    }
  }, [storageKey])

  // Appliquer le thème au DOM
  useEffect(() => {
    const root = document.documentElement
    
    if (isAfricanTheme) {
      // Ajouter les variables CSS africaines
      const cssVariables = africanUtils.generateCSSVariables()
      
      // Créer ou mettre à jour la balise style
      let styleElement = document.getElementById('african-theme-variables')
      if (!styleElement) {
        styleElement = document.createElement('style')
        styleElement.id = 'african-theme-variables'
        document.head.appendChild(styleElement)
      }
      styleElement.textContent = cssVariables
      
      // Ajouter les classes CSS au body
      document.body.classList.add('african-theme')
      document.body.classList.add(`african-pattern-${patternIntensity}`)
      document.body.classList.add(`african-accent-${accentColor}`)
      
      // Mettre à jour les propriétés CSS personnalisées
      root.style.setProperty('--primary', 'var(--african-primary-500)')
      root.style.setProperty('--primary-foreground', 'var(--african-neutral-50)')
      root.style.setProperty('--secondary', 'var(--african-secondary-100)')
      root.style.setProperty('--secondary-foreground', 'var(--african-secondary-800)')
      root.style.setProperty('--accent', 'var(--african-accent-100)')
      root.style.setProperty('--accent-foreground', 'var(--african-accent-800)')
      root.style.setProperty('--background', 'var(--african-neutral-50)')
      root.style.setProperty('--foreground', 'var(--african-neutral-900)')
      root.style.setProperty('--card', 'var(--african-neutral-100)')
      root.style.setProperty('--card-foreground', 'var(--african-neutral-800)')
      root.style.setProperty('--border', 'var(--african-neutral-200)')
      root.style.setProperty('--input', 'var(--african-neutral-200)')
      root.style.setProperty('--ring', 'var(--african-primary-500)')
      
    } else {
      // Retirer le thème africain
      document.body.classList.remove('african-theme')
      document.body.classList.remove(`african-pattern-${patternIntensity}`)
      document.body.classList.remove(`african-accent-${accentColor}`)
      
      // Supprimer la balise style
      const styleElement = document.getElementById('african-theme-variables')
      if (styleElement) {
        styleElement.remove()
      }
      
      // Restaurer les valeurs par défaut (optionnel)
      // Les valeurs par défaut seront gérées par le CSS existant
    }
  }, [isAfricanTheme, patternIntensity, accentColor])

  const toggleAfricanTheme = () => {
    const newValue = !isAfricanTheme
    setIsAfricanTheme(newValue)
    localStorage.setItem(storageKey, JSON.stringify(newValue))
  }

  const handleSetPatternIntensity = (intensity: 'light' | 'medium' | 'strong') => {
    setPatternIntensity(intensity)
    localStorage.setItem(`${storageKey}-intensity`, intensity)
  }

  const handleSetAccentColor = (color: 'primary' | 'secondary' | 'accent') => {
    setAccentColor(color)
    localStorage.setItem(`${storageKey}-accent`, color)
  }

  const value: AfricanThemeContextType = {
    theme: africanTheme,
    isAfricanTheme,
    toggleAfricanTheme,
    patternIntensity,
    setPatternIntensity: handleSetPatternIntensity,
    accentColor,
    setAccentColor: handleSetAccentColor
  }

  return (
    <AfricanThemeContext.Provider value={value}>
      {children}
    </AfricanThemeContext.Provider>
  )
}

// Hook pour utiliser le thème africain
export function useAfricanTheme() {
  const context = useContext(AfricanThemeContext)
  if (context === undefined) {
    throw new Error('useAfricanTheme doit être utilisé dans un AfricanThemeProvider')
  }
  return context
}

// Hook pour vérifier si le thème africain est actif
export function useIsAfricanTheme() {
  const { isAfricanTheme } = useAfricanTheme()
  return isAfricanTheme
}

// Composant pour basculer le thème
export function AfricanThemeToggle({ 
  className,
  showLabel = true 
}: { 
  className?: string
  showLabel?: boolean 
}) {
  const { isAfricanTheme, toggleAfricanTheme } = useAfricanTheme()
  
  return (
    <button
      onClick={toggleAfricanTheme}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-md
        transition-all duration-200
        ${isAfricanTheme 
          ? 'bg-african-primary-100 text-african-primary-700 border border-african-primary-200' 
          : 'bg-gray-100 text-gray-700 border border-gray-200'
        }
        hover:shadow-sm
        ${className}
      `}
      title={isAfricanTheme ? 'Désactiver le thème africain' : 'Activer le thème africain'}
    >
      <span className="text-lg">
        {isAfricanTheme ? '🌍' : '🎨'}
      </span>
      {showLabel && (
        <span className="text-sm font-medium">
          {isAfricanTheme ? 'Thème Africain' : 'Thème Standard'}
        </span>
      )}
    </button>
  )
}

// Composant de configuration du thème
export function AfricanThemeSettings() {
  const { 
    isAfricanTheme, 
    patternIntensity, 
    setPatternIntensity,
    accentColor,
    setAccentColor 
  } = useAfricanTheme()

  if (!isAfricanTheme) return null

  return (
    <div className="space-y-4 p-4 bg-african-neutral-50 rounded-lg border border-african-neutral-200">
      <h3 className="font-heading text-lg font-semibold text-african-primary-700">
        Configuration Thème Africain
      </h3>
      
      {/* Intensité des motifs */}
      <div>
        <label className="block text-sm font-medium text-african-neutral-700 mb-2">
          Intensité des motifs
        </label>
        <div className="flex gap-2">
          {(['light', 'medium', 'strong'] as const).map((intensity) => (
            <button
              key={intensity}
              onClick={() => setPatternIntensity(intensity)}
              className={`
                px-3 py-1 rounded text-xs font-medium transition-all
                ${patternIntensity === intensity
                  ? 'bg-african-primary-500 text-white'
                  : 'bg-african-neutral-200 text-african-neutral-700 hover:bg-african-neutral-300'
                }
              `}
            >
              {intensity === 'light' ? 'Léger' : intensity === 'medium' ? 'Moyen' : 'Fort'}
            </button>
          ))}
        </div>
      </div>
      
      {/* Couleur d'accent */}
      <div>
        <label className="block text-sm font-medium text-african-neutral-700 mb-2">
          Couleur d'accent
        </label>
        <div className="flex gap-2">
          {(['primary', 'secondary', 'accent'] as const).map((color) => (
            <button
              key={color}
              onClick={() => setAccentColor(color)}
              className={`
                w-8 h-8 rounded-full border-2 transition-all
                ${accentColor === color ? 'border-african-neutral-700 scale-110' : 'border-african-neutral-300'}
                ${color === 'primary' ? 'bg-african-primary-500' : 
                  color === 'secondary' ? 'bg-african-secondary-400' : 
                  'bg-african-accent-500'}
              `}
              title={color === 'primary' ? 'Terre cuite' : color === 'secondary' ? 'Or africain' : 'Coucher de soleil'}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

