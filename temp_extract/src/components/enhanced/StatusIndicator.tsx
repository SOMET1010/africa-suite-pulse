/**
 * StatusIndicator - Indicateurs visuels enrichis pour statuts hôteliers
 * Support animations, variants tactiles et accessibilité renforcée
 * Part of AfricaSuite PMS 2025 - UX Refactoring Phase 1
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

const statusIndicatorVariants = cva(
  "inline-flex items-center gap-1.5 transition-elegant",
  {
    variants: {
      variant: {
        dot: "relative",
        badge: "px-2 py-1 rounded-full text-xs font-medium",
        pill: "px-3 py-1.5 rounded-full text-sm font-medium",
        card: "px-3 py-2 rounded-lg text-sm font-medium shadow-soft",
        minimal: "text-sm font-medium"
      },
      status: {
        // Réservations
        confirmed: "",
        pending: "", 
        cancelled: "",
        noshow: "",
        // Chambres
        clean: "",
        dirty: "",
        maintenance: "",
        occupied: "",
        vacant: "",
        ooo: "", // Out of Order
        // Paiements
        paid: "",
        partial: "",
        unpaid: "",
        refunded: "",
        // Staff
        active: "",
        break: "",
        offline: "",
        // Général
        success: "",
        warning: "",
        error: "",
        info: "",
        neutral: ""
      },
      size: {
        xs: "text-xs",
        sm: "text-sm", 
        md: "text-base",
        lg: "text-lg"
      },
      animation: {
        none: "",
        pulse: "animate-pulse",
        bounce: "animate-bounce",
        spin: "animate-spin",
        ping: "animate-ping"
      }
    },
    defaultVariants: {
      variant: "badge",
      status: "confirmed",
      size: "sm",
      animation: "none"
    }
  }
);

// Mapping des statuts vers les couleurs et styles
const statusStyles = {
  // Réservations
  confirmed: {
    dot: "bg-status-confirmed",
    badge: "badge-soft--confirmed",
    card: "bg-soft-success border border-success/20",
    text: "text-status-confirmed"
  },
  pending: {
    dot: "bg-status-option",
    badge: "badge-soft--option", 
    card: "bg-soft-warning border border-warning/20",
    text: "text-status-option"
  },
  cancelled: {
    dot: "bg-status-cancelled",
    badge: "badge-soft--cancelled",
    card: "bg-soft-danger border border-danger/20", 
    text: "text-status-cancelled"
  },
  noshow: {
    dot: "bg-status-cancelled",
    badge: "badge-soft--cancelled",
    card: "bg-soft-danger border border-danger/20",
    text: "text-status-cancelled"
  },
  // Chambres
  clean: {
    dot: "room-dot-clean",
    badge: "badge-soft--confirmed",
    card: "bg-soft-success border border-success/20",
    text: "text-status-confirmed"
  },
  dirty: {
    dot: "room-dot-dirty", 
    badge: "badge-soft--option",
    card: "bg-soft-warning border border-warning/20",
    text: "text-status-option"
  },
  maintenance: {
    dot: "room-dot-maintenance",
    badge: "bg-soft-danger text-status-maintenance",
    card: "bg-soft-danger border border-status-maintenance/20",
    text: "text-status-maintenance"
  },
  occupied: {
    dot: "room-dot-inspected",
    badge: "badge-soft--present",
    card: "bg-soft-info border border-info/20",
    text: "text-status-present"
  },
  vacant: {
    dot: "bg-muted",
    badge: "bg-muted/20 text-muted-foreground",
    card: "bg-muted/10 border border-muted/20",
    text: "text-muted-foreground"
  },
  ooo: {
    dot: "room-dot-out_of_order",
    badge: "badge-soft--cancelled",
    card: "bg-soft-danger border border-danger/20",
    text: "text-status-cancelled"
  },
  // Paiements
  paid: {
    dot: "bg-success",
    badge: "badge-soft--confirmed",
    card: "bg-soft-success border border-success/20",
    text: "text-success"
  },
  partial: {
    dot: "bg-warning",
    badge: "badge-soft--option", 
    card: "bg-soft-warning border border-warning/20",
    text: "text-warning"
  },
  unpaid: {
    dot: "bg-danger",
    badge: "badge-soft--cancelled",
    card: "bg-soft-danger border border-danger/20",
    text: "text-danger"
  },
  refunded: {
    dot: "bg-info",
    badge: "badge-soft--present",
    card: "bg-soft-info border border-info/20",
    text: "text-info"
  },
  // Staff
  active: {
    dot: "bg-success animate-pulse",
    badge: "badge-soft--confirmed",
    card: "bg-soft-success border border-success/20",
    text: "text-success"
  },
  break: {
    dot: "bg-warning",
    badge: "badge-soft--option",
    card: "bg-soft-warning border border-warning/20", 
    text: "text-warning"
  },
  offline: {
    dot: "bg-muted",
    badge: "bg-muted/20 text-muted-foreground",
    card: "bg-muted/10 border border-muted/20",
    text: "text-muted-foreground"
  },
  // Général
  success: {
    dot: "bg-success",
    badge: "badge-soft--confirmed",
    card: "bg-soft-success border border-success/20",
    text: "text-success"
  },
  warning: {
    dot: "bg-warning",
    badge: "badge-soft--option",
    card: "bg-soft-warning border border-warning/20",
    text: "text-warning"
  },
  error: {
    dot: "bg-danger",
    badge: "badge-soft--cancelled", 
    card: "bg-soft-danger border border-danger/20",
    text: "text-danger"
  },
  info: {
    dot: "bg-info",
    badge: "badge-soft--present",
    card: "bg-soft-info border border-info/20",
    text: "text-info"
  },
  neutral: {
    dot: "bg-muted",
    badge: "bg-muted/20 text-muted-foreground",
    card: "bg-muted/10 border border-muted/20",
    text: "text-muted-foreground"
  }
};

// Labels par défaut pour chaque statut
const statusLabels = {
  confirmed: "Confirmé",
  pending: "En attente", 
  cancelled: "Annulé",
  noshow: "No-show",
  clean: "Propre",
  dirty: "Sale",
  maintenance: "Maintenance",
  occupied: "Occupé",
  vacant: "Libre",
  ooo: "H.S.",
  paid: "Payé",
  partial: "Partiel",
  unpaid: "Impayé", 
  refunded: "Remboursé",
  active: "Actif",
  break: "Pause",
  offline: "Hors ligne",
  success: "Succès",
  warning: "Attention",
  error: "Erreur",
  info: "Information",
  neutral: "Neutre"
};

export interface StatusIndicatorProps extends VariantProps<typeof statusIndicatorVariants> {
  // Contenu
  label?: string;
  icon?: LucideIcon;
  showLabel?: boolean;
  
  // Personnalisation
  className?: string;
  dotClassName?: string;
  
  // Interactivité
  onClick?: () => void;
  tooltip?: string;
  
  // Accessibilité
  ariaLabel?: string;
  
  // États spéciaux
  count?: number;
  pulse?: boolean;
}

export function StatusIndicator({
  status = "confirmed",
  variant = "badge", 
  size = "sm",
  animation = "none",
  label,
  icon: Icon,
  showLabel = true,
  className,
  dotClassName,
  onClick,
  tooltip,
  ariaLabel,
  count,
  pulse = false,
  ...props
}: StatusIndicatorProps) {
  
  const styles = statusStyles[status!];
  const defaultLabel = label || statusLabels[status!];
  
  // Animation automatique pour certains statuts
  const autoAnimation = pulse || status === 'active' ? 'pulse' : animation;
  
  const baseClasses = cn(
    statusIndicatorVariants({ variant, status, size, animation: autoAnimation }),
    onClick && "cursor-pointer hover:scale-105 active:scale-95",
    className
  );

  const content = () => {
    switch (variant) {
      case 'dot':
        return (
          <div className={cn("flex items-center gap-2", baseClasses)}>
            <div 
              className={cn(
                "w-2 h-2 rounded-full",
                styles.dot,
                dotClassName
              )}
            />
            {showLabel && (
              <span className={cn("font-medium", styles.text)}>
                {defaultLabel}
                {count !== undefined && ` (${count})`}
              </span>
            )}
          </div>
        );
        
      case 'minimal':
        return (
          <div className={cn("flex items-center gap-1.5", baseClasses)}>
            {Icon && <Icon className="w-4 h-4" />}
            <span className={styles.text}>
              {defaultLabel}
              {count !== undefined && ` (${count})`}
            </span>
          </div>
        );
        
      case 'badge':
      case 'pill':
        return (
          <div className={cn(baseClasses, styles.badge)}>
            {Icon && <Icon className="w-3 h-3" />}
            {showLabel && defaultLabel}
            {count !== undefined && (
              <span className="ml-1 font-bold">({count})</span>
            )}
          </div>
        );
        
      case 'card':
        return (
          <div className={cn(baseClasses, styles.card)}>
            {Icon && <Icon className="w-4 h-4" />}
            <span>
              {defaultLabel}
              {count !== undefined && ` (${count})`}
            </span>
          </div>
        );
        
      default:
        return null;
    }
  };

  const indicator = content();
  
  // Wrapper cliquable si onClick fourni
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="focus-visible-only"
        title={tooltip}
        aria-label={ariaLabel || `${defaultLabel} - Cliquer pour plus d'actions`}
        {...props}
      >
        {indicator}
      </button>
    );
  }

  return (
    <div
      title={tooltip}
      aria-label={ariaLabel || defaultLabel}
      {...props}
    >
      {indicator}
    </div>
  );
}

// Variants pré-configurés pour domaines métier
export const ReservationStatus = (props: Omit<StatusIndicatorProps, 'variant'>) => (
  <StatusIndicator {...props} variant="badge" />
);

export const RoomStatus = (props: Omit<StatusIndicatorProps, 'variant'>) => (
  <StatusIndicator {...props} variant="dot" />
);

export const PaymentStatus = (props: Omit<StatusIndicatorProps, 'variant'>) => (
  <StatusIndicator {...props} variant="pill" />
);

export const StaffStatus = (props: Omit<StatusIndicatorProps, 'variant'>) => (
  <StatusIndicator {...props} variant="minimal" pulse />
);