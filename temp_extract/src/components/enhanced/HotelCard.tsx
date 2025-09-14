/**
 * HotelCard - Composant carte universel pour entités hôtelières
 * Optimisé pour mobile-first avec variants adaptatifs
 * Part of AfricaSuite PMS 2025 - UX Refactoring Phase 1
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

const hotelCardVariants = cva(
  "tap-target transition-elegant hover:shadow-elevate group cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-card border border-border",
        highlighted: "bg-gradient-to-br from-soft-primary to-soft-accent border-accent-gold",
        urgent: "bg-gradient-to-br from-soft-danger to-soft-warning border-danger",
        success: "bg-gradient-to-br from-soft-success to-soft-info border-success",
        compact: "p-3",
        detailed: "p-4"
      },
      size: {
        sm: "min-h-[120px]",
        md: "min-h-[160px]", 
        lg: "min-h-[200px]",
        auto: "min-h-fit"
      },
      layout: {
        mobile: "grid grid-cols-1 gap-3",
        tablet: "grid grid-cols-2 gap-4",
        desktop: "flex flex-col gap-4"
      },
      interaction: {
        static: "hover:scale-100",
        hoverable: "hover:scale-102",
        pressable: "active:scale-98 hover:scale-102"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      layout: "mobile",
      interaction: "hoverable"
    }
  }
);

const statusVariants = cva(
  "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
  {
    variants: {
      status: {
        // Réservations
        confirmed: "badge-soft--confirmed",
        pending: "badge-soft--option", 
        cancelled: "badge-soft--cancelled",
        // Chambres
        clean: "badge-soft--confirmed",
        dirty: "badge-soft--option",
        maintenance: "badge-soft--cancelled",
        occupied: "badge-soft--present",
        // Staff
        active: "badge-soft--confirmed",
        break: "badge-soft--option",
        offline: "badge-soft--cancelled"
      }
    },
    defaultVariants: {
      status: "confirmed"
    }
  }
);

interface QuickAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'secondary' | 'destructive';
  disabled?: boolean;
}

export interface HotelCardProps extends VariantProps<typeof hotelCardVariants> {
  // Contenu principal
  title: string;
  subtitle?: string;
  description?: string;
  
  // Statut et métadonnées
  status?: VariantProps<typeof statusVariants>['status'];
  statusLabel?: string;
  metadata?: { label: string; value: string | number }[];
  
  // Visuels
  icon?: LucideIcon;
  image?: string;
  color?: string;
  
  // Actions
  onClick?: () => void;
  quickActions?: QuickAction[];
  
  // Personnalisation
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  
  // Accessibilité
  ariaLabel?: string;
  
  // États
  loading?: boolean;
  disabled?: boolean;
  selected?: boolean;
  
  children?: React.ReactNode;
}

export function HotelCard({
  title,
  subtitle,
  description,
  status = 'confirmed',
  statusLabel,
  metadata = [],
  icon: Icon,
  image,
  color,
  onClick,
  quickActions = [],
  className,
  headerClassName,
  contentClassName,
  ariaLabel,
  loading = false,
  disabled = false,
  selected = false,
  children,
  variant = "default",
  size = "md", 
  layout = "mobile",
  interaction = "hoverable",
  ...props
}: HotelCardProps) {
  
  const cardContent = (
    <Card 
      className={cn(
        hotelCardVariants({ variant, size, layout, interaction }),
        selected && "ring-2 ring-accent-gold ring-offset-2",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {/* Header avec statut et actions rapides */}
      <CardHeader className={cn("pb-3 space-y-2", headerClassName)}>
        <div className="flex items-start justify-between gap-3">
          {/* Titre et icône */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {Icon && (
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: color ? `${color}20` : undefined }}
              >
                <Icon 
                  className="w-4 h-4" 
                  style={{ color: color || 'currentColor' }}
                />
              </div>
            )}
            {image && (
              <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                <img src={image} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm text-foreground truncate">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-muted-foreground truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {/* Statut */}
          {(status || statusLabel) && (
            <Badge className={cn(statusVariants({ status }))}>
              {statusLabel || status}
            </Badge>
          )}
        </div>
        
        {/* Actions rapides */}
        {quickActions.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {quickActions.slice(0, 3).map((action, index) => {
              const ActionIcon = action.icon;
              return (
                <Button
                  key={index}
                  variant={action.variant || "outline"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick();
                  }}
                  disabled={action.disabled || disabled}
                  className="h-8 px-2"
                >
                  <ActionIcon className="w-3 h-3 mr-1" />
                  {action.label}
                </Button>
              );
            })}
          </div>
        )}
      </CardHeader>

      {/* Contenu principal */}
      <CardContent className={cn("pt-0", contentClassName)}>
        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {description}
          </p>
        )}
        
        {/* Métadonnées */}
        {metadata.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            {metadata.map((item, index) => (
              <div key={index} className="text-xs">
                <span className="text-muted-foreground">{item.label}:</span>
                <span className="font-medium ml-1">{item.value}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Contenu personnalisé */}
        {children}
        
        {/* Indicateur de chargement */}
        {loading && (
          <div className="flex justify-center py-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Wrapper cliquable si onClick fourni
  if (onClick && !disabled) {
    return (
      <div
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={ariaLabel || title}
        className="focus-visible-only"
      >
        {cardContent}
      </div>
    );
  }

  return cardContent;
}

// Variants pré-configurés pour domaines métier
export const ReservationCard = (props: Omit<HotelCardProps, 'variant'>) => (
  <HotelCard {...props} variant="highlighted" />
);

export const RoomCard = (props: Omit<HotelCardProps, 'variant'>) => (
  <HotelCard {...props} variant="default" />
);

export const GuestCard = (props: Omit<HotelCardProps, 'variant'>) => (
  <HotelCard {...props} variant="default" />
);

export const UrgentCard = (props: Omit<HotelCardProps, 'variant'>) => (
  <HotelCard {...props} variant="urgent" />
);