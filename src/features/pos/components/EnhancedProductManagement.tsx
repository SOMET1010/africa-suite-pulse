import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Package, ShoppingCart, Layers, Download, Upload, Settings } from "lucide-react";
import ProductCreationWizard from './ProductCreationWizard';
import ProductCompositionDialog from './ProductCompositionDialog';
import { usePOSProducts, usePOSCategories } from '../hooks/usePOSData';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EnhancedProductManagementProps {
  outletId: string;
}

export default function EnhancedProductManagement({ outletId }: EnhancedProductManagementProps) {
  const { toast } = useToast();
  const [showWizard, setShowWizard] = useState(false);
  const [showComposition, setShowComposition] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const { data: products = [], isLoading, refetch } = usePOSProducts(outletId);
  const { data: categories = [] } = usePOSCategories(outletId);

  const handleCreateProduct = async (productData: any) => {
    try {
      const { error } = await supabase
        .from('pos_products')
        .insert({
          ...productData,
          outlet_id: outletId,
          org_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast({
        title: "Article créé",
        description: "L'article a été créé avec succès",
      });
      
      refetch();
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'article",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (activeTab) {
      case 'for_sale':
        return matchesSearch && product.is_for_sale;
      case 'stock_managed':
        return matchesSearch && product.is_stock_managed;
      case 'composed':
        return matchesSearch && product.is_composed;
      default:
        return matchesSearch;
    }
  });

  const stats = {
    total: products.length,
    forSale: products.filter(p => p.is_for_sale).length,
    stockManaged: products.filter(p => p.is_stock_managed).length,
    composed: products.filter(p => p.is_composed).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Articles</h2>
          <p className="text-muted-foreground">
            Gérez vos articles avec le workflow inspiré d'Elyx
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Importer
          </Button>
          <Button onClick={() => setShowWizard(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvel Article
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Vente</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.forSale}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gérés en Stock</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.stockManaged}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Articles Composés</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.composed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Rechercher un article..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Products Table with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tous ({stats.total})</TabsTrigger>
          <TabsTrigger value="for_sale">En Vente ({stats.forSale})</TabsTrigger>
          <TabsTrigger value="stock_managed">Stock ({stats.stockManaged})</TabsTrigger>
          <TabsTrigger value="composed">Composés ({stats.composed})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Articles</CardTitle>
              <CardDescription>
                {filteredProducts.length} article(s) trouvé(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Chargement...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun article trouvé
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <h4 className="font-medium">{product.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {product.code && `Code: ${product.code} • `}
                              Unité: {product.unit_sale || 'unité'}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            {product.is_for_sale && (
                              <Badge variant="secondary" className="bg-green-100 text-green-700">
                                En vente
                              </Badge>
                            )}
                            {product.is_stock_managed && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                Stock
                              </Badge>
                            )}
                            {product.is_composed && (
                              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                                Composé
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {product.is_for_sale && product.price_ht && (
                          <div className="text-right">
                            <p className="font-medium">
                              {(product.price_ht * (1 + (product.tax_rate || 0) / 100)).toFixed(2)} F
                            </p>
                            <p className="text-xs text-muted-foreground">TTC</p>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          {product.is_composed && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowComposition(true);
                              }}
                            >
                              <Layers className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            Modifier
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ProductCreationWizard
        open={showWizard}
        onClose={() => setShowWizard(false)}
        onSubmit={handleCreateProduct}
        categories={categories}
      />

      <ProductCompositionDialog
        open={showComposition}
        onClose={() => setShowComposition(false)}
        product={selectedProduct}
        availableProducts={products.filter(p => !p.is_composed && p.id !== selectedProduct?.id)}
      />
    </div>
  );
}