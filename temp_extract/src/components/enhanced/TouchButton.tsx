/**
 * TouchButton - Boutons optimisés pour interfaces tactiles
 * Feedback haptique visuel, zones de contact élargies, micro-animations
 * Part of AfricaSuite PMS 2025 - UX Refactoring Phase 1
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Button, ButtonProps } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

const touchButtonVariants = cva(
  "tap-target transition-elegant relative overflow-hidden active:scale-95",
  {
    variants: {
      touchSize: {
        comfortable: "min-h-[48px] min-w-[48px] px-4 py-3", // iOS/Android guidelines
        spacious: "min-h-[56px] min-w-[56px] px-6 py-4",    // Material Design
        compact: "min-h-[40px] min-w-[40px] px-3 py-2"      // Dense interfaces
      },
      feedback: {
        subtle: "hover:shadow-soft active:shadow-none",
        prominent: "hover:shadow-elevate hover:scale-102 active:shadow-soft",
        haptic: "hover:shadow-luxury hover:scale-105 active:scale-95 active:shadow-soft"
      },
      shape: {
        rounded: "rounded-lg",
        circular: "rounded-full aspect-square",
        pill: "rounded-full",
        square: "rounded-lg aspect-square"
      },
      intent: {
        primary: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-soft",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        accent: "bg-accent text-accent-foreground hover:bg-accent-hover",
        success: "bg-success text-success-foreground hover:bg-success/90",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90", 
        danger: "bg-danger text-danger-foreground hover:bg-danger/90",
        ghost: "hover:bg-muted/50 active:bg-muted",
        outline: "border-2 border-current hover:bg-current/10"
      },
      loading: {
        none: "",
        spinner: "cursor-wait",
        pulse: "animate-pulse cursor-wait"
      }
    },
    defaultVariants: {
      touchSize: "comfortable",
      feedback: "prominent", 
      shape: "rounded",
      intent: "primary",
      loading: "none"
    }
  }
);

export interface TouchButtonProps extends Omit<ButtonProps, 'size' | 'variant'>, VariantProps<typeof touchButtonVariants> {
  // Contenu enrichi
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right' | 'only';
  badge?: string | number;
  
  // États d'interaction
  isLoading?: boolean;
  loadingText?: string;
  
  // Feedback visuel
  ripple?: boolean;
  hapticFeedback?: boolean;
  
  // Personnalisation tactile
  longPressAction?: () => void;
  longPressDuration?: number;
  
  // Accessibilité renforcée
  tooltip?: string;
  shortcut?: string;
  
  children?: React.ReactNode;
}

export function TouchButton({
  // Props TouchButton
  touchSize = "comfortable",
  feedback = "prominent",
  shape = "rounded", 
  intent = "primary",
  loading: loadingVariant = "none",
  icon: Icon,
  iconPosition = "left",
  badge,
  isLoading = false,
  loadingText,
  ripple = true,
  hapticFeedback = true,
  longPressAction,
  longPressDuration = 800,
  tooltip,
  shortcut,
  
  // Props standard Button
  children,
  className,
  disabled,
  onClick,
  onMouseDown,
  onMouseUp,
  onTouchStart,
  onTouchEnd,
  ...props
}: TouchButtonProps) {
  
  const [isPressed, setIsPressed] = React.useState(false);
  const [rippleEffect, setRippleEffect] = React.useState<{ x: number; y: number; id: number } | null>(null);
  const longPressTimer = React.useRef<NodeJS.Timeout>();
  const rippleCounter = React.useRef(0);

  // Gestion du long press
  const handlePressStart = (event: React.MouseEvent | React.TouchEvent) => {
    setIsPressed(true);
    
    if (longPressAction && !disabled) {
      longPressTimer.current = setTimeout(() => {
        longPressAction();
        if (hapticFeedback && 'vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }, longPressDuration);
    }
    
    // Effet ripple
    if (ripple && !disabled) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = 'touches' in event ? event.touches[0].clientX - rect.left : event.clientX - rect.left;
      const y = 'touches' in event ? event.touches[0].clientY - rect.top : event.clientY - rect.top;
      
      setRippleEffect({ x, y, id: ++rippleCounter.current });
      
      // Clear ripple after animation
      setTimeout(() => setRippleEffect(null), 600);
    }

    // Gestion événements originaux
    if ('touches' in event) {
      onTouchStart?.(event as React.TouchEvent<HTMLButtonElement>);
    } else {
      onMouseDown?.(event as React.MouseEvent<HTMLButtonElement>);
    }
  };

  const handlePressEnd = (event: React.MouseEvent | React.TouchEvent) => {
    setIsPressed(false);
    
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    // Gestion événements originaux  
    if ('touches' in event) {
      onTouchEnd?.(event as React.TouchEvent<HTMLButtonElement>);
    } else {
      onMouseUp?.(event as React.MouseEvent<HTMLButtonElement>);
    }
  };

  const handleClick = (event: React.MouseEvent) => {
    if (disabled || isLoading) return;
    
    // Feedback haptique subtil
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    onClick?.(event as React.MouseEvent<HTMLButtonElement>);
  };

  const isLoadingState = isLoading || loadingVariant !== "none";
  const showIcon = Icon && iconPosition !== 'only';
  const iconOnly = Icon && iconPosition === 'only';

  return (
    <Button
      className={cn(
        touchButtonVariants({ 
          touchSize, 
          feedback, 
          shape, 
          intent, 
          loading: isLoading ? loadingVariant : "none" 
        }),
        "relative select-none",
        isPressed && feedback === "haptic" && "scale-95",
        className
      )}
      disabled={disabled || isLoadingState}
      onClick={handleClick}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      title={tooltip}
      aria-label={props['aria-label'] || (iconOnly ? String(children) : undefined)}
      {...props}
    >
      {/* Effet ripple */}
      {rippleEffect && (
        <span
          className="absolute bg-white/30 rounded-full animate-ping pointer-events-none"
          style={{
            left: rippleEffect.x - 10,
            top: rippleEffect.y - 10,
            width: 20,
            height: 20,
            animationDuration: '600ms'
          }}
        />
      )}

      {/* Contenu principal */}
      <div className="flex items-center justify-center gap-2 relative z-10">
        {/* Icône à gauche */}
        {showIcon && iconPosition === 'left' && (
          <Icon className={cn(
            iconOnly ? "w-5 h-5" : "w-4 h-4",
            isLoading && "opacity-50"
          )} />
        )}
        
        {/* Spinner de chargement */}
        {isLoading && loadingVariant === "spinner" && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        
        {/* Texte */}
        {!iconOnly && (
          <span className={cn(
            "font-medium",
            isLoading && "opacity-75"
          )}>
            {isLoading && loadingText ? loadingText : children}
          </span>
        )}
        
        {/* Icône à droite */}
        {showIcon && iconPosition === 'right' && (
          <Icon className={cn(
            "w-4 h-4",
            isLoading && "opacity-50"
          )} />
        )}
      </div>

      {/* Badge notification */}
      {badge && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-danger text-danger-foreground text-xs rounded-full flex items-center justify-center font-bold z-20">
          {badge}
        </span>
      )}

      {/* Indicateur raccourci clavier */}
      {shortcut && (
        <span className="absolute bottom-1 right-1 text-xs opacity-60 font-mono">
          {shortcut}
        </span>
      )}
    </Button>
  );
}

// Variants pré-configurés pour actions communes
export const PrimaryTouchButton = (props: Omit<TouchButtonProps, 'intent'>) => (
  <TouchButton {...props} intent="primary" />
);

export const SecondaryTouchButton = (props: Omit<TouchButtonProps, 'intent'>) => (
  <TouchButton {...props} intent="secondary" />
);

export const FloatingActionButton = (props: Omit<TouchButtonProps, 'shape' | 'touchSize'>) => (
  <TouchButton {...props} shape="circular" touchSize="spacious" feedback="haptic" />
);

export const QuickActionButton = (props: Omit<TouchButtonProps, 'touchSize' | 'feedback'>) => (
  <TouchButton {...props} touchSize="compact" feedback="subtle" />
);

export const DangerTouchButton = (props: Omit<TouchButtonProps, 'intent'>) => (
  <TouchButton {...props} intent="danger" />
);