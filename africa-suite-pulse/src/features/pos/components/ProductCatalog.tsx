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
      {/* Ultra-Modern Search with Enhanced UX */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit ou scanner un code-barres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-14 pr-6 h-16 text-lg glass-card border-0 shadow-elevate rounded-2xl transition-elegant focus:scale-[1.02]"
          />
        </div>
      </div>

      {/* Beautiful Category Pills */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-muted-foreground mb-4 font-luxury">Catégories</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            variant={selectedCategoryId === undefined ? "default" : "outline"}
            size="lg"
            onClick={() => setSelectedCategoryId(undefined)}
            className="h-12 px-6 rounded-xl font-medium transition-elegant hover:scale-[1.05] shadow-soft"
          >
            Tous les produits
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategoryId === category.id ? "default" : "outline"}
              size="lg"
              onClick={() => setSelectedCategoryId(category.id)}
              className="h-12 px-6 rounded-xl font-medium transition-elegant hover:scale-[1.05] shadow-soft"
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

      {/* Premium Products Grid */}
      <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="group relative overflow-hidden cursor-pointer tap-target transition-elegant hover:scale-[1.05] hover:shadow-luxury glass-card border-0 rounded-2xl"
              onClick={() => onAddToCart(product)}
            >
              {/* Enhanced Product Image */}
              <div className="aspect-square bg-gradient-to-br from-primary/5 via-accent/5 to-muted/10 rounded-t-2xl mb-5 flex items-center justify-center relative overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-t-2xl"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <Package className="h-16 w-16 text-muted-foreground/40 mb-2" />
                    <span className="text-xs text-muted-foreground font-medium">Image à venir</span>
                  </div>
                )}
                
                {/* Floating Quick Add Button */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-elegant flex items-end justify-center pb-4">
                  <Button
                    size="lg"
                    className="bg-white/95 text-black hover:bg-white shadow-luxury transition-elegant hover:scale-[1.1] rounded-xl"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(product);
                    }}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Ajouter
                  </Button>
                </div>
              </div>

              <div className="p-5 pt-0 space-y-4">
                {/* Product Name */}
                <h3 className="font-semibold text-base leading-tight line-clamp-2 min-h-[3rem] font-luxury">
                  {product.name}
                </h3>
                
                {/* Description */}
                {product.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                )}

                {/* Price and Stock */}
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary font-luxury">
                    {product.base_price.toLocaleString()} F
                  </span>
                  
                  {product.current_stock !== undefined && (
                    <Badge 
                      variant={product.current_stock > 10 ? "secondary" : "destructive"} 
                      className="text-xs font-medium glass-card"
                    >
                      {product.current_stock > 10 ? 'En stock' : `${product.current_stock} rest.`}
                    </Badge>
                  )}
                </div>

                {/* Preparation Time */}
                {product.preparation_time && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">{product.preparation_time} min</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Enhanced Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <div className="glass-card rounded-3xl p-12 max-w-lg mx-auto shadow-elevate">
              <div className="mb-6">
                <Package className="h-20 w-20 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3 font-luxury">Aucun produit trouvé</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {searchQuery 
                    ? `Aucun résultat pour "${searchQuery}". Essayez un autre terme de recherche.` 
                    : "Cette catégorie ne contient aucun produit pour le moment."
                  }
                </p>
              </div>
              {searchQuery && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchQuery("")}
                  className="glass-card transition-elegant"
                >
                  Effacer la recherche
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}