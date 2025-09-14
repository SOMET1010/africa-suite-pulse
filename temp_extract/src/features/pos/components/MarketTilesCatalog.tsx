import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { usePOSCategories, usePOSProducts } from "../hooks/usePOSData";
import { useBusinessContext } from "../hooks/useBusinessContext";
import { MenuCompositionDialog } from "./MenuCompositionDialog";
import { KitchenMessagesSelector } from "./KitchenMessagesSelector";
import { useCurrency } from "@/hooks/useCurrency";
import { 
  Search, 
  Plus, 
  Star, 
  Clock, 
  ShoppingCart,
  Zap,
  Coffee,
  Utensils,
  Wine,
  Package,
  Grid3X3,
  List,
  Filter
} from "lucide-react";
import type { POSProduct } from "../types";

interface MarketTilesCatalogProps {
  outletId: string;
  searchQuery: string;
  onAddToCart: (product: POSProduct, quantity?: number) => void;
  onSearchChange: (query: string) => void;
}

// Business type icons mapping
const BUSINESS_ICONS = {
  restaurant: Utensils,
  bar: Wine,
  fast_food: Zap,
  boutique: Package,
  cafe: Coffee,
} as const;

const CATEGORY_GRADIENTS = [
  "from-red-500/80 to-pink-600/80",
  "from-blue-500/80 to-cyan-600/80", 
  "from-green-500/80 to-emerald-600/80",
  "from-yellow-500/80 to-orange-600/80",
  "from-purple-500/80 to-violet-600/80",
  "from-indigo-500/80 to-blue-600/80",
  "from-rose-500/80 to-red-600/80",
  "from-teal-500/80 to-green-600/80"
];

