/**
 * Composants d'Accessibilité Africains - WCAG 2.1 AA
 * Interface accessible avec support culturel africain
 */

import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Types pour l'accessibilité
interface AccessibilityContextType {
  highContrast: boolean
  reducedMotion: boolean
  fontSize: 'small' | 'medium' | 'large' | 'extra-large'
  screenReader: boolean
  keyboardNavigation: boolean
  toggleHighContrast: () => void
  toggleReducedMotion: () => void
  setFontSize: (size: 'small' | 'medium' | 'large' | 'extra-large') => void
  announceToScreenReader: (message: string) => void
}

interface AfricanSkipLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

interface AfricanFocusTrapProps {
  children: React.ReactNode
  active: boolean
  className?: string
}

interface AfricanScreenReaderProps {
  children: React.ReactNode
  announce?: boolean
  priority?: 'polite' | 'assertive'
}

interface AfricanKeyboardNavigationProps {
  children: React.ReactNode
  onKeyDown?: (event: React.KeyboardEvent) => void
  className?: string
}

interface AfricanColorContrastProps {
  children: React.ReactNode
  level?: 'AA' | 'AAA'
  className?: string
}

interface AfricanAriaLabelProps {
  children: React.ReactNode
  label: string
  description?: string
  role?: string
  className?: string
}

// Contexte d'accessibilité
const AccessibilityContext = createContext<AccessibilityContextType | null>(null)

