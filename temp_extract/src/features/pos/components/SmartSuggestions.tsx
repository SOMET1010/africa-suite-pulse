import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Clock, Users, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useOrgId } from '@/core/auth/useOrg';
import type { POSProduct, CartItem } from '../types';

interface SmartSuggestionsProps {
  currentItems: CartItem[];
  selectedTable?: any;
  customerCount: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  onAddSuggestion: (product: POSProduct) => void;
}

export function SmartSuggestions({
  currentItems,
  selectedTable,
  customerCount,
  timeOfDay,
  onAddSuggestion
}: SmartSuggestionsProps) {
  const { orgId } = useOrgId();
  const [suggestions, setSuggestions] = useState<POSProduct[]>([]);
  const [suggestionType, setSuggestionType] = useState<'upsell' | 'complement' | 'popular'>('complement');
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<string>('');

  // Données mockées pour les suggestions intelligentes
  const mockProducts: POSProduct[] = [
    {
      id: '1',
      name: 'Alloco accompagnement',
      code: 'ACC001',
      base_price: 1500,
      category_id: 'sides',
      outlet_id: '',
      description: 'Banane plantain frite, parfait avec les grillades',
      preparation_time: 5,
      is_active: true,
      created_at: '',
      updated_at: '',
      image_url: '',
      variants: []
    },
    {
      id: '2', 
      name: 'Bissap frais',
      code: 'BEV002',
      base_price: 800,
      category_id: 'beverages',
      outlet_id: '',
      description: 'Boisson rafraîchissante, très populaire',
      preparation_time: 2,
      is_active: true,
      created_at: '',
      updated_at: '',
      image_url: '',
      variants: []
    },
    {
      id: '3',
      name: 'Sauce épicée',
      code: 'SAU001', 
      base_price: 500,
      category_id: 'sauces',
      outlet_id: '',
      description: 'Sauce pimentée maison',
      preparation_time: 1,
      is_active: true,
      created_at: '',
      updated_at: '',
      image_url: '',
      variants: []
    }
  ];

  useEffect(() => {
    generateSmartSuggestions();
  }, [currentItems, customerCount, timeOfDay]);

  const generateSmartSuggestions = async () => {
    if (!orgId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-smart-suggestions', {
        body: {
          currentItems,
          customerCount,
          timeOfDay,
          orgId,
          tableId: selectedTable?.id
        }
      });

      if (error) {
        console.warn('AI suggestions failed, using fallback:', error);
        generateFallbackSuggestions();
        return;
      }

      // Convertir les suggestions IA en format POSProduct
      const aiSuggestions: POSProduct[] = data.suggestions.map((suggestion: any, index: number) => ({
        id: `ai-${index}`,
        name: suggestion.name,
        code: `AI${index}`,
        base_price: suggestion.price,
        category_id: 'suggestions',
        outlet_id: '',
        description: suggestion.description,
        preparation_time: 5,
        is_active: true,
        created_at: '',
        updated_at: '',
        image_url: '',
        variants: []
      }));

      setSuggestions(aiSuggestions);
      setSuggestionType(data.type);
      setProvider(data.provider);
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      generateFallbackSuggestions();
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackSuggestions = () => {
    let newSuggestions: POSProduct[] = [];
    let newType: 'upsell' | 'complement' | 'popular' = 'complement';

    // Analyse des articles dans le panier
    const hasMainDish = currentItems.some(item => 
      item.product.category_id === 'main'
    );
    const hasBeverage = currentItems.some(item => 
      item.product.category_id === 'beverages'
    );

    // Suggestions de compléments
    if (hasMainDish && !hasBeverage) {
      newSuggestions.push(mockProducts[1]); // Bissap
      newType = 'complement';
    }

    if (hasMainDish && currentItems.length === 1) {
      newSuggestions.push(mockProducts[0]); // Alloco
      newSuggestions.push(mockProducts[2]); // Sauce
      newType = 'complement';
    }

    // Suggestions populaires selon l'heure
    if (timeOfDay === 'afternoon' && customerCount > 2) {
      newSuggestions = [...newSuggestions, ...mockProducts.slice(0, 2)];
      newType = 'popular';
    }

    // Upselling si panier vide ou petit
    if (currentItems.length === 0) {
      newSuggestions = mockProducts;
      newType = 'popular';
    }

    setSuggestions(newSuggestions.slice(0, 3));
    setSuggestionType(newType);
    setProvider('Fallback');
  };

  const getSuggestionTitle = () => {
    switch (suggestionType) {
      case 'upsell':
        return 'Suggestions premium';
      case 'complement':
        return 'Parfait avec votre commande';
      case 'popular':
        return 'Populaires maintenant';
    }
  };

  const getSuggestionIcon = () => {
    switch (suggestionType) {
      case 'upsell':
        return TrendingUp;
      case 'complement':
        return Sparkles;
      case 'popular':
        return Users;
    }
  };

  if (suggestions.length === 0) return null;

  const Icon = getSuggestionIcon();

  return (
    <Card className="glass-card border-0 shadow-soft">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">{getSuggestionTitle()}</h3>
          <Badge variant="secondary" className="text-xs">
            {provider || 'IA'}
          </Badge>
          {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
        </div>
        
        <div className="space-y-2">
          {suggestions.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-background to-muted/20 border border-border/50 transition-elegant hover:scale-[1.02] cursor-pointer"
              onClick={() => onAddSuggestion(product)}
            >
              <div className="flex-1">
                <div className="font-medium text-sm">{product.name}</div>
                <div className="text-xs text-muted-foreground line-clamp-1">
                  {product.description}
                </div>
                {product.preparation_time && (
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {product.preparation_time}min
                    </span>
                  </div>
                )}
              </div>
              
              <div className="text-right ml-3">
                <div className="font-bold text-sm text-primary">
                  {product.base_price.toLocaleString()} F
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-12 text-xs mt-1 bg-primary/10 hover:bg-primary/20"
                >
                  +
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 text-center">
          <Button
            variant="ghost" 
            size="sm"
            onClick={generateSmartSuggestions}
            disabled={isLoading}
            className="text-xs text-muted-foreground hover:text-primary"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                Génération...
              </>
            ) : (
              'Actualiser suggestions'
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}