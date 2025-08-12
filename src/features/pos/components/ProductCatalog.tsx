import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { usePOSCategories, usePOSProducts } from "../hooks/usePOSData";
import { Search, Plus, ShoppingCart, Clock, Package } from "lucide-react";
import type { POSProduct } from "../types";

interface ProductCatalogProps {
  outletId: string;
  onAddToCart: (product: POSProduct, quantity?: number) => void;
}

export function ProductCatalog({ outletId, onAddToCart }: ProductCatalogProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories = [] } = usePOSCategories(outletId);
  const { data: products = [] } = usePOSProducts(outletId, selectedCategoryId);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Modern Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit ou code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 text-base bg-card/50 border-0 shadow-sm"
          />
        </div>
      </div>

      {/* Enhanced Categories */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Catégories</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategoryId === undefined ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategoryId(undefined)}
            className="h-10 px-4"
          >
            Tous les produits
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategoryId === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategoryId(category.id)}
              className="h-10 px-4"
              style={{
                backgroundColor: selectedCategoryId === category.id && category.color 
                  ? category.color 
                  : undefined,
                borderColor: category.color,
                color: selectedCategoryId === category.id ? 'white' : category.color
              }}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Modern Products Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="group relative overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-card/60 backdrop-blur-sm border-0 shadow-md"
              onClick={() => onAddToCart(product)}
            >
              {/* Product Image */}
              <div className="aspect-square bg-gradient-to-br from-muted/50 to-muted rounded-t-lg mb-4 flex items-center justify-center relative overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="h-12 w-12 text-muted-foreground/60" />
                )}
                
                {/* Quick Add Button */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Button
                    size="sm"
                    className="bg-white text-black hover:bg-white/90"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(product);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter
                  </Button>
                </div>
              </div>

              <div className="p-4 pt-0 space-y-3">
                {/* Product Name */}
                <h3 className="font-semibold text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
                  {product.name}
                </h3>
                
                {/* Description */}
                {product.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                )}

                {/* Price and Stock */}
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">
                    {product.base_price.toLocaleString()} F
                  </span>
                  
                  {product.current_stock !== undefined && (
                    <Badge 
                      variant={product.current_stock > 10 ? "secondary" : "destructive"} 
                      className="text-xs"
                    >
                      {product.current_stock > 10 ? 'En stock' : `${product.current_stock} rest.`}
                    </Badge>
                  )}
                </div>

                {/* Preparation Time */}
                {product.preparation_time && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{product.preparation_time} min</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-muted/30 rounded-2xl p-8 max-w-md mx-auto">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun produit trouvé</h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? `Aucun résultat pour "${searchQuery}"` 
                  : "Cette catégorie ne contient aucun produit"
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}