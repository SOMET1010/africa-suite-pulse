import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Clock, Percent, GripVertical, Save, Copy } from 'lucide-react';

interface MenuCategory {
  id: string;
  name: string;
  order: number;
  items: MenuItem[];
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  category: string;
  modifiers: string[];
  allergens: string[];
  available: boolean;
}

interface PricingRule {
  id: string;
  name: string;
  type: 'happy_hour' | 'promotion' | 'bulk' | 'time_based';
  conditions: Record<string, any>;
  discount: number;
  active: boolean;
  startDate: string;
  endDate: string;
}

interface BusinessTemplate {
  id: string;
  name: string;
  type: 'restaurant' | 'fast_food' | 'bar' | 'cafe';
  description: string;
  categories: MenuCategory[];
  defaultPricing: PricingRule[];
}

export function BusinessProgrammingInterface() {
  const [activeTemplate, setActiveTemplate] = useState<BusinessTemplate | null>(null);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([
    {
      id: '1',
      name: 'Entrées',
      order: 1,
      items: [
        {
          id: '1-1',
          name: 'Salade Caesar',
          price: 12.50,
          description: 'Salade romaine, croûtons, parmesan, sauce caesar',
          category: '1',
          modifiers: ['sans_croûtons', 'extra_parmesan'],
          allergens: ['gluten', 'oeufs', 'lactose'],
          available: true
        }
      ]
    }
  ]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([
    {
      id: '1',
      name: 'Happy Hour',
      type: 'happy_hour',
      conditions: { timeStart: '17:00', timeEnd: '19:00', days: [1,2,3,4,5] },
      discount: 20,
      active: true,
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    }
  ]);

  const businessTemplates: BusinessTemplate[] = [
    {
      id: 'restaurant',
      name: 'Restaurant Traditionnel',
      type: 'restaurant',
      description: 'Menu structuré avec entrées, plats, desserts',
      categories: [
        { id: 'entrees', name: 'Entrées', order: 1, items: [] },
        { id: 'plats', name: 'Plats Principaux', order: 2, items: [] },
        { id: 'desserts', name: 'Desserts', order: 3, items: [] },
        { id: 'boissons', name: 'Boissons', order: 4, items: [] }
      ],
      defaultPricing: []
    },
    {
      id: 'fast_food',
      name: 'Fast Food',
      type: 'fast_food',
      description: 'Menus, burgers, accompagnements',
      categories: [
        { id: 'menus', name: 'Menus', order: 1, items: [] },
        { id: 'burgers', name: 'Burgers', order: 2, items: [] },
        { id: 'accompagnements', name: 'Accompagnements', order: 3, items: [] },
        { id: 'boissons', name: 'Boissons', order: 4, items: [] }
      ],
      defaultPricing: []
    },
    {
      id: 'bar',
      name: 'Bar / Café',
      type: 'bar',
      description: 'Boissons, cocktails, petite restauration',
      categories: [
        { id: 'cocktails', name: 'Cocktails', order: 1, items: [] },
        { id: 'bieres', name: 'Bières', order: 2, items: [] },
        { id: 'vins', name: 'Vins', order: 3, items: [] },
        { id: 'soft', name: 'Boissons Sans Alcool', order: 4, items: [] },
        { id: 'snacks', name: 'Snacks', order: 5, items: [] }
      ],
      defaultPricing: []
    }
  ];

  const handleApplyTemplate = (template: BusinessTemplate) => {
    setActiveTemplate(template);
    setMenuCategories(template.categories);
    setPricingRules(template.defaultPricing);
  };

  const addCategory = () => {
    const newCategory: MenuCategory = {
      id: Date.now().toString(),
      name: 'Nouvelle Catégorie',
      order: menuCategories.length + 1,
      items: []
    };
    setMenuCategories([...menuCategories, newCategory]);
  };

  const addMenuItem = (categoryId: string) => {
    const newItem: MenuItem = {
      id: Date.now().toString(),
      name: 'Nouvel Article',
      price: 0,
      category: categoryId,
      modifiers: [],
      allergens: [],
      available: true
    };
    
    setMenuCategories(categories => 
      categories.map(cat => 
        cat.id === categoryId 
          ? { ...cat, items: [...cat.items, newItem] }
          : cat
      )
    );
  };

  const addPricingRule = () => {
    const newRule: PricingRule = {
      id: Date.now().toString(),
      name: 'Nouvelle Règle',
      type: 'promotion',
      conditions: {},
      discount: 0,
      active: false,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    setPricingRules([...pricingRules, newRule]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Interface de Programmation Métier</h2>
          <p className="text-muted-foreground">Configuration avancée des menus et tarification</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Copy className="w-4 h-4 mr-2" />
            Dupliquer Config
          </Button>
          <Button>
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">Templates Métier</TabsTrigger>
          <TabsTrigger value="menu">Configuration Menu</TabsTrigger>
          <TabsTrigger value="pricing">Tarification Dynamique</TabsTrigger>
          <TabsTrigger value="modifiers">Modifications & Options</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Templates de Configuration</CardTitle>
              <CardDescription>
                Utilisez un template prédéfini selon votre type d'établissement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {businessTemplates.map(template => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{template.name}</h3>
                          <Badge variant="outline">{template.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                        <div className="text-xs text-muted-foreground">
                          {template.categories.length} catégories configurées
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleApplyTemplate(template)}
                        >
                          Appliquer ce Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {activeTemplate && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-green-800">
                      Template "{activeTemplate.name}" appliqué avec succès
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Configuration du Menu
                <Button onClick={addCategory}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter Catégorie
                </Button>
              </CardTitle>
              <CardDescription>
                Organisez vos articles par catégories avec drag & drop
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {menuCategories.map(category => (
                <Card key={category.id} className="border-l-4 border-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                        <Input 
                          value={category.name}
                          className="font-semibold border-none px-0 focus-visible:ring-0"
                          onChange={(e) => {
                            setMenuCategories(categories =>
                              categories.map(cat =>
                                cat.id === category.id
                                  ? { ...cat, name: e.target.value }
                                  : cat
                              )
                            );
                          }}
                        />
                        <Badge variant="secondary">{category.items.length} articles</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => addMenuItem(category.id)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Article
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {category.items.map(item => (
                        <div key={item.id} className="p-3 border rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <Input 
                              value={item.name}
                              className="border-none px-0 font-medium focus-visible:ring-0"
                            />
                            <div className="flex items-center gap-2">
                              <Input 
                                type="number"
                                value={item.price}
                                className="w-20 text-right"
                                step="0.01"
                              />
                              <span className="text-sm text-muted-foreground">€</span>
                              <Switch checked={item.available} />
                            </div>
                          </div>
                          {item.description && (
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          )}
                          <div className="flex flex-wrap gap-1">
                            {item.allergens.map(allergen => (
                              <Badge key={allergen} variant="destructive" className="text-xs">
                                {allergen}
                              </Badge>
                            ))}
                            {item.modifiers.map(modifier => (
                              <Badge key={modifier} variant="secondary" className="text-xs">
                                {modifier}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Tarification Dynamique
                <Button onClick={addPricingRule}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle Règle
                </Button>
              </CardTitle>
              <CardDescription>
                Gérez les promotions, happy hours et tarifs spéciaux
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pricingRules.map(rule => (
                <Card key={rule.id} className="border-l-4 border-orange-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <Input 
                            value={rule.name}
                            className="border-none px-0 font-semibold focus-visible:ring-0"
                          />
                          <Badge variant="outline">
                            {rule.type === 'happy_hour' && <Clock className="w-3 h-3 mr-1" />}
                            {rule.type === 'promotion' && <Percent className="w-3 h-3 mr-1" />}
                            {rule.type}
                          </Badge>
                          <Switch checked={rule.active} />
                        </div>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                          <div>
                            <Label className="text-xs">Type de remise</Label>
                            <Select value={rule.type}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="happy_hour">Happy Hour</SelectItem>
                                <SelectItem value="promotion">Promotion</SelectItem>
                                <SelectItem value="bulk">Achat Groupé</SelectItem>
                                <SelectItem value="time_based">Horaire</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label className="text-xs">Remise (%)</Label>
                            <Input 
                              type="number"
                              value={rule.discount}
                              min="0"
                              max="100"
                            />
                          </div>
                          
                          <div>
                            <Label className="text-xs">Date début</Label>
                            <Input type="date" value={rule.startDate} />
                          </div>
                          
                          <div>
                            <Label className="text-xs">Date fin</Label>
                            <Input type="date" value={rule.endDate} />
                          </div>
                        </div>
                        
                        {rule.type === 'happy_hour' && (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Heure début</Label>
                              <Input type="time" defaultValue="17:00" />
                            </div>
                            <div>
                              <Label className="text-xs">Heure fin</Label>
                              <Input type="time" defaultValue="19:00" />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modifiers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Modifications & Options</CardTitle>
              <CardDescription>
                Configurez les options de personnalisation des articles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Modificateurs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { name: 'Sans Gluten', price: 0, category: 'Allergie' },
                      { name: 'Extra Fromage', price: 2.50, category: 'Supplément' },
                      { name: 'Sauce à Part', price: 0, category: 'Préparation' },
                      { name: 'Bien Cuit', price: 0, category: 'Cuisson' }
                    ].map((modifier, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <span className="font-medium">{modifier.name}</span>
                          <Badge variant="outline" className="ml-2 text-xs">{modifier.category}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{modifier.price > 0 ? `+${modifier.price}€` : 'Gratuit'}</span>
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un Modificateur
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Allergènes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      'Gluten', 'Lactose', 'Œufs', 'Fruits à coque', 
                      'Arachides', 'Poisson', 'Crustacés', 'Soja'
                    ].map(allergen => (
                      <div key={allergen} className="flex items-center justify-between p-2 border rounded">
                        <span className="font-medium">{allergen}</span>
                        <Switch />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Templates de Modifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { name: 'Burger', mods: ['Cuisson', 'Fromage', 'Sauce'] },
                      { name: 'Pizza', mods: ['Pâte', 'Garniture', 'Taille'] },
                      { name: 'Salade', mods: ['Sauce', 'Allergènes', 'Extras'] }
                    ].map(template => (
                      <div key={template.name} className="p-3 border rounded-lg">
                        <h4 className="font-medium mb-2">{template.name}</h4>
                        <div className="space-y-1">
                          {template.mods.map(mod => (
                            <Badge key={mod} variant="secondary" className="text-xs mr-1">{mod}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
