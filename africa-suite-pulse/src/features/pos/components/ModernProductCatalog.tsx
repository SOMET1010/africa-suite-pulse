import { useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePOSCategories, usePOSProducts } from "../hooks/usePOSData";
import { 
  Plus, 
  Clock, 
  Package, 
  Star, 
  Flame,
  Coffee,
  Wine,
  Utensils,
  IceCream,
  Filter,
  Heart
} from "lucide-react";
import type { POSProduct } from "../types";

interface ModernProductCatalogProps {
  outletId: string;
  searchQuery: string;
  onAddToCart: (product: POSProduct, quantity?: number) => void;
}

const categoryIcons: Record<string, any> = {
  'entrées': Utensils,
  'plats': Flame,
  'desserts': IceCream,
  'boissons': Coffee,
  'vins': Wine,
  'extras': Star,
};

const modifierOptions = {
  cuisson: ['Saignant', 'À point', 'Bien cuit'],
  garniture: ['Frites', 'Riz', 'Légumes', 'Purée'],
  sauce: ['Poivre', 'Champignons', 'Béarnaise', 'Aucune'],
  allergènes: ['Sans gluten', 'Sans lactose', 'Végétarien', 'Vegan']
};

export function ModernProductCatalog({
  outletId,
  searchQuery,
  onAddToCart
}: ModernProductCatalogProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string>>({});
  const [showFavorites, setShowFavorites] = useState(false);
  const [showHappyHour, setShowHappyHour] = useState(false);
  const productGridRef = useRef<HTMLDivElement>(null);

  const { data: categories = [] } = usePOSCategories(outletId);
  const { data: products = [] } = usePOSProducts(outletId, selectedCategoryId);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (showFavorites) {
      // Filter favorites - could be from localStorage or user preferences
      return matchesSearch && localStorage.getItem(`favorite_${product.id}`) === 'true';
    }
    
    if (showHappyHour) {
      // Filter happy hour items - could be based on time and product flags
      const currentHour = new Date().getHours();
      return matchesSearch && (currentHour >= 17 && currentHour <= 19);
    }
    
    return matchesSearch;
  });

  const handleProductSelect = useCallback((product: POSProduct) => {
    // Add product to cart
    onAddToCart(product);
  }, [onAddToCart]);

  const toggleFavorite = (productId: string) => {
    const isFavorite = localStorage.getItem(`favorite_${productId}`) === 'true';
    localStorage.setItem(`favorite_${productId}`, (!isFavorite).toString());
  };

  return (
    <div className="h-full flex flex-col">
      {/* Category Tabs - Enhanced */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold font-luxury">Catégories</h3>
          <div className="flex items-center gap-2">
            <Button
              variant={showFavorites ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setShowFavorites(!showFavorites);
                setShowHappyHour(false);
              }}
              className="h-9 px-3 rounded-lg glass-card transition-elegant"
            >
              <Heart className="h-4 w-4 mr-1.5" />
              Favoris
            </Button>
            <Button
              variant={showHappyHour ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setShowHappyHour(!showHappyHour);
                setShowFavorites(false);
              }}
              className="h-9 px-3 rounded-lg glass-card transition-elegant"
            >
              <Clock className="h-4 w-4 mr-1.5" />
              Happy Hour
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button
            variant={selectedCategoryId === undefined ? "default" : "outline"}
            size="lg"
            onClick={() => setSelectedCategoryId(undefined)}
            className="h-12 px-6 rounded-xl font-medium transition-elegant hover:scale-[1.05] shadow-soft"
          >
            <Filter className="h-4 w-4 mr-2" />
            Tous les produits
          </Button>
          
          {categories.map((category) => {
            const Icon = categoryIcons[category.name.toLowerCase()] || Package;
            return (
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
                <Icon className="h-4 w-4 mr-2" />
                {category.name}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Modifier Bar - Contextual */}
      {selectedCategoryId && (
        <div className="mb-6 p-4 glass-card rounded-xl border">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Modificateurs contextuels</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(modifierOptions).map(([type, options]) => (
              <div key={type} className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground capitalize">
                  {type}
                </label>
                <select
                  value={selectedModifiers[type] || ''}
                  onChange={(e) => setSelectedModifiers(prev => ({
                    ...prev,
                    [type]: e.target.value
                  }))}
                  className="w-full h-8 text-xs border rounded-lg px-2 bg-background"
                >
                  <option value="">Défaut</option>
                  {options.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid - Enhanced Touch Targets 96-120px */}
      <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent" ref={productGridRef}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredProducts.map((product) => {
            const isFavorite = localStorage.getItem(`favorite_${product.id}`) === 'true';
            
            return (
              <Card
                key={product.id}
                className="group relative overflow-hidden cursor-pointer tap-target transition-elegant hover:scale-[1.05] hover:shadow-luxury glass-card border-0 rounded-2xl min-h-[120px]"
                onClick={() => handleProductSelect(product)}
              >
                {/* Product Image */}
                <div className="aspect-square bg-gradient-to-br from-primary/5 via-accent/5 to-muted/10 rounded-t-2xl mb-3 flex items-center justify-center relative overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-t-2xl"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground/40 mb-1" />
                      <span className="text-xs text-muted-foreground font-medium">Image</span>
                    </div>
                  )}
                  
                  {/* Favorite Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(product.id);
                    }}
                    className={`absolute top-2 right-2 h-8 w-8 p-0 rounded-lg transition-elegant ${
                      isFavorite 
                        ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                        : 'bg-white/80 text-muted-foreground hover:bg-white'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </Button>
                  
                  {/* Floating Add Button */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-elegant flex items-end justify-center pb-3">
                    <Button
                      size="sm"
                      className="bg-white/95 text-black hover:bg-white shadow-luxury transition-elegant hover:scale-[1.1] rounded-lg h-8 px-3"
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

                <div className="p-3 pt-0 space-y-2">
                  {/* Product Name */}
                  <h3 className="font-semibold text-sm leading-tight line-clamp-2 min-h-[2.5rem] font-luxury">
                    {product.name}
                  </h3>
                  
                  {/* Price and Stock */}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary font-luxury">
                      {product.base_price.toLocaleString()} F
                    </span>
                    
                    {product.current_stock !== undefined && (
                      <Badge 
                        variant={product.current_stock > 10 ? "secondary" : "destructive"} 
                        className="text-xs px-2 py-1 glass-card"
                      >
                        {product.current_stock > 10 ? 'Stock' : `${product.current_stock}`}
                      </Badge>
                    )}
                  </div>

                  {/* Preparation Time */}
                  {product.preparation_time && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{product.preparation_time}min</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
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
                    : showFavorites
                      ? "Aucun produit marqué comme favori."
                      : showHappyHour
                        ? "Aucun produit en promotion actuellement."
                        : "Cette catégorie ne contient aucun produit pour le moment."
                  }
                </p>
              </div>
              {(searchQuery || showFavorites || showHappyHour) && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowFavorites(false);
                    setShowHappyHour(false);
                    setSelectedCategoryId(undefined);
                  }}
                  className="glass-card transition-elegant"
                >
                  Voir tous les produits
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}