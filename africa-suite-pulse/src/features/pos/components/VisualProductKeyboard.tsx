import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';

interface Product {
  code: string;
  name: string;
  price: number;
  category: string;
  image_url: string;
  emoji?: string;
}

interface VisualProductKeyboardProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  className?: string;
}

export const VisualProductKeyboard: React.FC<VisualProductKeyboardProps> = ({
  products,
  onProductSelect,
  className = ""
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');

  // Organiser les produits par catégorie
  const categories = Array.from(new Set(products.map(p => p.category)));
  const categoryTabs = ['Tous', ...categories];

  const filteredProducts = selectedCategory === 'Tous' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  // Icônes par catégorie
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Plats': return '🍽️';
      case 'Boissons': return '🥤';
      case 'Bières': return '🍺';
      case 'Grillades': return '🔥';
      case 'Accompagnements': return '🥗';
      default: return '🏪';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Plats': return 'bg-amber-500/20 border-amber-500/30 hover:bg-amber-500/30';
      case 'Boissons': return 'bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/30';
      case 'Bières': return 'bg-orange-500/20 border-orange-500/30 hover:bg-orange-500/30';
      case 'Grillades': return 'bg-red-500/20 border-red-500/30 hover:bg-red-500/30';
      case 'Accompagnements': return 'bg-green-500/20 border-green-500/30 hover:bg-green-500/30';
      default: return 'bg-primary/20 border-primary/30 hover:bg-primary/30';
    }
  };

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Onglets catégories */}
      <div className="p-4 border-b bg-muted/10">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-6 h-14">
            {categoryTabs.map((category) => (
              <TabsTrigger 
                key={category} 
                value={category}
                className="flex flex-col gap-1 text-xs h-12"
              >
                <span className="text-lg">{getCategoryIcon(category)}</span>
                <span className="font-medium">{category}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Grille des produits */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <Card
              key={product.code}
              className={`cursor-pointer transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${getCategoryColor(product.category)}`}
              onClick={() => onProductSelect(product)}
            >
              <CardContent className="p-4 h-32 flex flex-col justify-between">
                {/* Image du produit */}
                <div className="flex-1 flex items-center justify-center">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        // Fallback vers emoji si image ne charge pas
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`text-4xl ${product.image_url ? 'hidden' : ''}`}>
                    {product.emoji || getCategoryIcon(product.category)}
                  </div>
                </div>

                {/* Infos produit */}
                <div className="text-center space-y-1">
                  <div className="font-bold text-sm truncate" title={product.name}>
                    {product.name}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {product.code}
                    </Badge>
                    <div className="text-primary font-bold text-sm">
                      {product.price.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Bouton d'ajout rapide */}
                <Button
                  size="sm"
                  className="w-full mt-2 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onProductSelect(product);
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Ajouter
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Compteur de produits */}
      <div className="p-4 border-t bg-muted/5 text-center">
        <Badge variant="outline" className="text-sm">
          {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} 
          {selectedCategory !== 'Tous' && ` en ${selectedCategory}`}
        </Badge>
      </div>
    </div>
  );
};