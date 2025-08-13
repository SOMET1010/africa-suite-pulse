import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/core/utils/cn";

interface FilterBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Rechercher...",
  children,
  className
}) => {
  return (
    <div className={cn(
      "flex flex-col gap-4 p-4 bg-card border border-border rounded-xl",
      "sm:flex-row sm:items-center sm:justify-between",
      className
    )}>
      {/* Barre de recherche */}
      {onSearchChange && (
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-10 focus-input"
          />
        </div>
      )}

      {/* Filtres additionnels */}
      {children && (
        <div className="flex flex-wrap items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
};