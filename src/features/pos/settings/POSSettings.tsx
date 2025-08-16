import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Settings, Printer, Receipt, CreditCard, Percent, DollarSign, Globe, Bell, Package, Grid3X3, Keyboard, Plus, Edit, Trash2, Download, Upload } from "lucide-react";
import { useSystemSettings } from "../hooks/useSystemSettings";
import { useToast } from "@/hooks/use-toast";
import { usePOSCategories, useCreatePOSCategory, useUpdatePOSCategory, useDeletePOSCategory, useDuplicatePOSCategory, useReorderPOSCategories } from "../hooks/usePOSData";
import { CategoryDialog, type CategoryFormData } from "../components/CategoryDialog";
import { OutletSelector } from "../components/OutletSelector";
import { DraggableCategoryList } from "../components/DraggableCategoryList";
import { ImportExportDialog } from "../components/ImportExportDialog";
import { FamilyManagement } from "../components/FamilyManagement";
import { KeyboardManager } from "../components/KeyboardManager";
import EnhancedProductManagement from "../components/EnhancedProductManagement";
import type { POSCategory } from "../types";

export function POSSettings() {
  const { settings, isLoading, updateSetting, saveSettings, isSaving } = useSystemSettings();
  const { toast } = useToast();
  
  // State for category management
  const [selectedOutlet, setSelectedOutlet] = useState<string>("");
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [importExportDialogOpen, setImportExportDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<POSCategory | null>(null);
  
  // Queries and mutations
  const { data: categories, isLoading: categoriesLoading } = usePOSCategories(selectedOutlet);
  const createCategory = useCreatePOSCategory();
  const updateCategory = useUpdatePOSCategory();
  const deleteCategory = useDeletePOSCategory();
  const duplicateCategory = useDuplicatePOSCategory();
  const reorderCategories = useReorderPOSCategories();

  // Helper function to get setting value
  const getSetting = (key: string, defaultValue: any = "") => {
    const setting = settings.find(s => s.setting_key === key);
    return setting ? setting.setting_value : defaultValue;
  };

  // Helper function to update setting
  const handleSettingChange = (key: string, value: any) => {
    updateSetting(key, value);
  };

  const handleSave = () => {
    saveSettings();
  };

  // Category management handlers
  const handleCreateCategory = () => {
    if (!selectedOutlet) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un point de vente",
        variant: "destructive",
      });
      return;
    }
    setSelectedCategory(null);
    setCategoryDialogOpen(true);
  };

  const handleEditCategory = (category: POSCategory) => {
    setSelectedCategory(category);
    setCategoryDialogOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
      await deleteCategory.mutateAsync(categoryId);
    }
  };

  const handleDuplicateCategory = async (categoryId: string) => {
    await duplicateCategory.mutateAsync(categoryId);
  };

  const handleReorderCategories = async (startIndex: number, endIndex: number) => {
    if (!categories) return;

    const reorderedCategories = Array.from(categories);
    const [removed] = reorderedCategories.splice(startIndex, 1);
    reorderedCategories.splice(endIndex, 0, removed);

    // Update sort orders
    const updates = reorderedCategories.map((category, index) => ({
      id: category.id,
      sort_order: index,
    }));

    await reorderCategories.mutateAsync(updates);
  };

  const handleExportCategory = (category: POSCategory) => {
    const exportData = [{
      name: category.name,
      description: category.description,
      color: category.color,
      icon: (category as any).icon || 'utensils',
      sort_order: category.sort_order
    }];

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `category_${category.name.toLowerCase().replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportCategories = async (importedCategories: any[]) => {
    if (!selectedOutlet) return;

    const promises = importedCategories.map((cat, index) => 
      createCategory.mutateAsync({
        outletId: selectedOutlet,
        name: cat.name,
        description: cat.description || '',
        color: cat.color || '#6366f1',
        icon: cat.icon || 'utensils',
        sortOrder: (categories?.length || 0) + index,
      })
    );

    await Promise.all(promises);
  };

  const handleSaveCategory = async (data: CategoryFormData) => {
    try {
      if (selectedCategory) {
        await updateCategory.mutateAsync({
          id: selectedCategory.id,
          ...data,
        });
      } else {
        await createCategory.mutateAsync({
          outletId: selectedOutlet,
          ...data,
        });
      }
      setCategoryDialogOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            Paramètres POS
          </h1>
          <p className="text-muted-foreground">
            Configuration du système de point de vente
          </p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-primary to-primary-dark hover:opacity-90"
        >
          {isSaving ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="categories">Catégories</TabsTrigger>
          <TabsTrigger value="keyboards">Claviers</TabsTrigger>
          <TabsTrigger value="payment">Paiements</TabsTrigger>
          <TabsTrigger value="taxes">Taxes</TabsTrigger>
          <TabsTrigger value="receipt">Reçus</TabsTrigger>
          <TabsTrigger value="printer">Imprimante</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuration Générale
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="pos_name">Nom du point de vente</Label>
                  <Input
                    id="pos_name"
                    value={getSetting('pos_name', '')}
                    onChange={(e) => handleSettingChange('pos_name', e.target.value)}
                    placeholder="Mon Restaurant POS"
                  />
                </div>
                
                <div>
                  <Label htmlFor="default_currency">Devise par défaut</Label>
                  <Select 
                    value={getSetting('default_currency', 'XOF')} 
                    onValueChange={(value) => handleSettingChange('default_currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XOF">Franc CFA (XOF)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="USD">Dollar US (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="table_prefix">Préfixe des tables</Label>
                  <Input
                    id="table_prefix"
                    value={getSetting('table_prefix', 'T')}
                    onChange={(e) => handleSettingChange('table_prefix', e.target.value)}
                    placeholder="T"
                  />
                </div>

                <div>
                  <Label htmlFor="order_prefix">Préfixe des commandes</Label>
                  <Input
                    id="order_prefix"
                    value={getSetting('order_prefix', 'CMD')}
                    onChange={(e) => handleSettingChange('order_prefix', e.target.value)}
                    placeholder="CMD"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto_print_kitchen">Impression cuisine automatique</Label>
                    <p className="text-sm text-muted-foreground">
                      Imprimer automatiquement les commandes en cuisine
                    </p>
                  </div>
                  <Switch
                    id="auto_print_kitchen"
                    checked={getSetting('auto_print_kitchen', false)}
                    onCheckedChange={(checked) => handleSettingChange('auto_print_kitchen', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allow_discount">Autoriser les remises</Label>
                    <p className="text-sm text-muted-foreground">
                      Permettre aux utilisateurs d'appliquer des remises
                    </p>
                  </div>
                  <Switch
                    id="allow_discount"
                    checked={getSetting('allow_discount', true)}
                    onCheckedChange={(checked) => handleSettingChange('allow_discount', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="require_customer">Client obligatoire</Label>
                    <p className="text-sm text-muted-foreground">
                      Exiger la sélection d'un client pour chaque commande
                    </p>
                  </div>
                  <Switch
                    id="require_customer"
                    checked={getSetting('require_customer', false)}
                    onCheckedChange={(checked) => handleSettingChange('require_customer', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Gestion des Produits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <OutletSelector
                value={selectedOutlet}
                onValueChange={setSelectedOutlet}
                label="Point de vente"
                placeholder="Sélectionner un point de vente pour gérer les produits"
              />

              {selectedOutlet ? (
                <EnhancedProductManagement outletId={selectedOutlet} />
              ) : (
                <div className="border rounded-lg p-8 text-center text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Sélectionnez un point de vente</p>
                  <p className="text-sm">Choisissez un point de vente pour gérer ses produits</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid3X3 className="w-5 h-5" />
                Catégories et Familles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Outlet Selection */}
              <OutletSelector
                value={selectedOutlet}
                onValueChange={setSelectedOutlet}
                label="Point de vente"
                placeholder="Sélectionner un point de vente pour gérer les catégories"
              />

              {selectedOutlet && (
                <>
                  <FamilyManagement selectedOutlet={selectedOutlet} />
                  
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="font-medium">Catégories</h3>
                        <p className="text-sm text-muted-foreground">
                          Organisez vos produits par catégories
                        </p>
                      </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setImportExportDialogOpen(true)}
                            className="gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            Import/Export
                          </Button>
                          <Button onClick={handleCreateCategory} className="gap-2">
                            <Plus className="w-4 h-4" />
                            Nouvelle Catégorie
                          </Button>
                        </div>
                      </div>

                      {categoriesLoading ? (
                        <div className="border rounded-lg p-8 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-muted-foreground">Chargement des catégories...</p>
                        </div>
                      ) : categories && categories.length > 0 ? (
                        <DraggableCategoryList
                          categories={categories}
                          onReorder={handleReorderCategories}
                          onEdit={handleEditCategory}
                          onDelete={handleDeleteCategory}
                          onDuplicate={handleDuplicateCategory}
                          onExport={handleExportCategory}
                        />
                      ) : (
                        <div className="border rounded-lg p-8 text-center text-muted-foreground">
                          <Grid3X3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>Aucune catégorie configurée</p>
                          <p className="text-sm">Cliquez sur "Nouvelle Catégorie" pour commencer</p>
                        </div>
                      )}
                      </div>
                    </>
                  )}

              {!selectedOutlet && (
                <div className="border rounded-lg p-8 text-center text-muted-foreground">
                  <Grid3X3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Sélectionnez un point de vente</p>
                  <p className="text-sm">Choisissez un point de vente pour gérer ses catégories</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dialogs */}
          <CategoryDialog
            open={categoryDialogOpen}
            onOpenChange={setCategoryDialogOpen}
            category={selectedCategory}
            onSave={handleSaveCategory}
            isLoading={createCategory.isPending || updateCategory.isPending}
          />
          
          <ImportExportDialog
            open={importExportDialogOpen}
            onOpenChange={setImportExportDialogOpen}
            categories={categories || []}
            outletId={selectedOutlet}
            onImport={handleImportCategories}
          />
        </TabsContent>

        <TabsContent value="keyboards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Keyboard className="w-5 h-5" />
                Claviers Tactiles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <OutletSelector
                value={selectedOutlet}
                onValueChange={setSelectedOutlet}
                label="Point de vente"
                placeholder="Sélectionner un point de vente pour gérer les claviers"
              />

              {selectedOutlet ? (
                <KeyboardManager selectedOutlet={selectedOutlet} />
              ) : (
                <div className="border rounded-lg p-8 text-center text-muted-foreground">
                  <Keyboard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Sélectionnez un point de vente</p>
                  <p className="text-sm">Choisissez un point de vente pour gérer ses claviers</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Méthodes de Paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Configuration des Claviers</h3>
                  <p className="text-sm text-muted-foreground">Créer et organiser les claviers pour la prise de commande</p>
                </div>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nouveau Clavier
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Claviers Existants</h4>
                  <div className="space-y-2">
                    <Card className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h5 className="font-medium">Clavier Principal</h5>
                          <p className="text-sm text-muted-foreground">16 boutons configurés</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            Dupliquer
                          </Button>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h5 className="font-medium">Clavier Boissons</h5>
                          <p className="text-sm text-muted-foreground">12 boutons configurés</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            Dupliquer
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Configuration Rapide</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="keyboard_layout">Disposition par défaut</Label>
                      <Select value="4x4" onValueChange={() => {}}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3x3">3x3 (9 boutons)</SelectItem>
                          <SelectItem value="4x4">4x4 (16 boutons)</SelectItem>
                          <SelectItem value="5x4">5x4 (20 boutons)</SelectItem>
                          <SelectItem value="6x4">6x4 (24 boutons)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="button_size">Taille des boutons</Label>
                      <Select value="medium" onValueChange={() => {}}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Petits</SelectItem>
                          <SelectItem value="medium">Moyens</SelectItem>
                          <SelectItem value="large">Grands</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Images sur boutons</Label>
                        <p className="text-sm text-muted-foreground">Afficher les images produits</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Prix sur boutons</Label>
                        <p className="text-sm text-muted-foreground">Afficher les prix</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 border rounded-lg bg-muted/30">
                <h4 className="font-medium mb-2">Aperçu du Clavier</h4>
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 16 }, (_, i) => (
                    <div key={i} className="aspect-square bg-background border rounded-md flex items-center justify-center text-xs font-medium">
                      Btn {i + 1}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Méthodes de Paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium">Espèces</p>
                      <p className="text-sm text-muted-foreground">Paiement en liquide</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Activé</Badge>
                    <Switch
                      checked={getSetting('payment_cash_enabled', true)}
                      onCheckedChange={(checked) => handleSettingChange('payment_cash_enabled', checked)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Carte bancaire</p>
                      <p className="text-sm text-muted-foreground">Visa, Mastercard, etc.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Activé</Badge>
                    <Switch
                      checked={getSetting('payment_card_enabled', true)}
                      onCheckedChange={(checked) => handleSettingChange('payment_card_enabled', checked)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="font-medium">Mobile Money</p>
                      <p className="text-sm text-muted-foreground">Orange Money, MTN, etc.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Activé</Badge>
                    <Switch
                      checked={getSetting('payment_mobile_enabled', true)}
                      onCheckedChange={(checked) => handleSettingChange('payment_mobile_enabled', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="default_payment_method">Méthode par défaut</Label>
                  <Select 
                    value={getSetting('default_payment_method', 'cash')} 
                    onValueChange={(value) => handleSettingChange('default_payment_method', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Espèces</SelectItem>
                      <SelectItem value="card">Carte bancaire</SelectItem>
                      <SelectItem value="mobile">Mobile Money</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="cash_rounding">Arrondi espèces</Label>
                  <Select 
                    value={getSetting('cash_rounding', '1')} 
                    onValueChange={(value) => handleSettingChange('cash_rounding', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 FCFA</SelectItem>
                      <SelectItem value="5">5 FCFA</SelectItem>
                      <SelectItem value="10">10 FCFA</SelectItem>
                      <SelectItem value="25">25 FCFA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taxes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="w-5 h-5" />
                Taxes et Frais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="tax_enabled">Activation des taxes</Label>
                    <p className="text-sm text-muted-foreground">
                      Activer le calcul automatique des taxes
                    </p>
                  </div>
                  <Switch
                    id="tax_enabled"
                    checked={getSetting('tax_enabled', true)}
                    onCheckedChange={(checked) => handleSettingChange('tax_enabled', checked)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="default_tax_rate">Taux de TVA par défaut (%)</Label>
                    <Input
                      id="default_tax_rate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={getSetting('default_tax_rate', 18)}
                      onChange={(e) => handleSettingChange('default_tax_rate', Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="service_charge_rate">Frais de service (%)</Label>
                    <Input
                      id="service_charge_rate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={getSetting('service_charge_rate', 0)}
                      onChange={(e) => handleSettingChange('service_charge_rate', Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="tax_inclusive">Prix TTC</Label>
                    <p className="text-sm text-muted-foreground">
                      Les prix affichés incluent les taxes
                    </p>
                  </div>
                  <Switch
                    id="tax_inclusive"
                    checked={getSetting('tax_inclusive', true)}
                    onCheckedChange={(checked) => handleSettingChange('tax_inclusive', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto_service_charge">Frais de service automatique</Label>
                    <p className="text-sm text-muted-foreground">
                      Appliquer automatiquement les frais de service
                    </p>
                  </div>
                  <Switch
                    id="auto_service_charge"
                    checked={getSetting('auto_service_charge', false)}
                    onCheckedChange={(checked) => handleSettingChange('auto_service_charge', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipt" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Configuration des Reçus
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="receipt_header">En-tête du reçu</Label>
                  <Textarea
                    id="receipt_header"
                    value={getSetting('receipt_header', 'Mon Restaurant\nAdresse du restaurant\nTél: +225 XX XX XX XX')}
                    onChange={(e) => handleSettingChange('receipt_header', e.target.value)}
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="receipt_footer">Pied de page du reçu</Label>
                  <Textarea
                    id="receipt_footer"
                    value={getSetting('receipt_footer', 'Merci de votre visite!\nÀ bientôt!')}
                    onChange={(e) => handleSettingChange('receipt_footer', e.target.value)}
                    rows={4}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto_print_receipt">Impression automatique</Label>
                    <p className="text-sm text-muted-foreground">
                      Imprimer automatiquement le reçu après paiement
                    </p>
                  </div>
                  <Switch
                    id="auto_print_receipt"
                    checked={getSetting('auto_print_receipt', true)}
                    onCheckedChange={(checked) => handleSettingChange('auto_print_receipt', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show_tax_details">Détail des taxes</Label>
                    <p className="text-sm text-muted-foreground">
                      Afficher le détail des taxes sur le reçu
                    </p>
                  </div>
                  <Switch
                    id="show_tax_details"
                    checked={getSetting('show_tax_details', true)}
                    onCheckedChange={(checked) => handleSettingChange('show_tax_details', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show_qr_code">Code QR</Label>
                    <p className="text-sm text-muted-foreground">
                      Inclure un code QR sur le reçu
                    </p>
                  </div>
                  <Switch
                    id="show_qr_code"
                    checked={getSetting('show_qr_code', false)}
                    onCheckedChange={(checked) => handleSettingChange('show_qr_code', checked)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="receipt_width">Largeur du reçu</Label>
                <Select 
                  value={getSetting('receipt_width', '80mm')} 
                  onValueChange={(value) => handleSettingChange('receipt_width', value)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="58mm">58mm</SelectItem>
                    <SelectItem value="80mm">80mm</SelectItem>
                    <SelectItem value="A4">A4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="printer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Printer className="w-5 h-5" />
                Configuration Imprimante
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="receipt_printer">Imprimante reçus</Label>
                  <Select 
                    value={getSetting('receipt_printer', 'default')} 
                    onValueChange={(value) => handleSettingChange('receipt_printer', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Imprimante par défaut</SelectItem>
                      <SelectItem value="thermal">Imprimante thermique</SelectItem>
                      <SelectItem value="network">Imprimante réseau</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="kitchen_printer">Imprimante cuisine</Label>
                  <Select 
                    value={getSetting('kitchen_printer', 'none')} 
                    onValueChange={(value) => handleSettingChange('kitchen_printer', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune</SelectItem>
                      <SelectItem value="thermal">Imprimante thermique</SelectItem>
                      <SelectItem value="network">Imprimante réseau</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="printer_ip">Adresse IP imprimante réseau</Label>
                  <Input
                    id="printer_ip"
                    value={getSetting('printer_ip', '')}
                    onChange={(e) => handleSettingChange('printer_ip', e.target.value)}
                    placeholder="192.168.1.100"
                  />
                </div>

                <div className="flex gap-4">
                  <Button variant="outline">
                    Tester Imprimante Reçus
                  </Button>
                  <Button variant="outline">
                    Tester Imprimante Cuisine
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sound_enabled">Sons système</Label>
                    <p className="text-sm text-muted-foreground">
                      Activer les notifications sonores
                    </p>
                  </div>
                  <Switch
                    id="sound_enabled"
                    checked={getSetting('sound_enabled', true)}
                    onCheckedChange={(checked) => handleSettingChange('sound_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="order_sound">Son nouvelle commande</Label>
                    <p className="text-sm text-muted-foreground">
                      Jouer un son lors de nouvelles commandes
                    </p>
                  </div>
                  <Switch
                    id="order_sound"
                    checked={getSetting('order_sound', true)}
                    onCheckedChange={(checked) => handleSettingChange('order_sound', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="payment_sound">Son paiement</Label>
                    <p className="text-sm text-muted-foreground">
                      Jouer un son lors des paiements
                    </p>
                  </div>
                  <Switch
                    id="payment_sound"
                    checked={getSetting('payment_sound', true)}
                    onCheckedChange={(checked) => handleSettingChange('payment_sound', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="low_stock_alerts">Alertes stock faible</Label>
                    <p className="text-sm text-muted-foreground">
                      Notification en cas de stock faible
                    </p>
                  </div>
                  <Switch
                    id="low_stock_alerts"
                    checked={getSetting('low_stock_alerts', true)}
                    onCheckedChange={(checked) => handleSettingChange('low_stock_alerts', checked)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notification_volume">Volume des notifications</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    value={getSetting('notification_volume', 50)}
                    onChange={(e) => handleSettingChange('notification_volume', Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm w-12 text-center">
                    {getSetting('notification_volume', 50)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}