/**
 * Composant Bouton Africain Authentique
 * Boutons avec design inspiré de l'artisanat africain
 */

import React from 'react'
import { cn } from '@/lib/utils'
import { Button, ButtonProps } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface AfricanButtonProps extends Omit<ButtonProps, 'variant' | 'size'> {
  variant?: 'primary' | 'secondary' | 'accent' | 'earth' | 'sunset' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  pattern?: 'none' | 'subtle' | 'border'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  haptic?: boolean
}

export function AfricanButton({
  children,
  className,
  variant = 'primary',
  size = 'md',
  pattern = 'none',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  haptic = true,
  disabled,
  onClick,
  ...props
}: AfricanButtonProps) {
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Feedback haptique sur mobile
    if (haptic && 'vibrate' in navigator && !disabled) {
      navigator.vibrate(50)
    }
    
    onClick?.(e)
  }

  const baseClasses = cn(
    // Styles de base
    'relative overflow-hidden',
    'font-medium tracking-wide',
    'transition-all duration-300 ease-in-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'active:scale-95',
    
    // Largeur complète
    fullWidth && 'w-full',
    
    // Tailles
    {
      'px-3 py-2 text-sm min-h-[2rem] rounded-md': size === 'sm',
      'px-4 py-2.5 text-base min-h-[2.5rem] rounded-md': size === 'md',
      'px-6 py-3 text-lg min-h-[3rem] rounded-lg': size === 'lg',
      'px-8 py-4 text-xl min-h-[3.5rem] rounded-lg': size === 'xl'
    },
    
    // Variants de couleur
    {
      // Primary - Terre cuite africaine
      'bg-gradient-to-r from-african-primary-500 to-african-primary-600 text-white border border-african-primary-600 hover:from-african-primary-600 hover:to-african-primary-700 hover:shadow-lg hover:-translate-y-0.5 focus:ring-african-primary-500': 
        variant === 'primary',
      
      // Secondary - Or africain
      'bg-gradient-to-r from-african-secondary-100 to-african-secondary-200 text-african-secondary-800 border border-african-secondary-300 hover:from-african-secondary-200 hover:to-african-secondary-300 hover:shadow-md focus:ring-african-secondary-400': 
        variant === 'secondary',
      
      // Accent - Coucher de soleil
      'bg-gradient-to-r from-african-accent-500 to-african-accent-600 text-white border border-african-accent-600 hover:from-african-accent-600 hover:to-african-accent-700 hover:shadow-lg hover:scale-105 focus:ring-african-accent-500': 
        variant === 'accent',
      
      // Earth - Tons terre
      'bg-gradient-to-r from-african-earth-clay to-african-earth-sienna text-white border border-african-earth-clay hover:shadow-lg hover:-translate-y-0.5 focus:ring-african-earth-clay': 
        variant === 'earth',
      
      // Sunset - Dégradé coucher de soleil
      'bg-gradient-to-r from-african-nature-sunset to-african-accent-500 text-white border-0 hover:shadow-xl hover:scale-105 focus:ring-african-accent-500': 
        variant === 'sunset',
      
      // Outline - Contour africain
      'bg-transparent text-african-primary-600 border-2 border-african-primary-500 hover:bg-african-primary-50 hover:border-african-primary-600 hover:text-african-primary-700 focus:ring-african-primary-500': 
        variant === 'outline',
      
      // Ghost - Transparent
      'bg-transparent text-african-primary-600 border-0 hover:bg-african-primary-50 hover:text-african-primary-700 focus:ring-african-primary-500': 
        variant === 'ghost',
      
      // Destructive - Rouge latérite
      'bg-gradient-to-r from-african-error-500 to-african-error-600 text-white border border-african-error-600 hover:from-african-error-600 hover:to-african-error-700 hover:shadow-lg focus:ring-african-error-500': 
        variant === 'destructive'
    },
    
    // Motifs décoratifs
    {
      'african-pattern-subtle': pattern === 'subtle',
      'african-border-pattern': pattern === 'border'
    },
    
    className
  )

  return (
    <Button
      className={baseClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {/* Motif de fond décoratif pour certains variants */}
      {(variant === 'primary' || variant === 'accent') && pattern === 'subtle' && (
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml;base64,${btoa(`
              <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 10L10 0L20 10L10 20Z" stroke="white" stroke-width="0.5" fill="none"/>
              </svg>
            `)}")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '20px 20px'
          }}
        />
      )}
      
      {/* Contenu du bouton */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {/* Icône à gauche */}
        {icon && iconPosition === 'left' && !loading && (
          <span className="flex-shrink-0">
            {icon}
          </span>
        )}
        
        {/* Indicateur de chargement */}
        {loading && (
          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
        )}
        
        {/* Texte */}
        {children && (
          <span className={cn(
            'font-body',
            size === 'xl' && 'font-heading'
          )}>
            {children}
          </span>
        )}
        
        {/* Icône à droite */}
        {icon && iconPosition === 'right' && !loading && (
          <span className="flex-shrink-0">
            {icon}
          </span>
        )}
      </span>
      
      {/* Effet de brillance au hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-10 transition-opacity duration-300 -skew-x-12 transform translate-x-[-100%] hover:translate-x-[100%] pointer-events-none" />
    </Button>
  )
}

// Bouton d'action flottant africain
export function AfricanFloatingButton({
  children,
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: Omit<AfricanButtonProps, 'fullWidth'>) {
  return (
    <AfricanButton
      className={cn(
        'fixed bottom-6 right-6 z-50',
        'rounded-full shadow-xl',
        'hover:shadow-2xl hover:scale-110',
        {
          'w-12 h-12': size === 'sm',
          'w-14 h-14': size === 'md',
          'w-16 h-16': size === 'lg',
          'w-20 h-20': size === 'xl'
        },
        className
      )}
      variant={variant}
      size={size}
      pattern="subtle"
      {...props}
    >
      {children}
    </AfricanButton>
  )
}

// Groupe de boutons africains
export function AfricanButtonGroup({
  children,
  className,
  orientation = 'horizontal',
  ...props
}: {
  children: React.ReactNode
  className?: string
  orientation?: 'horizontal' | 'vertical'
}) {
  return (
    <div
      className={cn(
        'flex',
        {
          'flex-row space-x-2': orientation === 'horizontal',
          'flex-col space-y-2': orientation === 'vertical'
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Bouton avec icône africaine
export function AfricanIconButton({
  icon,
  tooltip,
  className,
  size = 'md',
  variant = 'ghost',
  ...props
}: Omit<AfricanButtonProps, 'children'> & {
  icon: React.ReactNode
  tooltip?: string
}) {
  return (
    <AfricanButton
      className={cn(
        'aspect-square p-0',
        {
          'w-8 h-8': size === 'sm',
          'w-10 h-10': size === 'md',
          'w-12 h-12': size === 'lg',
          'w-14 h-14': size === 'xl'
        },
        className
      )}
      variant={variant}
      size={size}
      title={tooltip}
      {...props}
    >
      {icon}
    </AfricanButton>
  )
}

// Export des composants
export {
  AfricanFloatingButton,
  AfricanButtonGroup,
  AfricanIconButton
}

