/**
 * Atomic Product Card Component - Phase 1: Architecture Foundation
 * Reusable product display component
 */

import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  code?: string;
  image_url?: string;
  description?: string;
}

interface ProductCardProps {
  product: Product;
  quantity?: number;
  size?: 'sm' | 'md' | 'lg';
  showQuantity?: boolean;
  onAdd?: (product: Product) => void;
  onRemove?: (product: Product) => void;
  onQuantityChange?: (product: Product, quantity: number) => void;
  className?: string;
}

export function ProductCard({
  product,
  quantity = 0,
  size = 'md',
  showQuantity = false,
  onAdd,
  onRemove,
  onQuantityChange,
  className = '',
}: ProductCardProps) {
  const sizeClasses = {
    sm: 'h-24 text-xs',
    md: 'h-32 text-sm',
    lg: 'h-40 text-base',
  };

  const imageSizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const handleAdd = () => {
    onAdd?.(product);
  };

  const handleRemove = () => {
    onRemove?.(product);
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(0, quantity + delta);
    onQuantityChange?.(product, newQuantity);
  };

  return (
    <Card className={`relative overflow-hidden transition-all duration-200 hover:shadow-md group cursor-pointer ${sizeClasses[size]} ${className}`}>
      <CardContent className="p-2 h-full flex flex-col">
        {/* Product Image/Icon */}
        <div className="flex items-center justify-center mb-2">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className={`${imageSizes[size]} object-cover rounded`}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`${imageSizes[size]} flex items-center justify-center text-2xl ${product.image_url ? 'hidden' : ''}`}>
            {getCategoryEmoji(product.category)}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1 text-center">
          <h3 className="font-medium line-clamp-2 mb-1">{product.name}</h3>
          <p className="font-bold text-primary">{product.price.toLocaleString()} FCFA</p>
          {product.code && size !== 'sm' && (
            <Badge variant="outline" className="text-xs mt-1">
              {product.code}
            </Badge>
          )}
        </div>

        {/* Quantity Controls */}
        {showQuantity && quantity > 0 && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleQuantityChange(-1);
              }}
              className="h-6 w-6 p-0"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="text-sm font-medium min-w-[20px] text-center">{quantity}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleQuantityChange(1);
              }}
              className="h-6 w-6 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Add Button (appears on hover) */}
        {!showQuantity && (
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleAdd();
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2 right-2"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}

        {/* Quantity Badge */}
        {quantity > 0 && !showQuantity && (
          <Badge 
            variant="default" 
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {quantity}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

function getCategoryEmoji(category: string): string {
  const emojiMap: Record<string, string> = {
    'plats': '🍽️',
    'boissons': '🥤',
    'grillades': '🥩',
    'desserts': '🍰',
    'entrées': '🥗',
    'plats-principaux': '🍛',
    'accompagnements': '🍚',
    'default': '🍴',
  };
  
  return emojiMap[category.toLowerCase()] || emojiMap.default;
}