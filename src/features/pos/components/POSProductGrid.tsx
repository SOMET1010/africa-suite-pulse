import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Keyboard } from 'lucide-react';

interface Product {
  code: string;
  name: string;
  price: number;
  category: string;
  image_url: string;
  emoji?: string;
}

interface POSProductGridProps {
  products: Product[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onProductSelect: (product: Product) => void;
  productCode: string;
  onProductCodeChange: (code: string) => void;
  onProductCodeSubmit: () => void;
}

export const POSProductGrid: React.FC<POSProductGridProps> = ({
  products,
  selectedCategory,
  onCategoryChange,
  onProductSelect,
  productCode,
  onProductCodeChange,
  onProductCodeSubmit
}) => {
  const categories = Array.from(new Set(products.map(p => p.category)));
  const categoryTabs = ['Tous', ...categories];

  const filteredProducts = selectedCategory === 'Tous' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Tous': return '🏪';
      case 'Plats': return '🍽️';
      case 'Boissons': return '🥤';
      case 'Bières': return '🍺';
      case 'Grillades': return '🔥';
      case 'Accompagnements': return '🥗';
      default: return '📦';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Plats': return 'hover:bg-amber-50 border-amber-200';
      case 'Boissons': return 'hover:bg-blue-50 border-blue-200';
      case 'Bières': return 'hover:bg-orange-50 border-orange-200';
      case 'Grillades': return 'hover:bg-red-50 border-red-200';
      case 'Accompagnements': return 'hover:bg-green-50 border-green-200';
      default: return 'hover:bg-primary/5 border-primary/20';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Zone de saisie code */}
      <div className="p-4 border-b bg-muted/30">
        <div className="text-center">
          <h3 className="text-lg font-bold mb-3 flex items-center justify-center gap-2">
            <Keyboard className="h-5 w-5" />
            SAISIE RAPIDE
          </h3>
          <Input
            value={productCode}
            onChange={(e) => onProductCodeChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onProductCodeSubmit()}
            placeholder="Code produit..."
            className="text-center text-2xl tap-target font-mono font-bold mb-2 transition-elegant"
            autoFocus
          />
          <div className="text-sm text-muted-foreground">
            Tapez le code puis Entrée
          </div>
        </div>
      </div>

      {/* Onglets catégories */}
      <div className="p-4 border-b bg-background">
        <Tabs value={selectedCategory} onValueChange={onCategoryChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 tap-target">
            {categoryTabs.map((category) => (
              <TabsTrigger 
                key={category} 
                value={category}
                className="flex flex-col gap-1 text-xs tap-target press-feedback responsive-text-sm"
              >
                <span className="text-base">{getCategoryIcon(category)}</span>
                <span className="font-medium text-xs truncate-mobile">{category}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Grille des produits */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-adaptive-2 mobile-container touch-spacing">
          {filteredProducts.map((product) => (
            <Card
              key={product.code}
              className={`cursor-pointer transition-elegant hover:scale-105 shadow-soft tap-target press-feedback ${getCategoryColor(product.category)}`}
              onClick={() => onProductSelect(product)}
            >
              <CardContent className="p-3 min-h-[120px] flex flex-col touch-manipulation">
                {/* Image/Emoji du produit */}
                <div className="flex-1 flex items-center justify-center mb-2">
                  {product.image_url && product.image_url !== '/placeholder.svg' ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : (
                    <div className="text-2xl">{product.emoji || getCategoryIcon(product.category)}</div>
                  )}
                  <div className={`text-2xl ${product.image_url && product.image_url !== '/placeholder.svg' ? 'hidden' : ''}`}>
                    {product.emoji || getCategoryIcon(product.category)}
                  </div>
                </div>

                {/* Infos produit */}
                <div className="text-center">
                  <div className="font-bold responsive-text-sm mb-1 truncate" title={product.name}>
                    {product.name}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs px-1">
                      {product.code}
                    </Badge>
                    <div className="text-primary font-bold responsive-text-sm">
                      {product.price.toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Compteur de produits */}
      <div className="p-3 border-t bg-muted/30 text-center">
        <Badge variant="outline" className="text-sm">
          {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} 
          {selectedCategory !== 'Tous' && ` - ${selectedCategory}`}
        </Badge>
      </div>
    </div>
  );
};