// Provider d'accessibilité
export const AfricanAccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large' | 'extra-large'>('medium')
  const [screenReader, setScreenReader] = useState(false)
  const [keyboardNavigation, setKeyboardNavigation] = useState(false)
  const announceRef = useRef<HTMLDivElement>(null)

  // Détecter les préférences système
  useEffect(() => {
    // Détecter le mode contraste élevé
    const contrastQuery = window.matchMedia('(prefers-contrast: high)')
    setHighContrast(contrastQuery.matches)
    
    const handleContrastChange = (e: MediaQueryListEvent) => setHighContrast(e.matches)
    contrastQuery.addEventListener('change', handleContrastChange)

    // Détecter la préférence de mouvement réduit
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(motionQuery.matches)
    
    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    motionQuery.addEventListener('change', handleMotionChange)

    // Détecter l'utilisation du clavier
    const handleKeyDown = () => setKeyboardNavigation(true)
    const handleMouseDown = () => setKeyboardNavigation(false)
    
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    // Détecter les lecteurs d'écran
    const detectScreenReader = () => {
      const isScreenReader = window.navigator.userAgent.includes('NVDA') ||
                           window.navigator.userAgent.includes('JAWS') ||
                           window.speechSynthesis ||
                           'speechSynthesis' in window
      setScreenReader(isScreenReader)
    }
    
    detectScreenReader()

    return () => {
      contrastQuery.removeEventListener('change', handleContrastChange)
      motionQuery.removeEventListener('change', handleMotionChange)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  // Appliquer les préférences au document
  useEffect(() => {
    const root = document.documentElement
    
    // Contraste élevé
    if (highContrast) {
      root.classList.add('african-high-contrast')
    } else {
      root.classList.remove('african-high-contrast')
    }

    // Mouvement réduit
    if (reducedMotion) {
      root.classList.add('african-reduced-motion')
    } else {
      root.classList.remove('african-reduced-motion')
    }

    // Taille de police
    root.classList.remove('african-font-small', 'african-font-medium', 'african-font-large', 'african-font-extra-large')
    root.classList.add(`african-font-${fontSize}`)

    // Navigation clavier
    if (keyboardNavigation) {
      root.classList.add('african-keyboard-navigation')
    } else {
      root.classList.remove('african-keyboard-navigation')
    }
  }, [highContrast, reducedMotion, fontSize, keyboardNavigation])

  const toggleHighContrast = useCallback(() => {
    setHighContrast(prev => !prev)
  }, [])

  const toggleReducedMotion = useCallback(() => {
    setReducedMotion(prev => !prev)
  }, [])

  const announceToScreenReader = useCallback((message: string) => {
    if (announceRef.current) {
      announceRef.current.textContent = message
      // Effacer après un délai pour permettre la relecture
      setTimeout(() => {
        if (announceRef.current) {
          announceRef.current.textContent = ''
        }
      }, 1000)
    }
  }, [])

  const value: AccessibilityContextType = {
    highContrast,
    reducedMotion,
    fontSize,
    screenReader,
    keyboardNavigation,
    toggleHighContrast,
    toggleReducedMotion,
    setFontSize,
    announceToScreenReader
  }

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      {/* Zone d'annonce pour les lecteurs d'écran */}
      <div
        ref={announceRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    </AccessibilityContext.Provider>
  )
}

// Hook pour utiliser le contexte d'accessibilité
export const useAfricanAccessibility = () => {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAfricanAccessibility must be used within AfricanAccessibilityProvider')
  }
  return context
}

// Composant Skip Link
export const AfricanSkipLink: React.FC<AfricanSkipLinkProps> = ({
  href,
  children,
  className = ''
}) => {
  return (
    <a
      href={href}
      className={`
        african-skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
        bg-amber-600 text-white px-4 py-2 rounded-md font-medium z-50
        focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
        ${className}
      `}
      style={{
        background: 'linear-gradient(135deg, #D97706, #F59E0B)',
        boxShadow: '0 4px 6px rgba(139, 69, 19, 0.1)'
      }}
    >
      {children}
    </a>
  )
}

// Composant Focus Trap
export const AfricanFocusTrap: React.FC<AfricanFocusTrapProps> = ({
  children,
  active,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLElement | null>(null)
  const lastFocusableRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!active || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    if (focusableElements.length === 0) return

    firstFocusableRef.current = focusableElements[0]
    lastFocusableRef.current = focusableElements[focusableElements.length - 1]

    // Focus le premier élément
    firstFocusableRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusableRef.current) {
          event.preventDefault()
          lastFocusableRef.current?.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusableRef.current) {
          event.preventDefault()
          firstFocusableRef.current?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [active])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

// Composant Screen Reader Only
export const AfricanScreenReader: React.FC<AfricanScreenReaderProps> = ({
  children,
  announce = false,
  priority = 'polite'
}) => {
  const { announceToScreenReader } = useAfricanAccessibility()

  useEffect(() => {
    if (announce && typeof children === 'string') {
      announceToScreenReader(children)
    }
  }, [announce, children, announceToScreenReader])

  return (
    <span
      className="sr-only"
      aria-live={announce ? priority : undefined}
      aria-atomic={announce ? "true" : undefined}
    >
      {children}
    </span>
  )
}

// Composant Navigation Clavier
export const AfricanKeyboardNavigation: React.FC<AfricanKeyboardNavigationProps> = ({
  children,
  onKeyDown,
  className = ''
}) => {
  const { keyboardNavigation } = useAfricanAccessibility()

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    // Navigation avec les flèches
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const focusableElements = Array.from(
        document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      ) as HTMLElement[]
      
      const currentIndex = focusableElements.indexOf(event.target as HTMLElement)
      let nextIndex: number

      if (event.key === 'ArrowDown') {
        nextIndex = currentIndex + 1 >= focusableElements.length ? 0 : currentIndex + 1
      } else {
        nextIndex = currentIndex - 1 < 0 ? focusableElements.length - 1 : currentIndex - 1
      }

      focusableElements[nextIndex]?.focus()
    }

    // Échapper pour fermer
    if (event.key === 'Escape') {
      (event.target as HTMLElement)?.blur()
    }

    onKeyDown?.(event)
  }, [onKeyDown])

  return (
    <div
      className={`${className} ${keyboardNavigation ? 'african-keyboard-active' : ''}`}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  )
}

