import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { usePOSCategories, usePOSProducts } from "../hooks/usePOSData";
import { Search, Plus, ShoppingCart } from "lucide-react";
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
      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategoryId === undefined ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategoryId(undefined)}
          >
            Tous
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategoryId === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategoryId(category.id)}
              style={{
                backgroundColor: selectedCategoryId === category.id && category.color 
                  ? category.color 
                  : undefined
              }}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onAddToCart(product)}
            >
              <div className="aspect-square bg-muted rounded-md mb-3 flex items-center justify-center">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                )}
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
                
                {product.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-primary">
                    {product.base_price.toFixed(0)} FCFA
                  </span>
                  
                  {product.current_stock !== undefined && (
                    <Badge variant="secondary" className="text-xs">
                      Stock: {product.current_stock || 0}
                    </Badge>
                  )}
                </div>

                {product.preparation_time && (
                  <div className="text-xs text-muted-foreground">
                    ⏱️ {product.preparation_time} min
                  </div>
                )}

                <Button
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(product);
                  }}
                  disabled={false}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Ajouter
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery 
                ? "Aucun produit trouvé pour cette recherche" 
                : "Aucun produit disponible dans cette catégorie"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}