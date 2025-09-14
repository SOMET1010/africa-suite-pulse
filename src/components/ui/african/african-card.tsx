/**
 * Composant Carte Africaine Authentique
 * Carte avec motifs bogolan/kita et design culturel
 */

import React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface AfricanCardProps {
  children?: React.ReactNode
  className?: string
  variant?: 'default' | 'pattern' | 'accent' | 'earth' | 'sunset'
  pattern?: 'bogolan' | 'kita' | 'none'
  patternIntensity?: 'light' | 'medium' | 'strong'
  hover?: boolean
  onClick?: () => void
}

interface AfricanCardHeaderProps {
  children: React.ReactNode
  className?: string
  pattern?: boolean
}

interface AfricanCardContentProps {
  children: React.ReactNode
  className?: string
}

interface AfricanCardFooterProps {
  children: React.ReactNode
  className?: string
}

// Composant principal AfricanCard
export function AfricanCard({ 
  children, 
  className, 
  variant = 'default',
  pattern = 'none',
  patternIntensity = 'light',
  hover = true,
  onClick,
  ...props 
}: AfricanCardProps) {
  const baseClasses = cn(
    // Styles de base
    'relative overflow-hidden',
    'bg-gradient-to-br from-african-neutral-50 to-african-neutral-100',
    'border border-african-neutral-200',
    'rounded-lg shadow-sm',
    'transition-all duration-300 ease-in-out',
    
    // Variants de couleur
    {
      'border-l-4 border-l-african-primary-500 bg-gradient-to-br from-african-primary-25 to-african-primary-50': 
        variant === 'accent',
      'bg-gradient-to-br from-african-earth-sand to-african-neutral-100 border-african-earth-clay': 
        variant === 'earth',
      'bg-gradient-to-br from-african-accent-50 to-african-accent-100 border-african-accent-200': 
        variant === 'sunset'
    },
    
    // Effets de hover
    hover && [
      'hover:shadow-md hover:-translate-y-1',
      'hover:border-african-primary-300',
      'cursor-pointer'
    ],
    
    // Motifs de fond
    {
      'african-pattern-overlay-light': pattern === 'bogolan' && patternIntensity === 'light',
      'african-pattern-overlay-medium': pattern === 'bogolan' && patternIntensity === 'medium',
      'african-pattern-kita-light': pattern === 'kita' && patternIntensity === 'light',
      'african-pattern-kita-medium': pattern === 'kita' && patternIntensity === 'medium'
    },
    
    className
  )

  return (
    <Card 
      className={baseClasses} 
      onClick={onClick}
      {...props}
    >
      {/* Motif de fond décoratif */}
      {pattern !== 'none' && (
        <div 
          className={cn(
            'absolute inset-0 pointer-events-none',
            {
              'opacity-5': patternIntensity === 'light',
              'opacity-10': patternIntensity === 'medium',
              'opacity-20': patternIntensity === 'strong'
            }
          )}
          style={{
            backgroundImage: pattern === 'bogolan' 
              ? `url("data:image/svg+xml;base64,${btoa(`
                  <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 20L20 0L40 20L20 40Z" stroke="#D2691E" stroke-width="1" fill="none"/>
                    <circle cx="20" cy="20" r="3" fill="#8B4513"/>
                  </svg>
                `)}")`
              : `url("data:image/svg+xml;base64,${btoa(`
                  <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 0L30 15L15 30L0 15Z" stroke="#D2691E" stroke-width="1" fill="none"/>
                    <circle cx="15" cy="15" r="2" fill="#DAA520"/>
                  </svg>
                `)})"`,
            backgroundRepeat: 'repeat',
            backgroundSize: pattern === 'bogolan' ? '40px 40px' : '30px 30px'
          }}
        />
      )}
      
      {/* Bordure décorative pour variant accent */}
      {variant === 'accent' && (
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-african-primary-400 to-african-primary-600" />
      )}
      
      {children}
    </Card>
  )
}

// Header avec style africain
export function AfricanCardHeader({ 
  children, 
  className, 
  pattern = false,
  ...props 
}: AfricanCardHeaderProps) {
  return (
    <CardHeader 
      className={cn(
        'relative',
        pattern && 'border-b border-african-neutral-200 african-pattern-border',
        className
      )}
      {...props}
    >
      {children}
    </CardHeader>
  )
}

// Titre avec typographie africaine
export function AfricanCardTitle({ 
  children, 
  className,
  ...props 
}: { children: React.ReactNode; className?: string }) {
  return (
    <CardTitle 
      className={cn(
        'font-heading text-african-primary-700',
        'text-xl font-semibold tracking-tight',
        'mb-2',
        className
      )}
      {...props}
    >
      {children}
    </CardTitle>
  )
}

// Description avec style culturel
export function AfricanCardDescription({ 
  children, 
  className,
  ...props 
}: { children: React.ReactNode; className?: string }) {
  return (
    <CardDescription 
      className={cn(
        'text-african-neutral-600',
        'text-sm leading-relaxed',
        className
      )}
      {...props}
    >
      {children}
    </CardDescription>
  )
}

// Contenu principal
export function AfricanCardContent({ 
  children, 
  className,
  ...props 
}: AfricanCardContentProps) {
  return (
    <CardContent 
      className={cn(
        'relative z-10',
        className
      )}
      {...props}
    >
      {children}
    </CardContent>
  )
}

// Footer avec actions
export function AfricanCardFooter({ 
  children, 
  className,
  ...props 
}: AfricanCardFooterProps) {
  return (
    <CardFooter 
      className={cn(
        'relative z-10',
        'border-t border-african-neutral-200',
        'bg-gradient-to-r from-transparent to-african-neutral-25',
        className
      )}
      {...props}
    >
      {children}
    </CardFooter>
  )
}

// Composant de statistique africaine
export function AfricanStatCard({ 
  title, 
  value, 
  description, 
  icon, 
  trend,
  className,
  ...props 
}: {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}) {
  return (
    <AfricanCard 
      variant="accent" 
      pattern="bogolan" 
      patternIntensity="light"
      className={cn('p-6', className)}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-african-neutral-600 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-african-primary-700 font-heading">
            {value}
          </p>
          {description && (
            <p className="text-xs text-african-neutral-500 mt-1">
              {description}
            </p>
          )}
        </div>
        
        {icon && (
          <div className="ml-4 p-3 rounded-full bg-african-primary-100 text-african-primary-600">
            {icon}
          </div>
        )}
      </div>
      
      {trend && (
        <div className={cn(
          'mt-4 flex items-center text-xs',
          {
            'text-african-success-600': trend === 'up',
            'text-african-error-600': trend === 'down',
            'text-african-neutral-500': trend === 'neutral'
          }
        )}>
          <span className="mr-1">
            {trend === 'up' && '↗'}
            {trend === 'down' && '↘'}
            {trend === 'neutral' && '→'}
          </span>
          Tendance {trend === 'up' ? 'positive' : trend === 'down' ? 'négative' : 'stable'}
        </div>
      )}
    </AfricanCard>
  )
}

// Export des composants
export {
  AfricanCardHeader,
  AfricanCardTitle,
  AfricanCardDescription,
  AfricanCardContent,
  AfricanCardFooter,
  AfricanStatCard
}

