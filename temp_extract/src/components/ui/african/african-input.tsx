/**
 * Composants Input Africains
 * Champs de saisie avec design culturel africain
 */

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Eye, EyeOff, Search, X } from 'lucide-react'

interface AfricanInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'filled' | 'outline' | 'earth'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  error?: string
  success?: boolean
  label?: string
  helper?: string
  clearable?: boolean
  onClear?: () => void
}

interface AfricanTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'filled' | 'outline' | 'earth'
  size?: 'sm' | 'md' | 'lg'
  error?: string
  success?: boolean
  label?: string
  helper?: string
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

interface AfricanSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  variant?: 'default' | 'filled' | 'outline' | 'earth'
  size?: 'sm' | 'md' | 'lg'
  error?: string
  success?: boolean
  label?: string
  helper?: string
  placeholder?: string
  children: React.ReactNode
}

// Composant Input principal
export const AfricanInput = forwardRef<HTMLInputElement, AfricanInputProps>(({
  className,
  variant = 'default',
  size = 'md',
  icon,
  iconPosition = 'left',
  error,
  success,
  label,
  helper,
  clearable,
  onClear,
  type,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  const baseClasses = cn(
    // Styles de base
    'w-full transition-all duration-200 font-body',
    'border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'placeholder:text-african-neutral-400',
    
    // Tailles
    {
      'px-3 py-2 text-sm': size === 'sm',
      'px-4 py-2.5 text-base': size === 'md',
      'px-5 py-3 text-lg': size === 'lg'
    },
    
    // Variants
    {
      // Default
      'bg-white border-african-neutral-300 focus:border-african-primary-500 focus:ring-african-primary-500/20': 
        variant === 'default' && !error && !success,
      
      // Filled
      'bg-african-neutral-50 border-african-neutral-200 focus:bg-white focus:border-african-primary-500 focus:ring-african-primary-500/20': 
        variant === 'filled' && !error && !success,
      
      // Outline
      'bg-transparent border-2 border-african-primary-300 focus:border-african-primary-500 focus:ring-african-primary-500/20': 
        variant === 'outline' && !error && !success,
      
      // Earth
      'bg-african-earth-sand border-african-earth-clay focus:border-african-primary-500 focus:ring-african-primary-500/20': 
        variant === 'earth' && !error && !success,
      
      // États d'erreur
      'border-african-error-500 focus:border-african-error-500 focus:ring-african-error-500/20': error,
      
      // États de succès
      'border-african-success-500 focus:border-african-success-500 focus:ring-african-success-500/20': success
    },
    
    // Espacement pour les icônes
    {
      'pl-10': icon && iconPosition === 'left' && size === 'sm',
      'pl-11': icon && iconPosition === 'left' && size === 'md',
      'pl-12': icon && iconPosition === 'left' && size === 'lg',
      'pr-10': (icon && iconPosition === 'right') || clearable || isPassword,
      'pr-16': (icon && iconPosition === 'right' && clearable) || (isPassword && clearable)
    },
    
    className
  )

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-african-neutral-700 mb-1">
          {label}
        </label>
      )}
      
      {/* Container pour l'input et les icônes */}
      <div className="relative">
        {/* Icône à gauche */}
        {icon && iconPosition === 'left' && (
          <div className={cn(
            'absolute left-0 top-0 h-full flex items-center justify-center text-african-neutral-400',
            {
              'w-10': size === 'sm',
              'w-11': size === 'md',
              'w-12': size === 'lg'
            }
          )}>
            {icon}
          </div>
        )}
        
        {/* Input */}
        <input
          ref={ref}
          type={inputType}
          className={baseClasses}
          {...props}
        />
        
        {/* Icônes à droite */}
        <div className="absolute right-0 top-0 h-full flex items-center">
          {/* Bouton clear */}
          {clearable && props.value && (
            <button
              type="button"
              onClick={onClear}
              className="p-2 text-african-neutral-400 hover:text-african-neutral-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          
          {/* Toggle password visibility */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-2 text-african-neutral-400 hover:text-african-neutral-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
          
          {/* Icône à droite */}
          {icon && iconPosition === 'right' && !clearable && !isPassword && (
            <div className="p-2 text-african-neutral-400">
              {icon}
            </div>
          )}
        </div>
      </div>
      
      {/* Messages d'aide et d'erreur */}
      {(helper || error) && (
        <div className="mt-1">
          {error && (
            <p className="text-sm text-african-error-600">
              {error}
            </p>
          )}
          {helper && !error && (
            <p className="text-sm text-african-neutral-500">
              {helper}
            </p>
          )}
        </div>
      )}
    </div>
  )
})

AfricanInput.displayName = 'AfricanInput'

// Composant Textarea
export const AfricanTextarea = forwardRef<HTMLTextAreaElement, AfricanTextareaProps>(({
  className,
  variant = 'default',
  size = 'md',
  error,
  success,
  label,
  helper,
  resize = 'vertical',
  ...props
}, ref) => {
  const baseClasses = cn(
    // Styles de base
    'w-full transition-all duration-200 font-body',
    'border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'placeholder:text-african-neutral-400',
    
    // Redimensionnement
    {
      'resize-none': resize === 'none',
      'resize-y': resize === 'vertical',
      'resize-x': resize === 'horizontal',
      'resize': resize === 'both'
    },
    
    // Tailles
    {
      'px-3 py-2 text-sm min-h-[80px]': size === 'sm',
      'px-4 py-2.5 text-base min-h-[100px]': size === 'md',
      'px-5 py-3 text-lg min-h-[120px]': size === 'lg'
    },
    
    // Variants (mêmes que Input)
    {
      'bg-white border-african-neutral-300 focus:border-african-primary-500 focus:ring-african-primary-500/20': 
        variant === 'default' && !error && !success,
      'bg-african-neutral-50 border-african-neutral-200 focus:bg-white focus:border-african-primary-500 focus:ring-african-primary-500/20': 
        variant === 'filled' && !error && !success,
      'bg-transparent border-2 border-african-primary-300 focus:border-african-primary-500 focus:ring-african-primary-500/20': 
        variant === 'outline' && !error && !success,
      'bg-african-earth-sand border-african-earth-clay focus:border-african-primary-500 focus:ring-african-primary-500/20': 
        variant === 'earth' && !error && !success,
      'border-african-error-500 focus:border-african-error-500 focus:ring-african-error-500/20': error,
      'border-african-success-500 focus:border-african-success-500 focus:ring-african-success-500/20': success
    },
    
    className
  )

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-african-neutral-700 mb-1">
          {label}
        </label>
      )}
      
      <textarea
        ref={ref}
        className={baseClasses}
        {...props}
      />
      
      {(helper || error) && (
        <div className="mt-1">
          {error && (
            <p className="text-sm text-african-error-600">
              {error}
            </p>
          )}
          {helper && !error && (
            <p className="text-sm text-african-neutral-500">
              {helper}
            </p>
          )}
        </div>
      )}
    </div>
  )
})

