import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Calculator, Clock, Trash2 } from "lucide-react";

interface TechnicalSheetBadgeProps {
  product: any;
  compositionCount?: number;
  totalPrepTime?: number;
  variant?: 'default' | 'compact';
}

export default function TechnicalSheetBadge({ 
  product, 
  compositionCount = 0, 
  totalPrepTime = 0,
  variant = 'default' 
}: TechnicalSheetBadgeProps) {
  if (!product.is_composed) return null;

  return (
    <div className={`flex items-center gap-2 ${variant === 'compact' ? 'text-sm' : ''}`}>
      <Badge 
        variant="secondary" 
        className="bg-gradient-to-r from-primary/10 to-primary-variant/10 text-primary border-primary/20"
      >
        <Calculator className="w-3 h-3 mr-1" />
        Fiche Technique
      </Badge>
      
      {variant === 'default' && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {compositionCount > 0 && (
            <span className="flex items-center gap-1">
              <Trash2 className="w-3 h-3" />
              {compositionCount} ingrédients
            </span>
          )}
          {totalPrepTime > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {totalPrepTime}min
            </span>
          )}
        </div>
      )}
    </div>
  );
}