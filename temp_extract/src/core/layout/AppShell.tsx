import * as React from "react";
import { StatusBar } from "./StatusBar";
import { cn } from "@/core/utils/cn";

interface AppShellProps {
  children: React.ReactNode;
  className?: string;
  showStatusBar?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({ 
  children, 
  className,
  showStatusBar = true 
}) => {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {showStatusBar && <StatusBar />}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};