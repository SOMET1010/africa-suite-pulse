import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ProductData {
  name: string;
  code: string;
  description?: string;
  is_for_sale: boolean;
  is_stock_managed: boolean;
  unit_sale: string;
  unit_usage: string;
  unit_storage: string;
  conversion_factor_usage: number;
  conversion_factor_storage: number;
  price_ht?: number;
  tax_rate: number;
  min_stock?: number;
  max_stock?: number;
  storage_location?: string;
  category_id?: string;
  is_composed: boolean;
}

interface ProductCreationWizardProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProductData) => void;
  categories: Array<{ id: string; name: string; }>;
}

const UNITS = [
  'unité', 'kg', 'g', 'l', 'ml', 'pièce', 'boîte', 'carton', 'palette'
];

const STEP_NAMES = [
  'Type d\'article',
  'Informations générales', 
  'Unités et conversions',
  'Prix et taxes',
  'Stock et emplacement',
  'Validation'
];

export default function ProductCreationWizard({ 
  open, 
  onClose, 
  onSubmit,
  categories 
}: ProductCreationWizardProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [productData, setProductData] = useState<ProductData>({
    name: '',
    code: '',
    description: '',
    is_for_sale: true,
    is_stock_managed: true,
    unit_sale: 'unité',
    unit_usage: 'unité',
    unit_storage: 'unité',
    conversion_factor_usage: 1,
    conversion_factor_storage: 1,
    tax_rate: 0,
    is_composed: false
  });

  const updateProductData = (field: keyof ProductData, value: any) => {
    setProductData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < STEP_NAMES.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (!productData.name.trim()) {
      toast({ title: "Erreur", description: "Le nom de l'article est requis", variant: "destructive" });
      return;
    }
    onSubmit(productData);
    onClose();
    setCurrentStep(0);
    setProductData({
      name: '',
      code: '',
      description: '',
      is_for_sale: true,
      is_stock_managed: true,
      unit_sale: 'unité',
      unit_usage: 'unité',
      unit_storage: 'unité',
      conversion_factor_usage: 1,
      conversion_factor_storage: 1,
      tax_rate: 0,
      is_composed: false
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <AlertCircle className="mx-auto h-16 w-16 text-orange-500" />
              <h3 className="text-lg font-semibold">Configuration de l'article</h3>
              <p className="text-muted-foreground">
                Répondez aux questions suivantes pour configurer votre article
              </p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>Cet article sera-t-il en vente ?</span>
                </CardTitle>
                <CardDescription>
                  Si non, l'article ne sera disponible que pour la composition d'autres articles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_for_sale"
                    checked={productData.is_for_sale}
                    onCheckedChange={(checked) => updateProductData('is_for_sale', checked)}
                  />
                  <Label htmlFor="is_for_sale">
                    {productData.is_for_sale ? 'Oui, en vente' : 'Non, composition uniquement'}
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cet article sera-t-il géré en stock ?</CardTitle>
                <CardDescription>
                  Si oui, vous pourrez définir des seuils de stock mini/maxi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_stock_managed"
                    checked={productData.is_stock_managed}
                    onCheckedChange={(checked) => updateProductData('is_stock_managed', checked)}
                  />
                  <Label htmlFor="is_stock_managed">
                    {productData.is_stock_managed ? 'Oui, géré en stock' : 'Non, pas de gestion de stock'}
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'article *</Label>
                <Input
                  id="name"
                  value={productData.name}
                  onChange={(e) => updateProductData('name', e.target.value)}
                  placeholder="Ex: Pizza Margherita"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code article</Label>
                <Input
                  id="code"
                  value={productData.code}
                  onChange={(e) => updateProductData('code', e.target.value)}
                  placeholder="Ex: PIZ001"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={productData.description}
                onChange={(e) => updateProductData('description', e.target.value)}
                placeholder="Description de l'article..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select
                value={productData.category_id}
                onValueChange={(value) => updateProductData('category_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-sm text-muted-foreground">
              <p><strong>Unité de vente :</strong> Unité dans laquelle le produit est vendu</p>
              <p><strong>Unité d'utilisation :</strong> Unité utilisée dans les recettes</p>
              <p><strong>Unité de stockage :</strong> Unité utilisée pour stocker le produit</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit_sale">Unité de vente</Label>
                <Select
                  value={productData.unit_sale}
                  onValueChange={(value) => updateProductData('unit_sale', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((unit) => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit_usage">Unité d'utilisation</Label>
                <Select
                  value={productData.unit_usage}
                  onValueChange={(value) => updateProductData('unit_usage', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((unit) => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit_storage">Unité de stockage</Label>
                <Select
                  value={productData.unit_storage}
                  onValueChange={(value) => updateProductData('unit_storage', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((unit) => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="conversion_usage">Facteur conversion utilisation</Label>
                <Input
                  id="conversion_usage"
                  type="number"
                  step="0.001"
                  value={productData.conversion_factor_usage}
                  onChange={(e) => updateProductData('conversion_factor_usage', parseFloat(e.target.value) || 1)}
                />
                <p className="text-xs text-muted-foreground">
                  1 {productData.unit_sale} = {productData.conversion_factor_usage} {productData.unit_usage}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="conversion_storage">Facteur conversion stockage</Label>
                <Input
                  id="conversion_storage"
                  type="number"
                  step="0.001"
                  value={productData.conversion_factor_storage}
                  onChange={(e) => updateProductData('conversion_factor_storage', parseFloat(e.target.value) || 1)}
                />
                <p className="text-xs text-muted-foreground">
                  1 {productData.unit_sale} = {productData.conversion_factor_storage} {productData.unit_storage}
                </p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            {productData.is_for_sale && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price_ht">Prix de vente HT</Label>
                    <Input
                      id="price_ht"
                      type="number"
                      step="0.01"
                      value={productData.price_ht || ''}
                      onChange={(e) => updateProductData('price_ht', parseFloat(e.target.value) || undefined)}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tax_rate">Taux de taxe (%)</Label>
                    <Input
                      id="tax_rate"
                      type="number"
                      step="0.01"
                      value={productData.tax_rate}
                      onChange={(e) => updateProductData('tax_rate', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {productData.price_ht && (
                  <Card>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Prix HT</p>
                          <p className="font-semibold">{productData.price_ht?.toFixed(2)} F</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Taxe</p>
                          <p className="font-semibold">{((productData.price_ht * productData.tax_rate) / 100).toFixed(2)} F</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Prix TTC</p>
                          <p className="font-semibold text-primary">
                            {(productData.price_ht * (1 + productData.tax_rate / 100)).toFixed(2)} F
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {!productData.is_for_sale && (
              <Card>
                <CardContent className="pt-4">
                  <p className="text-muted-foreground text-center">
                    Cet article n'étant pas en vente, aucun prix n'est requis.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            {productData.is_stock_managed ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min_stock">Stock minimum</Label>
                    <Input
                      id="min_stock"
                      type="number"
                      value={productData.min_stock || ''}
                      onChange={(e) => updateProductData('min_stock', parseInt(e.target.value) || undefined)}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_stock">Stock maximum</Label>
                    <Input
                      id="max_stock"
                      type="number"
                      value={productData.max_stock || ''}
                      onChange={(e) => updateProductData('max_stock', parseInt(e.target.value) || undefined)}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storage_location">Emplacement de stockage</Label>
                  <Input
                    id="storage_location"
                    value={productData.storage_location || ''}
                    onChange={(e) => updateProductData('storage_location', e.target.value)}
                    placeholder="Ex: Réfrigérateur, Congélateur, Réserve..."
                  />
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="pt-4">
                  <p className="text-muted-foreground text-center">
                    Cet article n'étant pas géré en stock, aucune configuration de stock n'est nécessaire.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
              <h3 className="text-lg font-semibold mt-4">Validation de l'article</h3>
              <p className="text-muted-foreground">
                Vérifiez les informations avant de créer l'article
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Nom</p>
                    <p className="font-semibold">{productData.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Code</p>
                    <p className="font-semibold">{productData.code || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">En vente</p>
                    <p className="font-semibold">{productData.is_for_sale ? 'Oui' : 'Non'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Géré en stock</p>
                    <p className="font-semibold">{productData.is_stock_managed ? 'Oui' : 'Non'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Unité de vente</p>
                    <p className="font-semibold">{productData.unit_sale}</p>
                  </div>
                  {productData.is_for_sale && productData.price_ht && (
                    <div>
                      <p className="text-muted-foreground">Prix TTC</p>
                      <p className="font-semibold text-primary">
                        {(productData.price_ht * (1 + productData.tax_rate / 100)).toFixed(2)} F
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Programmation d'un nouvel article</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress steps */}
          <div className="flex items-center justify-between">
            {STEP_NAMES.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${index <= currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                  }
                `}>
                  {index + 1}
                </div>
                {index < STEP_NAMES.length - 1 && (
                  <div className={`
                    w-16 h-0.5 mx-2
                    ${index < currentStep ? 'bg-primary' : 'bg-muted'}
                  `} />
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <h3 className="font-semibold">{STEP_NAMES[currentStep]}</h3>
          </div>

          {renderStep()}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Précédent
            </Button>

            {currentStep < STEP_NAMES.length - 1 ? (
              <Button onClick={nextStep}>
                Suivant
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                Créer l'article
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}