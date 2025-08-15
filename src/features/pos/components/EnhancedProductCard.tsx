import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TButton } from "@/core/ui/TButton";
import { Heart, Clock, Percent, Tag, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProductPricing, useCurrentPricingLevel } from "../hooks/usePricing";

interface EnhancedProductCardProps {
  product: {
    id: string;
    name: string;
    code: string;
    base_price: number;
    price_level_1?: number;
    price_level_2?: number;
    price_level_3?: number;
    happy_hour_price?: number;
    description?: string;
    image_url?: string;
    is_stock_managed?: boolean;
    current_stock?: number;
    promotion_eligible?: boolean;
  };
  outletId: string;
  searchQuery?: string;
  onAddToCart: (product: any, quantity?: number) => void;
  isHappyHour?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (productId: string) => void;
}

export function EnhancedProductCard({
  product,
  outletId,
  searchQuery = "",
  onAddToCart,
  isHappyHour = false,
  isFavorite = false,
  onToggleFavorite
}: EnhancedProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { data: currentPricingLevel = 1 } = useCurrentPricingLevel(outletId);
  const { data: pricing } = useProductPricing(product.id);

  // Determine current price based on pricing level and promotions
  const getCurrentPrice = () => {
    if (pricing?.current_price) {
      return pricing.current_price;
    }
    
    if (isHappyHour && product.happy_hour_price) {
      return product.happy_hour_price;
    }
    
    switch (currentPricingLevel) {
      case 2:
        return product.price_level_2 || product.base_price;
      case 3:
        return product.price_level_3 || product.base_price;
      default:
        return product.price_level_1 || product.base_price;
    }
  };

  const currentPrice = getCurrentPrice();
  const hasDiscount = currentPrice < product.base_price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.base_price - currentPrice) / product.base_price) * 100)
    : 0;

  // Stock status
  const isOutOfStock = product.is_stock_managed && (product.current_stock ?? 0) <= 0;
  const isLowStock = product.is_stock_managed && (product.current_stock ?? 0) <= 5 && (product.current_stock ?? 0) > 0;

  // Highlight search terms
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-primary/20 text-primary px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300 cursor-pointer",
        "hover:shadow-lg hover:-translate-y-1",
        isOutOfStock && "opacity-60 cursor-not-allowed",
        isHovered && "shadow-xl scale-[1.02]",
        "bg-gradient-to-br from-card via-card/95 to-muted/20"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => !isOutOfStock && onAddToCart(product)}
    >
      {/* Product Image */}
      <div className="relative h-32 bg-gradient-to-br from-muted/30 to-muted/10 overflow-hidden">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {product.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasDiscount && (
            <Badge className="bg-destructive text-destructive-foreground shadow-lg">
              <Percent className="w-3 h-3 mr-1" />
              -{discountPercentage}%
            </Badge>
          )}
          {pricing?.promotion_applied && (
            <Badge className="bg-accent text-accent-foreground shadow-lg">
              <Tag className="w-3 h-3 mr-1" />
              {pricing.promotion_applied.promotion_name}
            </Badge>
          )}
          {isHappyHour && product.happy_hour_price && (
            <Badge className="bg-orange-500 text-white shadow-lg">
              <Clock className="w-3 h-3 mr-1" />
              Happy Hour
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        {onToggleFavorite && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 p-2 h-auto bg-background/80 hover:bg-background"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(product.id);
            }}
          >
            <Heart 
              className={cn(
                "w-4 h-4",
                isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
              )} 
            />
          </Button>
        )}

        {/* Stock Indicator */}
        {product.is_stock_managed && (
          <div className="absolute bottom-2 left-2">
            <Badge variant={isOutOfStock ? "destructive" : isLowStock ? "secondary" : "default"}>
              Stock: {product.current_stock ?? 0}
            </Badge>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm leading-tight">
            {highlightText(product.name, searchQuery)}
          </h3>
          
          {product.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {highlightText(product.description, searchQuery)}
            </p>
          )}

          {/* Pricing */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-primary">
                  {currentPrice.toLocaleString()} FCFA
                </span>
                {hasDiscount && (
                  <span className="text-xs text-muted-foreground line-through">
                    {product.base_price.toLocaleString()} FCFA
                  </span>
                )}
              </div>
              {pricing?.promotion_applied && (
                <span className="text-xs text-accent">
                  Remise: {pricing.promotion_applied.discount_amount.toLocaleString()} FCFA
                </span>
              )}
            </div>

            {/* Price Level Indicator */}
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((level) => (
                <div
                  key={level}
                  className={cn(
                    "w-2 h-2 rounded-full",
                    level <= currentPricingLevel ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Hover Actions */}
        <div className={cn(
          "absolute inset-0 bg-primary/90 flex items-center justify-center",
          "transition-all duration-300 backdrop-blur-sm",
          isHovered && !isOutOfStock ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <TButton
            size="lg"
            variant="default"
            className="shadow-xl"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter
          </TButton>
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-destructive/80 flex items-center justify-center backdrop-blur-sm">
            <Badge variant="destructive" className="text-sm font-semibold shadow-xl">
              Rupture de Stock
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
}