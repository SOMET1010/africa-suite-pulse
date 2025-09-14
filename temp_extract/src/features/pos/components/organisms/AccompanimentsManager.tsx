import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Minus, Gift, Lightbulb, Utensils, Percent } from "lucide-react";
import { useAccompaniments } from "../../hooks/useAccompaniments";

interface AccompanimentsManagerProps {
  selectedProduct?: {
    id: string;
    name: string;
    price: number;
    category?: string;
  };
  onAddToCart: (item: any) => void;
}

export function AccompanimentsManager({ selectedProduct, onAddToCart }: AccompanimentsManagerProps) {
  const {
    accompaniments,
    offers,
    getSuggestedAccompaniments,
    getDefaultAccompaniments,
    calculateAccompanimentPrice,
    addOffer,
    removeOffer,
    calculateOfferDiscount,
    getFrequentlyOrderedTogether,
    createComboMenu,
    handleProductModification
  } = useAccompaniments();

  const [selectedAccompaniments, setSelectedAccompaniments] = useState<Record<string, number>>({});
  const [selectedProduct2, setSelectedProduct2] = useState(selectedProduct);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [offerReason, setOfferReason] = useState("");
  const [offerValue, setOfferValue] = useState<number>(0);
  const [offerType, setOfferType] = useState<'percentage' | 'amount' | 'free_item'>('percentage');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [removeIngredients, setRemoveIngredients] = useState<string[]>([]);

  const suggestedAccompaniments = selectedProduct2 ? getSuggestedAccompaniments(selectedProduct2.id, selectedProduct2.category) : [];
  const frequentlyOrderedTogether = selectedProduct2 ? getFrequentlyOrderedTogether(selectedProduct2.id) : [];

  const handleAccompanimentChange = (accompId: string, quantity: number) => {
    setSelectedAccompaniments(prev => ({
      ...prev,
      [accompId]: Math.max(0, quantity)
    }));
  };

  const calculateTotal = () => {
    if (!selectedProduct2) return 0;
    
    const basePrice = selectedProduct2.price;
    const accompanimentsPrice = Object.entries(selectedAccompaniments).reduce((total, [accompId, quantity]) => {
      return total + calculateAccompanimentPrice(accompId, quantity);
    }, 0);
    
    const subtotal = basePrice + accompanimentsPrice;
    const discount = calculateOfferDiscount(subtotal);
    
    return Math.max(0, subtotal - discount);
  };

  const handleAddOffer = () => {
    if (!offerReason || offerValue <= 0) return;
    
    addOffer(offerReason, offerValue, offerType, "Serveur");
    setOfferReason("");
    setOfferValue(0);
  };

  const handleAddToCartWithAccompaniments = () => {
    if (!selectedProduct2) return;

    const itemWithAccompaniments = {
      ...selectedProduct2,
      accompaniments: Object.entries(selectedAccompaniments)
        .filter(([_, quantity]) => quantity > 0)
        .map(([accompId, quantity]) => {
          const accomp = accompaniments.find(a => a.id === accompId);
          return {
            id: accompId,
            name: accomp?.name || '',
            quantity,
            price: calculateAccompanimentPrice(accompId, quantity)
          };
        }),
      special_instructions: specialInstructions,
      remove_ingredients: removeIngredients,
      total_price: calculateTotal(),
      applied_offers: offers
    };

    onAddToCart(itemWithAccompaniments);
    
    // Reset form
    setSelectedAccompaniments({});
    setSpecialInstructions("");
    setRemoveIngredients([]);
  };

  const handleIngredientRemoval = (ingredient: string) => {
    setRemoveIngredients(prev => 
      prev.includes(ingredient) 
        ? prev.filter(i => i !== ingredient)
        : [...prev, ingredient]
    );
  };

  const commonIngredients = ["Oignons", "Tomates", "Piment", "Ail", "Gingembre", "Coriandre"];

  return (
    <div className="space-y-6">
      {/* Produit sélectionné */}
      {selectedProduct2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              {selectedProduct2.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-lg">{selectedProduct2.price.toLocaleString('fr-FR')} FCFA</span>
              <Badge variant="outline">{selectedProduct2.category || 'Plat'}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accompagnements suggérés */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Accompagnements Suggérés</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Suggestions IA
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {suggestedAccompaniments.map(accomp => (
                  <div key={accomp.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{accomp.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {accomp.is_free ? 'Gratuit' : `${accomp.price} FCFA`}
                        {accomp.is_default && <Badge variant="secondary" className="ml-2">Par défaut</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAccompanimentChange(accomp.id, (selectedAccompaniments[accomp.id] || 0) - 1)}
                        disabled={(selectedAccompaniments[accomp.id] || 0) <= 0}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{selectedAccompaniments[accomp.id] || 0}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAccompanimentChange(accomp.id, (selectedAccompaniments[accomp.id] || 0) + 1)}
                        disabled={(selectedAccompaniments[accomp.id] || 0) >= accomp.max_quantity}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Modifications du plat */}
          <Card>
            <CardHeader>
              <CardTitle>Modifications du Plat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Retirer des ingrédients:</label>
                <div className="flex flex-wrap gap-2">
                  {commonIngredients.map(ingredient => (
                    <div key={ingredient} className="flex items-center space-x-2">
                      <Checkbox
                        id={ingredient}
                        checked={removeIngredients.includes(ingredient)}
                        onCheckedChange={() => handleIngredientRemoval(ingredient)}
                      />
                      <label htmlFor={ingredient} className="text-sm">{ingredient}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Instructions spéciales:</label>
                <Textarea
                  placeholder="Ex: Peu épicé, sauce à part, bien cuit..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Suggestions intelligentes */}
          {showSuggestions && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Souvent Commandé Ensemble
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {frequentlyOrderedTogether.map((suggestion, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <div className="font-medium">{suggestion.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Commandé dans {suggestion.frequency}% des cas
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Ajouter
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Panneau latéral */}
        <div className="space-y-4">
          {/* Offerts et remises */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Offerts & Remises
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Input
                  placeholder="Raison de l'offert"
                  value={offerReason}
                  onChange={(e) => setOfferReason(e.target.value)}
                />
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Valeur"
                    value={offerValue}
                    onChange={(e) => setOfferValue(Number(e.target.value))}
                  />
                  <Select value={offerType} onValueChange={(value: any) => setOfferType(value)}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">%</SelectItem>
                      <SelectItem value="amount">FCFA</SelectItem>
                      <SelectItem value="free_item">Gratuit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddOffer} className="w-full" size="sm">
                  Appliquer Offert
                </Button>
              </div>

              {offers.length > 0 && (
                <div className="space-y-2 border-t pt-3">
                  <div className="text-sm font-medium">Offerts appliqués:</div>
                  {offers.map(offer => (
                    <div key={offer.id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <div>
                        <div className="text-sm font-medium">{offer.reason}</div>
                        <div className="text-xs text-muted-foreground">
                          {offer.type === 'percentage' ? `${offer.value}%` : `${offer.value} FCFA`}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeOffer(offer.id)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Récapitulatif et total */}
          <Card>
            <CardHeader>
              <CardTitle>Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedProduct2 && (
                <div className="flex justify-between">
                  <span>{selectedProduct2.name}</span>
                  <span>{selectedProduct2.price.toLocaleString('fr-FR')} FCFA</span>
                </div>
              )}
              
              {Object.entries(selectedAccompaniments)
                .filter(([_, quantity]) => quantity > 0)
                .map(([accompId, quantity]) => {
                  const accomp = accompaniments.find(a => a.id === accompId);
                  const price = calculateAccompanimentPrice(accompId, quantity);
                  return (
                    <div key={accompId} className="flex justify-between text-sm">
                      <span>{quantity}x {accomp?.name}</span>
                      <span>{price.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  );
                })}

              {offers.length > 0 && (
                <div className="border-t pt-2">
                  {offers.map(offer => (
                    <div key={offer.id} className="flex justify-between text-sm text-green-600">
                      <span>Remise: {offer.reason}</span>
                      <span>-{offer.type === 'percentage' ? `${offer.value}%` : `${offer.value} FCFA`}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t pt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{calculateTotal().toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>

              <Button 
                onClick={handleAddToCartWithAccompaniments}
                className="w-full"
                disabled={!selectedProduct2}
              >
                Ajouter au Panier
              </Button>
            </CardContent>
          </Card>

          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => addOffer("Geste commercial", 10, "percentage", "Serveur")}
              >
                <Percent className="h-4 w-4 mr-2" />
                Remise 10%
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => addOffer("Client fidèle", 1000, "amount", "Serveur")}
              >
                <Gift className="h-4 w-4 mr-2" />
                Offrir 1000 FCFA
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => {
                  const defaultAccomp = getDefaultAccompaniments(selectedProduct2?.id || '');
                  const defaultSelection: Record<string, number> = {};
                  defaultAccomp.forEach(acc => {
                    defaultSelection[acc.id] = 1;
                  });
                  setSelectedAccompaniments(defaultSelection);
                }}
              >
                <Utensils className="h-4 w-4 mr-2" />
                Accompagnements Standard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}