export function MarketTilesCatalog({ 
  outletId, 
  searchQuery, 
  onAddToCart, 
  onSearchChange 
}: MarketTilesCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [viewMode, setViewMode] = useState<'tiles' | 'list'>('tiles');
  const [showFavorites, setShowFavorites] = useState(false);
  const [showHappyHour, setShowHappyHour] = useState(false);
  const [showCompositionDialog, setShowCompositionDialog] = useState(false);
  const [showKitchenMessages, setShowKitchenMessages] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<POSProduct | null>(null);
  const { formatCurrency } = useCurrency();

  const { businessType, getBusinessConfig } = useBusinessContext();
  const businessConfig = getBusinessConfig();
  const BusinessIcon = BUSINESS_ICONS[businessType as keyof typeof BUSINESS_ICONS] || Utensils;

  const { data: categories = [] } = usePOSCategories(outletId);
  const { data: allProducts = [] } = usePOSProducts(outletId);

  // Enhanced filtering logic
  const filteredProducts = useMemo(() => {
    let filtered = allProducts;

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category_id === selectedCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.code?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }

    // Business-specific filters
    if (showFavorites) {
      const favorites = JSON.parse(localStorage.getItem('pos-favorites') || '[]');
      filtered = filtered.filter(p => favorites.includes(p.id));
    }

    if (showHappyHour) {
      filtered = filtered.filter(p => p.happy_hour_price);
    }

    return filtered;
  }, [allProducts, selectedCategory, searchQuery, showFavorites, showHappyHour]);

  const handleProductAdd = (product: POSProduct) => {
    // Check if product has compositions or needs customization
    setSelectedProduct(product);
    setShowKitchenMessages(true);
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  const handleCompositionConfirm = (selections: Record<string, string[]>) => {
    if (selectedProduct) {
      onAddToCart(selectedProduct, 1);
      setShowKitchenMessages(true);
    }
  };

  const handleKitchenMessagesConfirm = (data: {
    messages: string[];
    customMessage?: string;
    priority: 'normal' | 'urgent' | 'critical';
    workstation?: string;
    estimatedTime?: number;
    soundAlert: boolean;
    template?: string;
    orderMode: any;
    tableInfo?: any;
  }) => {
    if (selectedProduct) {
      console.log('Kitchen messages:', data);
      onAddToCart(selectedProduct, 1);
      setSelectedProduct(null);
    }
  };

  const toggleFavorite = (productId: string) => {
    const favorites = JSON.parse(localStorage.getItem('pos-favorites') || '[]');
    const newFavorites = favorites.includes(productId) 
      ? favorites.filter((id: string) => id !== productId)
      : [...favorites, productId];
    localStorage.setItem('pos-favorites', JSON.stringify(newFavorites));
  };

  const isFavorite = (productId: string) => {
    const favorites = JSON.parse(localStorage.getItem('pos-favorites') || '[]');
    return favorites.includes(productId);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Enhanced Header with Business Context */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-secondary/10 border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${businessConfig?.color || 'from-primary to-primary/80'} text-white`}>
              <BusinessIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{businessConfig?.name || 'Catalogue'}</h3>
              <p className="text-sm text-muted-foreground">
                {filteredProducts.length} produits disponibles
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'tiles' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('tiles')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Enhanced Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher produits, codes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-11 text-base"
          />
        </div>

        {/* Context Filters */}
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant={showFavorites ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFavorites(!showFavorites)}
            className="gap-2"
          >
            <Star className="h-4 w-4" />
            Favoris
          </Button>
          
          {businessType === 'bar' && (
            <Button
              variant={showHappyHour ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowHappyHour(!showHappyHour)}
              className="gap-2"
            >
              <Clock className="h-4 w-4" />
              Happy Hour
            </Button>
          )}
          
          <div className="ml-auto">
            <Badge variant="secondary" className="gap-1">
              <Filter className="h-3 w-3" />
              {filteredProducts.length}
            </Badge>
          </div>
        </div>
      </div>

      {/* Enhanced Category Tabs */}
      <div className="border-b bg-card/50 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <Button
            variant={selectedCategory === "" ? "default" : "outline"}
            onClick={() => setSelectedCategory("")}
            className="shrink-0 gap-2"
          >
            Tous
            <Badge variant="secondary" className="ml-1">
              {allProducts.length}
            </Badge>
          </Button>
          
          {categories.map((category, index) => {
            const categoryProducts = allProducts.filter(p => p.category_id === category.id);
            const gradientClass = CATEGORY_GRADIENTS[index % CATEGORY_GRADIENTS.length];
            
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={`shrink-0 gap-2 ${
                  selectedCategory === category.id 
                    ? `bg-gradient-to-r ${gradientClass} text-white border-0 hover:opacity-90` 
                    : ''
                }`}
              >
                {category.name}
                <Badge 
                  variant={selectedCategory === category.id ? "secondary" : "outline"} 
                  className="ml-1"
                >
                  {categoryProducts.length}
                </Badge>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Products Grid/List */}
      <div className="flex-1 overflow-auto p-4">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun produit trouvé</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Modifiez votre recherche' : 'Aucun produit dans cette catégorie'}
            </p>
          </div>
        ) : (
          <div className={
            viewMode === 'tiles' 
              ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" 
              : "space-y-3"
          }>
            {filteredProducts.map((product) => (
              <MarketTileCard
                key={product.id}
                product={product}
                viewMode={viewMode}
                isFavorite={isFavorite(product.id)}
                onAddToCart={() => handleProductAdd(product)}
                onToggleFavorite={() => toggleFavorite(product.id)}
                businessType={businessType || 'restaurant'}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Dialogs */}
      {selectedProduct && (
        <>
          <MenuCompositionDialog
            isOpen={showCompositionDialog}
            onClose={() => {
              setShowCompositionDialog(false);
              setSelectedProduct(null);
            }}
            productName={selectedProduct.name}
            compositions={[
              {
                type: 'side',
                name: 'Accompagnement',
                isRequired: true,
                allowMultiple: false,
                options: [
                  { id: '1', name: 'Frites', extraPrice: 0, isDefault: true },
                  { id: '2', name: 'Riz', extraPrice: 0, isDefault: false },
                  { id: '3', name: 'Salade', extraPrice: 500, isDefault: false }
                ]
              },
              {
                type: 'sauce',
                name: 'Sauce',
                isRequired: false,
                allowMultiple: true,
                options: [
                  { id: '1', name: 'Ketchup', extraPrice: 0, isDefault: false },
                  { id: '2', name: 'Mayonnaise', extraPrice: 0, isDefault: false },
                  { id: '3', name: 'Sauce piquante', extraPrice: 200, isDefault: false }
                ]
              }
            ]}
            onConfirm={handleCompositionConfirm}
          />
          
          <KitchenMessagesSelector
            isOpen={showKitchenMessages}
            onClose={() => {
              setShowKitchenMessages(false);
              setSelectedProduct(null);
            }}
            onConfirm={handleKitchenMessagesConfirm}
          />
        </>
      )}
    </div>
  );
}

// Enhanced Product Card Component
interface MarketTileCardProps {
  product: POSProduct;
  viewMode: 'tiles' | 'list';
  isFavorite: boolean;
  onAddToCart: () => void;
  onToggleFavorite: () => void;
  businessType: string;
}

function MarketTileCard({ 
  product, 
  viewMode, 
  isFavorite, 
  onAddToCart, 
  onToggleFavorite,
  businessType 
}: MarketTileCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { formatCurrency } = useCurrency();

  const getStockStatus = () => {
    if (!product.is_stock_managed) return 'unlimited';
    const stock = product.current_stock || 0;
    if (stock === 0) return 'out';
    if (stock <= (product.min_stock || 5)) return 'low';
    return 'good';
  };

  const stockStatus = getStockStatus();
  const isOutOfStock = stockStatus === 'out';

  if (viewMode === 'list') {
    return (
      <Card className="p-4 hover:shadow-md transition-all duration-200">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center shrink-0">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Package className="h-6 w-6 text-muted-foreground" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium truncate">{product.name}</h4>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {product.description}
                </p>
              </div>
              
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleFavorite}
                  className="p-1.5"
                >
                  <Star className={`h-4 w-4 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                </Button>
                
                <div className="text-right">
                  <div className="font-semibold text-lg">
                    {formatCurrency(product.base_price)}
                  </div>
                  {product.happy_hour_price && (
                    <div className="text-xs text-green-600">
                      Happy: {formatCurrency(product.happy_hour_price)}
                    </div>
                  )}
                </div>
                
                <Button
                  onClick={onAddToCart}
                  disabled={isOutOfStock}
                  size="sm"
                  className="gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className={`group relative overflow-hidden transition-all duration-300 ${
        isOutOfStock 
          ? 'opacity-60 cursor-not-allowed' 
          : 'hover:shadow-xl hover:scale-[1.02] cursor-pointer'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-muted via-muted/80 to-muted/60">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.happy_hour_price && (
            <Badge className="bg-green-500/90 text-white text-xs">
              Happy Hour
            </Badge>
          )}
          {stockStatus === 'low' && (
            <Badge className="bg-orange-500/90 text-white text-xs">
              Stock faible
            </Badge>
          )}
          {isOutOfStock && (
            <Badge className="bg-red-500/90 text-white text-xs">
              Rupture
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleFavorite}
          className="absolute top-2 right-2 p-1.5 bg-white/20 backdrop-blur-sm hover:bg-white/30"
        >
          <Star className={`h-4 w-4 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-white'}`} />
        </Button>

        {/* Floating Add Button */}
        <div className={`absolute bottom-2 right-2 transition-all duration-300 ${
          isHovered && !isOutOfStock ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          <Button
            onClick={onAddToCart}
            size="sm"
            className="bg-primary/90 hover:bg-primary shadow-lg"
          >
            <Plus className="h-4 w-4 mr-1" />
            Ajouter
          </Button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <div className="space-y-2">
          <h4 className="font-semibold line-clamp-1 text-base">
            {product.name}
          </h4>
          
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
            {product.description || 'Aucune description disponible'}
          </p>
          
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-1">
              <div className="font-bold text-lg">
                {formatCurrency(product.base_price)}
              </div>
              {product.happy_hour_price && (
                <div className="text-sm text-green-600 font-medium">
                  Happy: {formatCurrency(product.happy_hour_price)}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {product.preparation_time && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {product.preparation_time}min
                </div>
              )}
              
              {!isHovered && (
                <Button
                  onClick={onAddToCart}
                  disabled={isOutOfStock}
                  size="sm"
                  variant="outline"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}