AfricanTextarea.displayName = 'AfricanTextarea'

// Composant Select
export const AfricanSelect = forwardRef<HTMLSelectElement, AfricanSelectProps>(({
  className,
  variant = 'default',
  size = 'md',
  error,
  success,
  label,
  helper,
  placeholder,
  children,
  ...props
}, ref) => {
  const baseClasses = cn(
    // Styles de base
    'w-full transition-all duration-200 font-body appearance-none cursor-pointer',
    'border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'bg-white bg-no-repeat bg-right',
    
    // Flèche personnalisée
    `bg-[url("data:image/svg+xml;base64,${btoa(`
      <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 1L6 6L11 1" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `)}")]`,
    
    // Tailles
    {
      'px-3 py-2 pr-8 text-sm': size === 'sm',
      'px-4 py-2.5 pr-10 text-base': size === 'md',
      'px-5 py-3 pr-12 text-lg': size === 'lg'
    },
    
    // Variants (mêmes que Input)
    {
      'border-african-neutral-300 focus:border-african-primary-500 focus:ring-african-primary-500/20': 
        variant === 'default' && !error && !success,
      'bg-african-neutral-50 border-african-neutral-200 focus:bg-white focus:border-african-primary-500 focus:ring-african-primary-500/20': 
        variant === 'filled' && !error && !success,
      'bg-transparent border-2 border-african-primary-300 focus:border-african-primary-500 focus:ring-african-primary-500/20': 
        variant === 'outline' && !error && !success,
      'bg-african-earth-sand border-african-earth-clay focus:border-african-primary-500 focus:ring-african-primary-500/20': 
        variant === 'earth' && !error && !success,
      'border-african-error-500 focus:border-african-error-500 focus:ring-african-error-500/20': error,
      'border-african-success-500 focus:border-african-success-500 focus:ring-african-success-500/20': success
    },
    
    className
  )

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-african-neutral-700 mb-1">
          {label}
        </label>
      )}
      
      <select
        ref={ref}
        className={baseClasses}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      
      {(helper || error) && (
        <div className="mt-1">
          {error && (
            <p className="text-sm text-african-error-600">
              {error}
            </p>
          )}
          {helper && !error && (
            <p className="text-sm text-african-neutral-500">
              {helper}
            </p>
          )}
        </div>
      )}
    </div>
  )
})

AfricanSelect.displayName = 'AfricanSelect'

// Composant de recherche spécialisé
export function AfricanSearchInput({
  onSearch,
  placeholder = "Rechercher...",
  className,
  ...props
}: Omit<AfricanInputProps, 'icon' | 'iconPosition'> & {
  onSearch?: (value: string) => void
}) {
  const [value, setValue] = React.useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(value)
  }

  const handleClear = () => {
    setValue('')
    onSearch?.('')
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <AfricanInput
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        icon={<Search className="w-4 h-4" />}
        iconPosition="left"
        clearable={value.length > 0}
        onClear={handleClear}
        {...props}
      />
    </form>
  )
}

// Export des composants
export { AfricanInput as default }

