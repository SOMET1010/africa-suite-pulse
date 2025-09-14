import React from "react";
import { TButton } from "@/core/ui/TButton";
import { SkipLink, ScreenReaderText } from "./Accessibility";
import { StatusBar } from "@/core/layout/StatusBar";
import { BottomActionBar } from "@/core/layout/BottomActionBar";
import { cn } from "@/core/utils/cn";

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  className?: string;
  showStatusBar?: boolean;
  bottomActions?: React.ReactNode;
  title?: string;
}

export function MobileOptimizedLayout({
  children,
  className,
  showStatusBar = true,
  bottomActions,
  title
}: MobileOptimizedLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Skip Links for Accessibility */}
      <SkipLink href="#main-content">
        Aller au contenu principal
      </SkipLink>
      <SkipLink href="#navigation">
        Aller à la navigation
      </SkipLink>

      {/* Status Bar */}
      {showStatusBar && <StatusBar />}

      {/* Main Content with Safe Areas */}
      <main 
        id="main-content"
        className="safe-area-top safe-area-bottom mobile-container space-mobile"
        tabIndex={-1}
      >
        {title && (
          <ScreenReaderText>
            Page: {title}
          </ScreenReaderText>
        )}
        {children}
      </main>

      {/* Bottom Actions */}
      {bottomActions && bottomActions}
    </div>
  );
}

interface TouchOptimizedCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  ariaLabel?: string;
}

export function TouchOptimizedCard({
  children,
  className,
  onClick,
  href,
  disabled = false,
  ariaLabel
}: TouchOptimizedCardProps) {
  const baseClasses = cn(
    "card-elevated hover-lift transition-elegant focus-interactive",
    "tap-target touch-tap min-h-16 p-4",
    disabled && "opacity-50 pointer-events-none",
    className
  );

  if (href) {
    return (
      <a
        href={href}
        className={baseClasses}
        aria-label={ariaLabel}
        tabIndex={disabled ? -1 : 0}
      >
        {children}
      </a>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={baseClasses}
        aria-label={ariaLabel}
      >
        {children}
      </button>
    );
  }

  return (
    <div className={baseClasses} aria-label={ariaLabel}>
      {children}
    </div>
  );
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  variant?: "1-2-3" | "2-4" | "equal";
}

export function ResponsiveGrid({ 
  children, 
  className, 
  variant = "1-2-3" 
}: ResponsiveGridProps) {
  const gridClasses = {
    "1-2-3": "grid-adaptive-1",
    "2-4": "grid-adaptive-2",
    "equal": "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
  };

  return (
    <div className={cn(gridClasses[variant], "touch-spacing", className)}>
      {children}
    </div>
  );
}