// Composant Contraste de Couleur
export const AfricanColorContrast: React.FC<AfricanColorContrastProps> = ({
  children,
  level = 'AA',
  className = ''
}) => {
  const { highContrast } = useAfricanAccessibility()

  const contrastClasses = {
    AA: highContrast ? 'african-contrast-aa-high' : 'african-contrast-aa',
    AAA: highContrast ? 'african-contrast-aaa-high' : 'african-contrast-aaa'
  }

  return (
    <div className={`${contrastClasses[level]} ${className}`}>
      {children}
    </div>
  )
}

// Composant ARIA Label
export const AfricanAriaLabel: React.FC<AfricanAriaLabelProps> = ({
  children,
  label,
  description,
  role,
  className = ''
}) => {
  const labelId = `african-label-${Math.random().toString(36).substr(2, 9)}`
  const descriptionId = description ? `african-desc-${Math.random().toString(36).substr(2, 9)}` : undefined

  return (
    <div
      className={className}
      role={role}
      aria-labelledby={labelId}
      aria-describedby={descriptionId}
    >
      <span id={labelId} className="sr-only">
        {label}
      </span>
      {description && (
        <span id={descriptionId} className="sr-only">
          {description}
        </span>
      )}
      {children}
    </div>
  )
}

// Composant Panneau d'Accessibilité
export const AfricanAccessibilityPanel: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const {
    highContrast,
    reducedMotion,
    fontSize,
    toggleHighContrast,
    toggleReducedMotion,
    setFontSize
  } = useAfricanAccessibility()

  return (
    <>
      {/* Bouton d'ouverture */}
      <button
        onClick={() => setIsOpen(true)}
        className={`
          fixed bottom-4 right-4 bg-amber-600 text-white p-3 rounded-full shadow-lg
          hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
          transition-colors z-40 ${className}
        `}
        aria-label="Ouvrir les options d'accessibilité"
        title="Options d'accessibilité"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
      </button>

      {/* Panneau d'accessibilité */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Panneau */}
            <AfricanFocusTrap active={isOpen}>
              <motion.div
                className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-xl shadow-2xl p-6 w-80 z-50"
                initial={{ opacity: 0, x: 100, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {/* En-tête */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-amber-800">
                    ♿ Accessibilité
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 rounded"
                    aria-label="Fermer le panneau d'accessibilité"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Options */}
                <div className="space-y-4">
                  {/* Contraste élevé */}
                  <div className="flex items-center justify-between">
                    <label htmlFor="high-contrast" className="text-sm font-medium text-gray-700">
                      Contraste élevé
                    </label>
                    <button
                      id="high-contrast"
                      onClick={toggleHighContrast}
                      className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                        focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
                        ${highContrast ? 'bg-amber-600' : 'bg-gray-200'}
                      `}
                      role="switch"
                      aria-checked={highContrast}
                    >
                      <span
                        className={`
                          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                          ${highContrast ? 'translate-x-6' : 'translate-x-1'}
                        `}
                      />
                    </button>
                  </div>

                  {/* Mouvement réduit */}
                  <div className="flex items-center justify-between">
                    <label htmlFor="reduced-motion" className="text-sm font-medium text-gray-700">
                      Réduire les animations
                    </label>
                    <button
                      id="reduced-motion"
                      onClick={toggleReducedMotion}
                      className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                        focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
                        ${reducedMotion ? 'bg-amber-600' : 'bg-gray-200'}
                      `}
                      role="switch"
                      aria-checked={reducedMotion}
                    >
                      <span
                        className={`
                          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                          ${reducedMotion ? 'translate-x-6' : 'translate-x-1'}
                        `}
                      />
                    </button>
                  </div>

                  {/* Taille de police */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Taille de police
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['small', 'medium', 'large', 'extra-large'] as const).map(size => (
                        <button
                          key={size}
                          onClick={() => setFontSize(size)}
                          className={`
                            px-3 py-2 text-xs rounded-md border transition-colors
                            focus:outline-none focus:ring-2 focus:ring-amber-400
                            ${fontSize === size
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }
                          `}
                        >
                          {size === 'small' && 'Petite'}
                          {size === 'medium' && 'Normale'}
                          {size === 'large' && 'Grande'}
                          {size === 'extra-large' && 'Très grande'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Informations */}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      🌍 Interface optimisée pour l'accessibilité en Afrique
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      ♿ Conforme WCAG 2.1 AA
                    </p>
                  </div>
                </div>
              </motion.div>
            </AfricanFocusTrap>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// Styles CSS pour l'accessibilité
export const AfricanAccessibilityStyles = `
/* Styles d'accessibilité africains */

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}

/* Navigation clavier */
.african-keyboard-navigation *:focus {
  outline: 3px solid #F59E0B !important;
  outline-offset: 2px !important;
  border-radius: 4px;
}

.african-keyboard-active {
  --focus-ring-color: #F59E0B;
}

/* Contraste élevé */
.african-high-contrast {
  --african-earth-500: #000000;
  --african-earth-600: #000000;
  --african-earth-700: #000000;
  --african-neutral-100: #ffffff;
  --african-neutral-200: #ffffff;
  --african-neutral-300: #cccccc;
}

.african-high-contrast .african-card {
  border: 3px solid #000000 !important;
  background: #ffffff !important;
  color: #000000 !important;
}

.african-high-contrast .african-button {
  background: #000000 !important;
  color: #ffffff !important;
  border: 2px solid #000000 !important;
}

/* Mouvement réduit */
.african-reduced-motion * {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
  scroll-behavior: auto !important;
}

/* Tailles de police */
.african-font-small {
  font-size: 14px;
}

.african-font-medium {
  font-size: 16px;
}

.african-font-large {
  font-size: 18px;
}

.african-font-extra-large {
  font-size: 20px;
}

/* Contraste de couleur AA */
.african-contrast-aa {
  color: #1f2937;
  background-color: #ffffff;
}

.african-contrast-aa-high {
  color: #000000;
  background-color: #ffffff;
  border: 2px solid #000000;
}

/* Contraste de couleur AAA */
.african-contrast-aaa {
  color: #111827;
  background-color: #ffffff;
}

.african-contrast-aaa-high {
  color: #000000;
  background-color: #ffffff;
  border: 3px solid #000000;
}

/* Skip links */
.african-skip-link:focus {
  position: fixed !important;
  top: 1rem !important;
  left: 1rem !important;
  z-index: 9999 !important;
}

/* Amélioration des zones de clic */
@media (max-width: 768px) {
  button, a, input, select, textarea {
    min-height: 44px;
    min-width: 44px;
  }
}

/* Support des lecteurs d'écran */
[aria-hidden="true"] {
  display: none !important;
}

[aria-expanded="false"] + * {
  display: none;
}

[aria-expanded="true"] + * {
  display: block;
}

/* Indicateurs de focus améliorés */
:focus-visible {
  outline: 3px solid #F59E0B;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Mode sombre accessible */
@media (prefers-color-scheme: dark) {
  .african-contrast-aa {
    color: #f9fafb;
    background-color: #111827;
  }
  
  .african-contrast-aaa {
    color: #ffffff;
    background-color: #000000;
  }
}

/* Impression accessible */
@media print {
  .african-skip-link,
  .african-accessibility-panel {
    display: none !important;
  }
  
  * {
    color: #000000 !important;
    background: #ffffff !important;
  }
}
`

export default {
  AfricanAccessibilityProvider,
  useAfricanAccessibility,
  AfricanSkipLink,
  AfricanFocusTrap,
  AfricanScreenReader,
  AfricanKeyboardNavigation,
  AfricanColorContrast,
  AfricanAriaLabel,
  AfricanAccessibilityPanel,
  AfricanAccessibilityStyles
}

