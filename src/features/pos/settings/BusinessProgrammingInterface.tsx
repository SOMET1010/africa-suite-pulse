import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ChefHat, Clock, Percent, Utensils, Plus, Edit, Trash2, Copy, DragHandleDots2 } from "lucide-react";
import { useSystemSettings } from "../hooks/useSystemSettings";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  ingredients: string[];
  allergens: string[];
  preparationTime: number;
  isAvailable: boolean;
  variations: MenuVariation[];
}

interface MenuVariation {
  id: string;
  name: string;
  priceModifier: number;
  isDefault: boolean;
}

interface PriceRule {
  id: string;
  name: string;
  type: 'happy_hour' | 'promotion' | 'time_based' | 'volume';
  discount: number;
  conditions: any;
  isActive: boolean;
  schedule?: {
    days: string[];
    startTime: string;
    endTime: string;
  };
}

interface BusinessTemplate {
  id: string;
  name: string;
  type: 'restaurant' | 'fast_food' | 'bar' | 'collectivity';
  description: string;
  defaultSettings: any;
  isSelected: boolean;
}

export function BusinessProgrammingInterface() {
  const { settings, updateSetting, saveSettings, isSaving } = useSystemSettings();
  const [activeTab, setActiveTab] = useState("menus");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  const getSetting = (key: string, defaultValue: any = "") => {
    const setting = settings.find(s => s.setting_key === key);
    return setting ? setting.setting_value : defaultValue;
  };

  const handleSettingChange = (key: string, value: any) => {
    updateSetting(key, value);
  };

  // Templates de configuration métier
  const businessTemplates: BusinessTemplate[] = [
    {
      id: "restaurant",
      name: "Restaurant traditionnel",
      type: "restaurant",
      description: "Service à table, carte variée, service complet",
      defaultSettings: {
        tableService: true,
        kitchenPrinting: true,
        multiCourse: true,
        reservations: true
      },
      isSelected: getSetting('business_template', '') === 'restaurant'
    },
    {
      id: "fast_food",
      name: "Fast Food",
      type: "fast_food",
      description: "Service rapide, commandes au comptoir, préparation rapide",
      defaultSettings: {
        tableService: false,
        quickOrders: true,
        takeAway: true,
        simpleMenu: true
      },
      isSelected: getSetting('business_template', '') === 'fast_food'
    },
    {
      id: "bar",
      name: "Bar / Café",
      type: "bar",
      description: "Boissons, snacking, ambiance décontractée",
      defaultSettings: {
        drinkFocus: true,
        happyHour: true,
        quickService: true,
        barTabs: true
      },
      isSelected: getSetting('business_template', '') === 'bar'
    },
    {
      id: "collectivity",
      name: "Restauration collective",
      type: "collectivity",
      description: "Cantines, self-service, gestion de bénéficiaires",
      defaultSettings: {
        selfService: true,
        beneficiaryManagement: true,
        subsidies: true,
        menuPlanning: true
      },
      isSelected: getSetting('business_template', '') === 'collectivity'
    }
  ];

  // Données exemple pour les menus
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: "1",
      name: "Thieboudienne",
      description: "Riz au poisson, légumes variés, sauce rouge traditionnelle",
      price: 2500,
      category: "Plats principaux",
      ingredients: ["Riz", "Poisson", "Légumes", "Tomates", "Oignons"],
      allergens: ["Poisson"],
      preparationTime: 30,
      isAvailable: true,
      variations: [
        { id: "v1", name: "Poisson blanc", priceModifier: 0, isDefault: true },
        { id: "v2", name: "Poisson rouge", priceModifier: 500, isDefault: false }
      ]
    }
  ]);

  const [priceRules, setPriceRules] = useState<PriceRule[]>([
    {
      id: "1",
      name: "Happy Hour",
      type: "happy_hour",
      discount: 20,
      conditions: { categories: ["Boissons"], minItems: 1 },
      isActive: true,
      schedule: {
        days: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"],
        startTime: "17:00",
        endTime: "19:00"
      }
    }
  ]);

  const applyBusinessTemplate = (templateId: string) => {
    const template = businessTemplates.find(t => t.id === templateId);
    if (!template) return;

    handleSettingChange('business_template', templateId);
    
    // Appliquer les paramètres par défaut du template
    Object.entries(template.defaultSettings).forEach(([key, value]) => {
      handleSettingChange(`template_${key}`, value);
    });

    setSelectedTemplate(templateId);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(menuItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setMenuItems(items);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ChefHat className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Interface de Programmation Métier</h2>
            <p className="text-muted-foreground">
              Configuration des menus, prix et modèles d'affaires
            </p>
          </div>
        </div>
        <Button onClick={saveSettings} disabled={isSaving}>
          {isSaving ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">Templates Métier</TabsTrigger>
          <TabsTrigger value="menus">Configurateur Menus</TabsTrigger>
          <TabsTrigger value="pricing">Prix Dynamiques</TabsTrigger>
          <TabsTrigger value="modifications">Modifications</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="w-5 h-5" />
                Templates de Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {businessTemplates.map((template) => (
                  <Card 
                    key={template.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      template.isSelected ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => applyBusinessTemplate(template.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        {template.isSelected && (
                          <Badge className="bg-primary">Sélectionné</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {Object.entries(template.defaultSettings).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center text-sm">
                            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <Badge variant={value ? "default" : "secondary"}>
                              {value ? "Activé" : "Désactivé"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedTemplate && (
                <div className="border rounded-lg p-4 bg-muted/50">
                  <h4 className="font-medium mb-2">Configuration appliquée</h4>
                  <p className="text-sm text-muted-foreground">
                    Le template "{businessTemplates.find(t => t.id === selectedTemplate)?.name}" 
                    a été appliqué avec ses paramètres par défaut.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menus" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="w-5 h-5" />
                Configurateur de Menus
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Articles du menu</h4>
                  <p className="text-sm text-muted-foreground">
                    Glissez-déposez pour réorganiser, configurez variations et accompagnements
                  </p>
                </div>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nouvel Article
                </Button>
              </div>

              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="menu-items">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-3"
                    >
                      {menuItems.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="border rounded-lg p-4 bg-card"
                            >
                              <div className="flex items-start gap-4">
                                <div
                                  {...provided.dragHandleProps}
                                  className="mt-2 text-muted-foreground hover:text-foreground cursor-grab"
                                >
                                  <GripVertical className="w-4 h-4" />
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <h5 className="font-medium">{item.name}</h5>
                                      <p className="text-sm text-muted-foreground">{item.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge>{item.price} FCFA</Badge>
                                      <Switch checked={item.isAvailable} />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Catégorie:</span>
                                      <p>{item.category}</p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Temps préparation:</span>
                                      <p>{item.preparationTime} min</p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Allergènes:</span>
                                      <p>{item.allergens.join(", ") || "Aucun"}</p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Variations:</span>
                                      <p>{item.variations.length} option(s)</p>
                                    </div>
                                  </div>

                                  {item.variations.length > 0 && (
                                    <div className="mt-3 pt-3 border-t">
                                      <p className="text-sm font-medium mb-2">Variations disponibles:</p>
                                      <div className="flex flex-wrap gap-2">
                                        {item.variations.map((variation) => (
                                          <Badge 
                                            key={variation.id} 
                                            variant={variation.isDefault ? "default" : "outline"}
                                          >
                                            {variation.name} 
                                            {variation.priceModifier !== 0 && 
                                              ` (${variation.priceModifier > 0 ? '+' : ''}${variation.priceModifier} FCFA)`
                                            }
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="w-5 h-5" />
                Prix Dynamiques
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Règles de prix</h4>
                  <p className="text-sm text-muted-foreground">
                    Configurez les promotions, happy hours et prix par période
                  </p>
                </div>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nouvelle Règle
                </Button>
              </div>

              <div className="space-y-4">
                {priceRules.map((rule) => (
                  <div key={rule.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium">{rule.name}</h5>
                          <Badge variant={rule.isActive ? "default" : "secondary"}>
                            {rule.isActive ? "Actif" : "Inactif"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Remise de {rule.discount}% - Type: {rule.type}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Switch checked={rule.isActive} />
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {rule.schedule && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Jours:</span>
                          <p>{rule.schedule.days.join(", ")}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Heures:</span>
                          <p>{rule.schedule.startTime} - {rule.schedule.endTime}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Conditions:</span>
                          <p>{Object.entries(rule.conditions).map(([k, v]) => `${k}: ${v}`).join(", ")}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Configuration globale des prix</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Arrondi automatique</Label>
                      <p className="text-sm text-muted-foreground">
                        Arrondir les prix au multiple de 25 FCFA
                      </p>
                    </div>
                    <Switch
                      checked={getSetting('auto_price_rounding', false)}
                      onCheckedChange={(checked) => handleSettingChange('auto_price_rounding', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Prix dégressifs</Label>
                      <p className="text-sm text-muted-foreground">
                        Remises automatiques selon la quantité
                      </p>
                    </div>
                    <Switch
                      checked={getSetting('volume_discounts', false)}
                      onCheckedChange={(checked) => handleSettingChange('volume_discounts', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Système de Modifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="modification_prefix">Préfixe des modifications</Label>
                  <Input
                    id="modification_prefix"
                    value={getSetting('modification_prefix', 'SANS')}
                    onChange={(e) => handleSettingChange('modification_prefix', e.target.value)}
                    placeholder="SANS, AVEC, PLUS"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Gestion des allergènes</Label>
                    <p className="text-sm text-muted-foreground">
                      Alertes automatiques pour les allergènes déclarés
                    </p>
                  </div>
                  <Switch
                    checked={getSetting('allergen_alerts', true)}
                    onCheckedChange={(checked) => handleSettingChange('allergen_alerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Modifications payantes</Label>
                    <p className="text-sm text-muted-foreground">
                      Autoriser des modifications avec supplément de prix
                    </p>
                  </div>
                  <Switch
                    checked={getSetting('paid_modifications', true)}
                    onCheckedChange={(checked) => handleSettingChange('paid_modifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Accompagnements automatiques</Label>
                    <p className="text-sm text-muted-foreground">
                      Proposer automatiquement des accompagnements
                    </p>
                  </div>
                  <Switch
                    checked={getSetting('auto_sides', false)}
                    onCheckedChange={(checked) => handleSettingChange('auto_sides', checked)}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Modifications prédéfinies</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    "Sans oignon", "Sans piment", "Peu salé", "Bien cuit", "Saignant", 
                    "Avec supplément légumes", "Double portion", "Sauce à part"
                  ].map((mod) => (
                    <div key={mod} className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">{mod}</span>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="custom_modifications">Modifications personnalisées</Label>
                <Textarea
                  id="custom_modifications"
                  value={getSetting('custom_modifications', '')}
                  onChange={(e) => handleSettingChange('custom_modifications', e.target.value)}
                  placeholder="Une modification par ligne..."
                  rows={4}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Saisissez une modification par ligne. Utilisez "+" pour les suppléments payants.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}