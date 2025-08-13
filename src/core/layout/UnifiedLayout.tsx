import * as React from "react";
import { cn } from "@/core/utils/cn";
import { StatusBar } from "./StatusBar";
import { BottomActionBar } from "./BottomActionBar";

interface UnifiedLayoutProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  showStatusBar?: boolean;
  bottomActions?: React.ReactNode;
  headerAction?: React.ReactNode;
}

export const UnifiedLayout: React.FC<UnifiedLayoutProps> = ({
  children,
  title,
  className,
  showStatusBar = true,
  bottomActions,
  headerAction
}) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* StatusBar global */}
      {showStatusBar && <StatusBar />}

      {/* Header avec titre et action principale */}
      {title && (
        <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/30">
          <div className="mobile-container py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-foreground truncate-mobile">
                {title}
              </h1>
              {headerAction && (
                <div className="ml-4 flex-shrink-0">
                  {headerAction}
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Contenu principal */}
      <main className={cn(
        "flex-1 mobile-container space-mobile",
        bottomActions && "pb-20", // espace pour BottomActionBar
        className
      )}>
        {children}
      </main>

      {/* Actions contextuelles en bas */}
      {bottomActions && (
        <BottomActionBar>
          {bottomActions}
        </BottomActionBar>
      )}
    </div>
  );
};