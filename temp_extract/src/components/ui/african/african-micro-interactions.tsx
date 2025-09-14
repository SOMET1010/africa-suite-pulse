/**
 * Composants de Micro-interactions Africaines
 * Animations et interactions fluides avec thème culturel
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion'

// Types pour les micro-interactions
interface AfricanRippleProps {
  children: React.ReactNode
  className?: string
  color?: 'earth' | 'terracotta' | 'ochre' | 'saffron'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: (event: React.MouseEvent) => void
}

interface AfricanPulseProps {
  children: React.ReactNode
  className?: string
  intensity?: 'subtle' | 'normal' | 'strong'
  speed?: 'slow' | 'normal' | 'fast'
  color?: string
}

interface AfricanHoverEffectProps {
  children: React.ReactNode
  className?: string
  effect?: 'lift' | 'glow' | 'pattern' | 'dance'
  intensity?: number
}

interface AfricanLoadingProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'earth' | 'terracotta' | 'ochre' | 'saffron'
  type?: 'spinner' | 'dots' | 'wave' | 'weave'
  text?: string
}

interface AfricanToastProps {
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  duration?: number
  position?: 'top' | 'bottom' | 'center'
  onClose?: () => void
}

// Couleurs africaines pour les interactions
const AFRICAN_COLORS = {
  earth: 'rgba(139, 69, 19, 0.3)',
  terracotta: 'rgba(220, 38, 38, 0.3)',
  ochre: 'rgba(245, 158, 11, 0.3)',
  saffron: 'rgba(249, 115, 22, 0.3)'
}

// Animations de base
const africanAnimations = {
  // Animation de danse africaine
  dance: {
    initial: { y: 0, rotate: 0 },
    animate: {
      y: [-2, -8, -2, -5, 0],
      rotate: [0, 1, 0, -1, 0],
      transition: {
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "loop" as const
      }
    }
  },
  
  // Animation de lever de soleil
  sunrise: {
    initial: { y: 20, scale: 0.8, opacity: 0 },
    animate: { 
      y: 0, 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  },
  
  // Animation de tissage
  weave: {
    initial: { backgroundPosition: '0 0' },
    animate: {
      backgroundPosition: '40px 40px',
      transition: {
        duration: 4,
        ease: "linear",
        repeat: Infinity
      }
    }
  },
  
  // Animation de pulsation (tambour)
  pulse: {
    initial: { scale: 1, opacity: 1 },
    animate: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity
      }
    }
  }
}

// Composant Ripple Effect Africain
export const AfricanRipple: React.FC<AfricanRippleProps> = ({
  children,
  className = '',
  color = 'earth',
  size = 'md',
  disabled = false,
  onClick
}) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number; size: number }>>([])
  const rippleRef = useRef<HTMLDivElement>(null)

  const handleClick = useCallback((event: React.MouseEvent) => {
    if (disabled) return

    const rect = rippleRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const rippleSize = Math.max(rect.width, rect.height) * 2

    const newRipple = {
      id: Date.now(),
      x,
      y,
      size: rippleSize
    }

    setRipples(prev => [...prev, newRipple])

    // Supprimer le ripple après l'animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
    }, 600)

    onClick?.(event)
  }, [disabled, onClick])

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <div
      ref={rippleRef}
      className={`relative overflow-hidden cursor-pointer ${sizeClasses[size]} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      onClick={handleClick}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {children}
      
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: ripple.x - ripple.size / 2,
              top: ripple.y - ripple.size / 2,
              width: ripple.size,
              height: ripple.size,
              backgroundColor: AFRICAN_COLORS[color]
            }}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Composant Pulse Africain
export const AfricanPulse: React.FC<AfricanPulseProps> = ({
  children,
  className = '',
  intensity = 'normal',
  speed = 'normal',
  color
}) => {
  const intensityValues = {
    subtle: { scale: [1, 1.02, 1], opacity: [1, 0.9, 1] },
    normal: { scale: [1, 1.05, 1], opacity: [1, 0.8, 1] },
    strong: { scale: [1, 1.1, 1], opacity: [1, 0.7, 1] }
  }

  const speedValues = {
    slow: 3,
    normal: 2,
    fast: 1
  }

  return (
    <motion.div
      className={`${className}`}
      initial={{ scale: 1, opacity: 1 }}
      animate={intensityValues[intensity]}
      transition={{
        duration: speedValues[speed],
        ease: "easeInOut",
        repeat: Infinity
      }}
      style={color ? { color } : {}}
    >
      {children}
    </motion.div>
  )
}

// Composant Hover Effect Africain
export const AfricanHoverEffect: React.FC<AfricanHoverEffectProps> = ({
  children,
  className = '',
  effect = 'lift',
  intensity = 1
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const effects = {
    lift: {
      y: isHovered ? -4 * intensity : 0,
      scale: isHovered ? 1 + 0.02 * intensity : 1,
      boxShadow: isHovered 
        ? `0 ${8 * intensity}px ${16 * intensity}px rgba(139, 69, 19, 0.15)`
        : '0 2px 4px rgba(139, 69, 19, 0.05)'
    },
    glow: {
      boxShadow: isHovered
        ? `0 0 ${20 * intensity}px rgba(139, 69, 19, 0.3)`
        : '0 0 0 rgba(139, 69, 19, 0)'
    },
    pattern: {
      backgroundImage: isHovered
        ? 'radial-gradient(circle at 25% 25%, rgba(139, 69, 19, 0.1) 2px, transparent 2px)'
        : 'none',
      backgroundSize: '30px 30px'
    },
    dance: {
      y: isHovered ? [-2, -4, -2] : 0,
      rotate: isHovered ? [0, 1, -1, 0] : 0
    }
  }

  return (
    <motion.div
      className={`${className}`}
      animate={effects[effect]}
      transition={{
        type: effect === 'dance' ? 'spring' : 'tween',
        stiffness: 200,
        damping: 20,
        duration: effect === 'dance' ? 0.6 : 0.3
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </motion.div>
  )
}

// Composant Loading Africain
export const AfricanLoading: React.FC<AfricanLoadingProps> = ({
  size = 'md',
  color = 'earth',
  type = 'spinner',
  text
}) => {
  const sizes = {
    sm: { width: 20, height: 20, text: 'text-sm' },
    md: { width: 32, height: 32, text: 'text-base' },
    lg: { width: 48, height: 48, text: 'text-lg' }
  }

  const colors = {
    earth: '#8B4513',
    terracotta: '#DC2626',
    ochre: '#F59E0B',
    saffron: '#F97316'
  }

  const renderLoader = () => {
    switch (type) {
      case 'spinner':
        return (
          <motion.div
            className="border-4 border-gray-200 rounded-full"
            style={{
              width: sizes[size].width,
              height: sizes[size].height,
              borderTopColor: colors[color]
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, ease: "linear", repeat: Infinity }}
          />
        )

      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="rounded-full"
                style={{
                  width: sizes[size].width / 3,
                  height: sizes[size].width / 3,
                  backgroundColor: colors[color]
                }}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        )

      case 'wave':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
                className="rounded-full"
                style={{
                  width: 4,
                  height: sizes[size].height,
                  backgroundColor: colors[color]
                }}
                animate={{
                  scaleY: [1, 2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.1
                }}
              />
            ))}
          </div>
        )

      case 'weave':
        return (
          <motion.div
            className="rounded-lg"
            style={{
              width: sizes[size].width,
              height: sizes[size].height,
              backgroundImage: `
                linear-gradient(45deg, ${colors[color]} 25%, transparent 25%),
                linear-gradient(-45deg, ${colors[color]} 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, ${colors[color]} 75%),
                linear-gradient(-45deg, transparent 75%, ${colors[color]} 75%)
              `,
              backgroundSize: '8px 8px',
              backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
            }}
            animate={{
              backgroundPosition: [
                '0 0, 0 4px, 4px -4px, -4px 0px',
                '8px 8px, 8px 12px, 12px 4px, 4px 8px'
              ]
            }}
            transition={{
              duration: 2,
              ease: "linear",
              repeat: Infinity
            }}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      {renderLoader()}
      {text && (
        <motion.p
          className={`text-gray-600 ${sizes[size].text}`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}

// Composant Toast Africain
export const AfricanToast: React.FC<AfricanToastProps> = ({
  message,
  type = 'info',
  duration = 4000,
  position = 'top',
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose?.(), 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const typeStyles = {
    info: {
      bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
      icon: '💡',
      pattern: 'rgba(59, 130, 246, 0.1)'
    },
    success: {
      bg: 'bg-gradient-to-r from-green-500 to-green-600',
      icon: '✅',
      pattern: 'rgba(34, 197, 94, 0.1)'
    },
    warning: {
      bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      icon: '⚠️',
      pattern: 'rgba(245, 158, 11, 0.1)'
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500 to-red-600',
      icon: '❌',
      pattern: 'rgba(239, 68, 68, 0.1)'
    }
  }

  const positionClasses = {
    top: 'top-4',
    bottom: 'bottom-4',
    center: 'top-1/2 transform -translate-y-1/2'
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed left-1/2 transform -translate-x-1/2 ${positionClasses[position]} z-50`}
          initial={{ opacity: 0, y: position === 'bottom' ? 50 : -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: position === 'bottom' ? 50 : -50, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div
            className={`
              ${typeStyles[type].bg} text-white px-6 py-4 rounded-xl shadow-lg
              max-w-md mx-4 relative overflow-hidden
            `}
          >
            {/* Motif de fond */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, ${typeStyles[type].pattern} 2px, transparent 2px)`,
                backgroundSize: '20px 20px'
              }}
            />
            
            {/* Contenu */}
            <div className="relative flex items-center space-x-3">
              <span className="text-xl">{typeStyles[type].icon}</span>
              <p className="font-medium">{message}</p>
              <button
                onClick={() => setIsVisible(false)}
                className="ml-auto text-white hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* Barre de progression */}
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-white bg-opacity-30"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: duration / 1000, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook pour les micro-interactions
export const useAfricanMicroInteractions = () => {
  const [toasts, setToasts] = useState<Array<{ id: number; props: AfricanToastProps }>>([])

  const showToast = useCallback((props: Omit<AfricanToastProps, 'onClose'>) => {
    const id = Date.now()
    const toast = {
      id,
      props: {
        ...props,
        onClose: () => {
          setToasts(prev => prev.filter(t => t.id !== id))
        }
      }
    }
    setToasts(prev => [...prev, toast])
  }, [])

  const showSuccess = useCallback((message: string) => {
    showToast({ message, type: 'success' })
  }, [showToast])

  const showError = useCallback((message: string) => {
    showToast({ message, type: 'error' })
  }, [showToast])

  const showWarning = useCallback((message: string) => {
    showToast({ message, type: 'warning' })
  }, [showToast])

  const showInfo = useCallback((message: string) => {
    showToast({ message, type: 'info' })
  }, [showToast])

  const ToastContainer = useCallback(() => (
    <>
      {toasts.map(toast => (
        <AfricanToast key={toast.id} {...toast.props} />
      ))}
    </>
  ), [toasts])

  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    ToastContainer
  }
}

// Composant de démonstration
export const AfricanMicroInteractionsDemo: React.FC = () => {
  const { showSuccess, showError, showWarning, showInfo, ToastContainer } = useAfricanMicroInteractions()

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-amber-50 to-orange-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-amber-800 mb-8">
        🎨 Micro-interactions Africaines
      </h1>

      {/* Ripple Effects */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-amber-700">Effets Ripple</h2>
        <div className="flex space-x-4">
          {(['earth', 'terracotta', 'ochre', 'saffron'] as const).map(color => (
            <AfricanRipple
              key={color}
              color={color}
              className="px-6 py-3 bg-white rounded-lg shadow-md border-2 border-amber-200"
            >
              Cliquez-moi ({color})
            </AfricanRipple>
          ))}
        </div>
      </div>

      {/* Pulse Effects */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-amber-700">Effets Pulse</h2>
        <div className="flex space-x-4">
          {(['subtle', 'normal', 'strong'] as const).map(intensity => (
            <AfricanPulse
              key={intensity}
              intensity={intensity}
              className="px-6 py-3 bg-white rounded-lg shadow-md border-2 border-amber-200"
            >
              Pulse {intensity}
            </AfricanPulse>
          ))}
        </div>
      </div>

      {/* Hover Effects */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-amber-700">Effets Hover</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(['lift', 'glow', 'pattern', 'dance'] as const).map(effect => (
            <AfricanHoverEffect
              key={effect}
              effect={effect}
              className="px-6 py-3 bg-white rounded-lg shadow-md border-2 border-amber-200 text-center cursor-pointer"
            >
              Hover {effect}
            </AfricanHoverEffect>
          ))}
        </div>
      </div>

      {/* Loading States */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-amber-700">États de Chargement</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {(['spinner', 'dots', 'wave', 'weave'] as const).map(type => (
            <div key={type} className="text-center">
              <AfricanLoading type={type} size="md" color="earth" text={`Loading ${type}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Toast Buttons */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-amber-700">Notifications Toast</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => showSuccess('Opération réussie !')}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Succès
          </button>
          <button
            onClick={() => showError('Une erreur est survenue')}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Erreur
          </button>
          <button
            onClick={() => showWarning('Attention requise')}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Avertissement
          </button>
          <button
            onClick={() => showInfo('Information importante')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Info
          </button>
        </div>
      </div>

      <ToastContainer />
    </div>
  )
}

export default {
  AfricanRipple,
  AfricanPulse,
  AfricanHoverEffect,
  AfricanLoading,
  AfricanToast,
  useAfricanMicroInteractions,
  AfricanMicroInteractionsDemo
}

